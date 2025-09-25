// utils/offline/SyncQueueService.ts

import UserService from '@/store/user/service';
import { UserWeightMeasurement } from '@/types';

import { databaseManager, SyncQueueRecord } from './DatabaseManager';
import { networkStateManager } from './NetworkStateManager';
import { offlineStorageService } from './OfflineStorageService';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

export interface SyncQueueEntry {
    id: string;
    tableName: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    recordId: string;
    data: any;
    createdAt: string;
    retryCount: number;
    priority: number;
    lastAttempt?: string;
    errorMessage?: string;
}

export interface SyncResult {
    success: boolean;
    operation: string;
    recordId: string;
    error?: string;
    serverData?: any;
}

export interface SyncStatus {
    isProcessing: boolean;
    pendingCount: number;
    failedCount: number;
    lastSyncAttempt?: string;
    lastSuccessfulSync?: string;
}

export interface SyncOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    batchSize?: number;
    respectExpensiveConnection?: boolean;
}

export class SyncQueueService {
    private static instance: SyncQueueService;
    private isProcessing = false;
    private isInitialized = false;
    private networkUnsubscribe?: () => void;
    private retryTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private statusCallbacks: Set<(status: SyncStatus) => void> = new Set();

    private readonly options: Required<SyncOptions> = {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        batchSize: 10,
        respectExpensiveConnection: true,
    };

    public static getInstance(options?: SyncOptions): SyncQueueService {
        if (!SyncQueueService.instance) {
            SyncQueueService.instance = new SyncQueueService(options);
        }
        return SyncQueueService.instance;
    }

    private constructor(options?: SyncOptions) {
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    /**
     * Initialize sync queue service
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            await offlineStorageService.initialize();

            // Listen for network reconnection to trigger immediate sync
            this.networkUnsubscribe = networkStateManager.onReconnect(() => {
                console.log('Network reconnected, processing sync queue...');
                this.processQueueImmediate();
            });

            this.isInitialized = true;
            console.log('SyncQueueService initialized');

            // Process any existing queue items
            setTimeout(() => this.processQueueImmediate(), 1000);
        } catch (error) {
            console.error('Failed to initialize SyncQueueService:', error);
            throw error;
        }
    }

    /**
     * Cleanup sync queue service
     */
    public cleanup(): void {
        // Clear all retry timeouts
        this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.retryTimeouts.clear();

        // Unsubscribe from network events
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }

        // Clear callbacks
        this.statusCallbacks.clear();

        this.isInitialized = false;
        console.log('SyncQueueService cleaned up');
    }

    // ==================== QUEUE OPERATIONS ====================

    /**
     * Add weight measurement to sync queue and attempt immediate sync
     */
    public async queueWeightMeasurement(operation: 'CREATE' | 'UPDATE' | 'DELETE', localId: string, data?: any): Promise<void> {
        this.ensureInitialized();

        try {
            await this.addToQueue({
                tableName: 'weight_measurements',
                operation,
                recordId: localId,
                data: data || {},
                priority: operation === 'DELETE' ? 3 : operation === 'UPDATE' ? 2 : 1,
            });

            console.log(`Queued weight measurement ${operation}: ${localId}`);

            // Attempt immediate sync
            this.processQueueImmediate();
        } catch (error) {
            console.error('Failed to queue weight measurement:', error);
            throw error;
        }
    }

