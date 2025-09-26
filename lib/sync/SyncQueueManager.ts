// lib/sync/SyncQueueManager.ts

import { databaseManager, SyncQueueRecord } from '@/lib/database/DatabaseManager';

import { networkStateManager } from './NetworkStateManager';

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

/**
 * Generic sync queue manager that works with any data type
 * Data-specific logic is handled by registering sync handlers
 */
export class SyncQueueManager {
    private static instance: SyncQueueManager;

    private isProcessing = false;
    private isInitialized = false;
    private networkUnsubscribe?: () => void;
    private retryTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private statusCallbacks: Set<(status: SyncStatus) => void> = new Set();

    // Registry of sync handlers by table name
    private syncHandlers: Map<string, SyncHandler> = new Map();

    private readonly options: Required<SyncOptions> = {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        batchSize: 10,
        respectExpensiveConnection: true,
    };

    public static getInstance(options?: SyncOptions): SyncQueueManager {
        if (!SyncQueueManager.instance) {
            SyncQueueManager.instance = new SyncQueueManager(options);
        }
        return SyncQueueManager.instance;
    }

    private constructor(options?: SyncOptions) {
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    /**
     * Register a sync handler for a specific data type
     */
    public registerSyncHandler(tableName: string, handler: SyncHandler): void {
        this.syncHandlers.set(tableName, handler);
        console.log(`Registered sync handler for ${tableName}`);
    }

    /**
     * Initialize sync queue manager
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await databaseManager.initialize();

            // Listen for network reconnection
            this.networkUnsubscribe = networkStateManager.onReconnect(() => {
                console.log('Network reconnected, processing sync queue...');
                this.processQueueImmediate();
            });

            this.isInitialized = true;
            console.log('SyncQueueManager initialized');

            // Process any existing queue items
            setTimeout(() => this.processQueueImmediate(), 1000);
        } catch (error) {
            console.error('Failed to initialize SyncQueueManager:', error);
            throw error;
        }
    }

    /**
     * Generic method to queue any operation
     */
    public async queueOperation(
        tableName: string,
        operation: 'CREATE' | 'UPDATE' | 'DELETE',
        recordId: string,
        data: any,
        priority: number = 1,
    ): Promise<void> {
        this.ensureInitialized();

        try {
            await this.addToQueue({
                tableName,
                operation,
                recordId,
                data,
                priority,
            });

            console.log(`Queued ${tableName} ${operation}: ${recordId}`);

            // Attempt immediate sync
            this.processQueueImmediate();
        } catch (error) {
            console.error(`Failed to queue ${tableName} operation:`, error);
            throw error;
        }
    }

    /**
     * Process sync queue immediately (non-blocking)
     */
    public processQueueImmediate(): void {
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

                // Small delay between batches
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
     * Process a single sync entry using registered handlers
     */
    private async processSingleEntry(entry: SyncQueueEntry): Promise<SyncResult> {
        console.log(`Processing sync entry: ${entry.tableName}:${entry.operation}:${entry.recordId}`);

        const handler = this.syncHandlers.get(entry.tableName);
        if (!handler) {
            throw new Error(`No sync handler registered for table: ${entry.tableName}`);
        }

        try {
            const serverData = await handler.syncToServer(entry.operation, entry.recordId, entry.data);

            return {
                success: true,
                operation: `${entry.tableName}:${entry.operation}`,
                recordId: entry.recordId,
                serverData,
            };
        } catch (error) {
            console.error(`Sync failed for ${entry.tableName}:${entry.operation}:`, error);

            // Update local record sync status if handler supports it
            if (entry.operation !== 'DELETE' && handler.updateLocalSyncStatus) {
                await handler.updateLocalSyncStatus(entry.recordId, 'failed', {
                    errorMessage: error instanceof Error ? error.message : 'Sync failed',
                    incrementRetry: true,
                });
            }

            throw error;
        }
    }

    // ... rest of the methods remain similar but work generically
    private async addToQueue(entry: {
        tableName: string;
        operation: 'CREATE' | 'UPDATE' | 'DELETE';
        recordId: string;
        data: any;
        priority: number;
    }): Promise<SyncQueueEntry> {
        const db = databaseManager.getDatabase();
        const queueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            `INSERT INTO sync_queue (
                id, table_name, operation, record_id, data, 
                created_at, retry_count, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [queueId, entry.tableName, entry.operation, entry.recordId, JSON.stringify(entry.data), now, 0, entry.priority],
        );

        this.notifyStatusCallbacks();
        return queueEntry;
    }

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

    private async handleSyncFailure(entry: SyncQueueEntry, errorMessage: string): Promise<void> {
        const db = databaseManager.getDatabase();
        const retryCount = entry.retryCount + 1;
        const now = new Date().toISOString();

        await db.runAsync(
            `UPDATE sync_queue 
             SET retry_count = ?, error_message = ?, last_attempt = ?
             WHERE id = ?`,
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

    // ... other helper methods ...

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

    public onStatusChange(callback: (status: SyncStatus) => void): () => void {
        this.statusCallbacks.add(callback);
        return () => this.statusCallbacks.delete(callback);
    }

    public async forceSyncAll(): Promise<SyncResult[]> {
        console.log('Force syncing all pending items...');
        return await this.processQueue();
    }

    public async clearFailedItems(): Promise<number> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        const result = await db.runAsync('DELETE FROM sync_queue WHERE retry_count >= ?', [this.options.maxRetries]);

        console.log(`Cleared ${result.changes} failed sync items`);
        this.notifyStatusCallbacks();

        return result.changes;
    }

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('SyncQueueManager not initialized. Call initialize() first.');
        }
    }

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
        console.log('SyncQueueManager cleaned up');
    }
}

/**
 * Interface that data-specific services must implement for sync functionality
 */
export interface SyncHandler {
    /**
     * Sync a local record to the server
     */
    syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<any>;

    /**
     * Update local record sync status (optional - used for CREATE/UPDATE operations)
     */
    updateLocalSyncStatus?(
        recordId: string,
        status: 'synced' | 'failed' | 'conflict',
        options: {
            errorMessage?: string;
            serverTimestamp?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void>;
}

// Export singleton instance
export const syncQueueManager = SyncQueueManager.getInstance();