    /**
     * Add generic entry to sync queue
     */
    private async addToQueue(entry: {
        tableName: string;
        operation: 'CREATE' | 'UPDATE' | 'DELETE';
        recordId: string;
        data: any;
        priority: number;
    }): Promise<SyncQueueEntry> {
        const db = databaseManager.getDatabase();
        const queueId = uuidv4();
        const now = new Date().toISOString();

        const queueEntry: SyncQueueEntry = {
            id: queueId,
            tableName: entry.tableName,
            operation: entry.operation,
            recordId: entry.recordId,
            data: entry.data,
            createdAt: now,
            retryCount: 0,
            priority: entry.priority,
        };

        await db.runAsync(
            `
            INSERT INTO sync_queue (
                id, table_name, operation, record_id, data, 
                created_at, retry_count, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [queueId, entry.tableName, entry.operation, entry.recordId, JSON.stringify(entry.data), now, 0, entry.priority],
        );

        this.notifyStatusCallbacks();
        return queueEntry;
    }

    /**
     * Remove entry from sync queue
     */
    private async removeFromQueue(queueId: string): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [queueId]);

        // Clear any pending retry timeout
        const timeout = this.retryTimeouts.get(queueId);
        if (timeout) {
            clearTimeout(timeout);
            this.retryTimeouts.delete(queueId);
        }

        this.notifyStatusCallbacks();
    }

    // ==================== SYNC PROCESSING ====================

    /**
     * Process sync queue immediately (non-blocking)
     */
    public processQueueImmediate(): void {
        // Don't wait for this to complete
        this.processQueue().catch((error) => {
            console.error('Background queue processing failed:', error);
        });
    }

    /**
     * Process sync queue with proper error handling and batching
     */
    public async processQueue(): Promise<SyncResult[]> {
        if (this.isProcessing || !networkStateManager.isOnline()) {
            return [];
        }

        this.isProcessing = true;
        const results: SyncResult[] = [];

        try {
            this.notifyStatusCallbacks();

            // Respect expensive connections
            if (this.options.respectExpensiveConnection && networkStateManager.isExpensiveConnection()) {
                console.log('Skipping sync on expensive connection');
                return [];
            }

            const queueEntries = await this.getQueueEntries();

            if (queueEntries.length === 0) {
                return [];
            }

            console.log(`Processing ${queueEntries.length} sync queue entries`);

            // Process entries in batches
            for (let i = 0; i < queueEntries.length; i += this.options.batchSize) {
                const batch = queueEntries.slice(i, i + this.options.batchSize);
                const batchResults = await this.processBatch(batch);
                results.push(...batchResults);

                // Small delay between batches to avoid overwhelming the server
                if (i + this.options.batchSize < queueEntries.length) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }

            // Update last successful sync time if we had any successes
            if (results.some((r) => r.success)) {
                await this.updateSyncMetadata('last_successful_sync', new Date().toISOString());
            }
        } catch (error) {
            console.error('Sync queue processing failed:', error);
        } finally {
            this.isProcessing = false;
            await this.updateSyncMetadata('last_sync_attempt', new Date().toISOString());
            this.notifyStatusCallbacks();
        }

        return results;
    }

    /**
     * Process a batch of sync entries
     */
    private async processBatch(entries: SyncQueueEntry[]): Promise<SyncResult[]> {
        const results: SyncResult[] = [];

        for (const entry of entries) {
            try {
                const result = await this.processSingleEntry(entry);
                results.push(result);

                if (result.success) {
                    await this.removeFromQueue(entry.id);
                } else {
                    await this.handleSyncFailure(entry, result.error || 'Unknown error');
                }
            } catch (error) {
                console.error(`Failed to process sync entry ${entry.id}:`, error);
                await this.handleSyncFailure(entry, error instanceof Error ? error.message : 'Processing error');

                results.push({
                    success: false,
                    operation: `${entry.tableName}:${entry.operation}`,
                    recordId: entry.recordId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return results;
    }

    /**
     * Process a single sync entry
     */
    private async processSingleEntry(entry: SyncQueueEntry): Promise<SyncResult> {
        console.log(`Processing sync entry: ${entry.tableName}:${entry.operation}:${entry.recordId}`);

        switch (entry.tableName) {
            case 'weight_measurements':
                return await this.syncWeightMeasurement(entry);

            // Future data types will be added here
            // case 'sleep_measurements':
            //     return await this.syncSleepMeasurement(entry);

            default:
                throw new Error(`Unknown table name: ${entry.tableName}`);
        }
    }

    /**
     * Sync weight measurement with server
     */
    private async syncWeightMeasurement(entry: SyncQueueEntry): Promise<SyncResult> {
        // For DELETE operations, we don't need the local record since it's already deleted
        // Use the data stored in the queue entry instead
        if (entry.operation === 'DELETE') {
            try {
                console.log(`Processing DELETE sync entry: ${entry.recordId}`);

                // Extract data from queue entry for DELETE operations
                const { userId, measurementTimestamp } = entry.data;

                if (!userId || !measurementTimestamp) {
                    throw new Error(`Missing required data for DELETE operation: userId=${userId}, measurementTimestamp=${measurementTimestamp}`);
                }

                // Delete from server
                await UserService.deleteWeightMeasurement(userId, measurementTimestamp);

                console.log(`Successfully deleted weight measurement from server: ${measurementTimestamp}`);

                return {
                    success: true,
                    operation: `weight_measurements:${entry.operation}`,
                    recordId: entry.recordId,
                };
            } catch (error) {
                console.error(`Failed to delete weight measurement from server:`, error);
                throw error;
            }
        }

        // For CREATE/UPDATE operations, we need the local record
        const localRecord = await offlineStorageService.getWeightMeasurementById(entry.recordId);

        if (!localRecord) {
            throw new Error(`Local weight measurement not found: ${entry.recordId}`);
        }

        try {
            let serverResponse: UserWeightMeasurement;

            switch (entry.operation) {
                case 'CREATE':
                    serverResponse = await UserService.logWeightMeasurement(localRecord.UserId, localRecord.Weight, localRecord.MeasurementTimestamp);
                    break;

                case 'UPDATE':
                    serverResponse = await UserService.updateWeightMeasurement(localRecord.UserId, localRecord.MeasurementTimestamp, localRecord.Weight);
                    break;

                default:
                    throw new Error(`Unknown operation: ${entry.operation}`);
            }

            // Update local record with server response - FIXED: removed serverId
            await offlineStorageService.updateSyncStatus(entry.recordId, 'synced', {
                serverTimestamp: serverResponse.MeasurementTimestamp,
            });

            return {
                success: true,
                operation: `weight_measurements:${entry.operation}`,
                recordId: entry.recordId,
                serverData: serverResponse,
            };
        } catch (error) {
            // Update local record with failure (only for CREATE/UPDATE since DELETE records don't exist)
            await offlineStorageService.updateSyncStatus(entry.recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Sync failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Handle sync failure with exponential backoff retry
     */
    private async handleSyncFailure(entry: SyncQueueEntry, errorMessage: string): Promise<void> {
        const db = databaseManager.getDatabase();
        const retryCount = entry.retryCount + 1;
        const now = new Date().toISOString();

        // Update retry count and error message
        await db.runAsync(
            `
            UPDATE sync_queue 
            SET retry_count = ?, error_message = ?, last_attempt = ?
            WHERE id = ?
        `,
            [retryCount, errorMessage, now, entry.id],
        );

        // Check if we've exceeded max retries
        if (retryCount >= this.options.maxRetries) {
            console.warn(`Max retries exceeded for sync entry: ${entry.id}, removing from queue`);
            await this.removeFromQueue(entry.id);
            return;
        }

        // Schedule exponential backoff retry
        const delayMs = Math.min(this.options.baseDelayMs * Math.pow(2, retryCount - 1), this.options.maxDelayMs);

        console.log(`Scheduling retry for ${entry.id} in ${delayMs}ms (attempt ${retryCount}/${this.options.maxRetries})`);

        const timeout = setTimeout(() => {
            this.retryTimeouts.delete(entry.id);
            this.processQueueImmediate();
        }, delayMs);

        this.retryTimeouts.set(entry.id, timeout);
    }

    // ==================== QUEUE QUERIES ====================

    /**
     * Get queue entries ordered by priority and creation time
     */
    private async getQueueEntries(): Promise<SyncQueueEntry[]> {
        const db = databaseManager.getDatabase();

        const rows = (await db.getAllAsync(`
            SELECT * FROM sync_queue 
            ORDER BY priority DESC, created_at ASC
        `)) as SyncQueueRecord[];

        return rows.map((row) => ({
            id: row.id,
            tableName: row.table_name,
            operation: row.operation as 'CREATE' | 'UPDATE' | 'DELETE',
            recordId: row.record_id,
            data: JSON.parse(row.data),
            createdAt: row.created_at,
            retryCount: row.retry_count,
            priority: row.priority,
            lastAttempt: row.last_attempt,
            errorMessage: row.error_message,
        }));
    }

    /**
     * Get current sync status
     */
    public async getSyncStatus(): Promise<SyncStatus> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const pendingCount = (await db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue')) as { count: number };

            const failedCount = (await db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue WHERE retry_count >= ?', [this.options.maxRetries - 1])) as {
                count: number;
            };

            const lastSyncAttempt = (await db.getFirstAsync('SELECT value FROM sync_metadata WHERE key = ?', ['last_sync_attempt'])) as {
                value: string;
            } | null;

            const lastSuccessfulSync = (await db.getFirstAsync('SELECT value FROM sync_metadata WHERE key = ?', ['last_successful_sync'])) as {
                value: string;
            } | null;

            return {
                isProcessing: this.isProcessing,
                pendingCount: pendingCount?.count || 0,
                failedCount: failedCount?.count || 0,
                lastSyncAttempt: lastSyncAttempt?.value,
                lastSuccessfulSync: lastSuccessfulSync?.value,
            };
        } catch (error) {
            console.error('Failed to get sync status:', error);
            throw error;
        }
    }

    /**
     * Subscribe to sync status changes
     */
    public onStatusChange(callback: (status: SyncStatus) => void): () => void {
        this.statusCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.statusCallbacks.delete(callback);
        };
    }

    // ==================== UTILITIES ====================

    /**
     * Force sync all pending items (manual trigger)
     */
    public async forceSyncAll(): Promise<SyncResult[]> {
        console.log('Force syncing all pending items...');
        return await this.processQueue();
    }

    /**
     * Clear all failed items from queue
     */
    public async clearFailedItems(): Promise<number> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        const result = await db.runAsync('DELETE FROM sync_queue WHERE retry_count >= ?', [this.options.maxRetries]);

        console.log(`Cleared ${result.changes} failed sync items`);
        this.notifyStatusCallbacks();

        return result.changes;
    }

    private async updateSyncMetadata(key: string, value: string): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.runAsync('INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, ?, ?)', [key, value, new Date().toISOString()]);
    }

    private async notifyStatusCallbacks(): Promise<void> {
        try {
            const status = await this.getSyncStatus();
            this.statusCallbacks.forEach((callback) => {
                try {
                    callback(status);
                } catch (error) {
                    console.error('Error in sync status callback:', error);
                }
            });
        } catch (error) {
            console.error('Failed to notify status callbacks:', error);
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('SyncQueueService not initialized. Call initialize() first.');
        }
    }
}

// Export singleton instance
export const syncQueueService = SyncQueueService.getInstance();
