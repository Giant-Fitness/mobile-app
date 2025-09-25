// utils/offline/OfflineStorageService.ts

import { UserWeightMeasurement } from '@/types';

import { databaseManager, WeightMeasurementRecord } from './DatabaseManager';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

export interface OfflineStorageOptions {
    retentionDays?: number;
    enableCleanup?: boolean;
}

export interface CreateWeightMeasurementInput {
    userId: string;
    weight: number;
    measurementTimestamp: string;
}

export interface UpdateWeightMeasurementInput {
    weight?: number;
    measurementTimestamp?: string;
}

export interface WeightMeasurementWithStatus extends UserWeightMeasurement {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

export interface RetentionPolicy {
    retentionDays: number | 'unlimited';
    cleanupFrequency: 'daily' | 'weekly' | 'monthly';
    dataType: 'time_limited' | 'unlimited' | 'hybrid';
}

export class OfflineStorageService {
    private static instance: OfflineStorageService;
    private options: OfflineStorageOptions;
    private isInitialized = false;
    private operationQueue: Promise<any> = Promise.resolve(); // Serialized operation queue

    public static getInstance(options?: OfflineStorageOptions): OfflineStorageService {
        if (!OfflineStorageService.instance) {
            OfflineStorageService.instance = new OfflineStorageService(options);
        }
        return OfflineStorageService.instance;
    }

    private constructor(options: OfflineStorageOptions = {}) {
        this.options = {
            retentionDays: 90,
            enableCleanup: true,
            ...options,
        };
    }

    /**
     * Queue database operations to prevent concurrent access issues
     */
    private async queueOperation<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
        const result = this.operationQueue.then(async () => {
            try {
                if (operationName) {
                    console.log(`Starting queued operation: ${operationName}`);
                }
                return await operation();
            } catch (error) {
                console.error(`Queued operation failed${operationName ? ` (${operationName})` : ''}:`, error);
                throw error;
            }
        });

        // Update the queue, but don't let failures break subsequent operations
        this.operationQueue = result.catch(() => {});
        return result;
    }

    /**
     * Initialize the storage service
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }
        try {
            await databaseManager.initialize();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize OfflineStorageService:', error);
            throw error;
        }
    }

    // ==================== WEIGHT MEASUREMENTS ====================

    /**
     * Create a weight measurement (optimistic - stored locally immediately)
     */
    public async storeWeightMeasurement(input: CreateWeightMeasurementInput): Promise<string> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const localId = uuidv4();
            const now = new Date().toISOString();

            try {
                await db.runAsync(
                    `
                    INSERT INTO weight_measurements (
                        id, user_id, weight, measurement_timestamp, 
                        sync_status, created_at, updated_at, retry_count
                    ) VALUES (?, ?, ?, ?, 'local_only', ?, ?, 0)
                `,
                    [localId, input.userId, input.weight, input.measurementTimestamp, now, now],
                );

                console.log(`Weight measurement stored locally with ID: ${localId}`);
                return localId;
            } catch (error) {
                console.error('Failed to store weight measurement:', error);
                throw new Error(`Failed to store weight measurement: ${error}`);
            }
        }, 'storeWeightMeasurement');
    }

    /**
     * Get weight measurements for a user
     */
    public async getWeightMeasurements(
        userId: string,
        options?: {
            includeLocalOnly?: boolean;
            limit?: number;
            offset?: number;
            orderBy?: 'ASC' | 'DESC';
        },
    ): Promise<WeightMeasurementWithStatus[]> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const { includeLocalOnly = true, limit, offset = 0, orderBy = 'DESC' } = options || {};

            try {
                let query = `
                    SELECT * FROM weight_measurements 
                    WHERE user_id = ?
                `;

                const params: any[] = [userId];

                if (!includeLocalOnly) {
                    query += ` AND sync_status != 'local_only'`;
                }

                query += ` ORDER BY measurement_timestamp ${orderBy}`;

                if (limit) {
                    query += ` LIMIT ? OFFSET ?`;
                    params.push(limit, offset);
                }

                const rows = (await db.getAllAsync(query, params)) as WeightMeasurementRecord[];

                return rows.map((row) => this.transformToWeightMeasurementWithStatus(row));
            } catch (error) {
                console.error('Failed to get weight measurements:', error);
                throw error;
            }
        }, 'getWeightMeasurements');
    }

    /**
     * Get a single weight measurement by local ID
     */
    public async getWeightMeasurementById(localId: string): Promise<WeightMeasurementWithStatus | null> {
        this.ensureInitialized();

        const db = databaseManager.getDatabase();

        try {
            const row = (await db.getFirstAsync('SELECT * FROM weight_measurements WHERE id = ?', [localId])) as WeightMeasurementRecord | null;

            return row ? this.transformToWeightMeasurementWithStatus(row) : null;
        } catch (error) {
            console.error('Failed to get weight measurement by ID:', error);
            throw error;
        }
    }

    /**
     * Update a weight measurement
     */
    public async updateWeightMeasurement(localId: string, updates: UpdateWeightMeasurementInput): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const now = new Date().toISOString();

            try {
                const setParts: string[] = ['updated_at = ?'];
                const params: any[] = [now];

                if (updates.weight !== undefined) {
                    setParts.push('weight = ?');
                    params.push(updates.weight);
                }

                if (updates.measurementTimestamp !== undefined) {
                    setParts.push('measurement_timestamp = ?');
                    params.push(updates.measurementTimestamp);
                }

                // Reset sync status to local_only if we're updating a synced record
                setParts.push(`sync_status = CASE 
                    WHEN sync_status = 'synced' THEN 'local_only' 
                    ELSE sync_status 
                END`);

                params.push(localId);

                await db.runAsync(`UPDATE weight_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);

                console.log(`Weight measurement updated: ${localId}`);
            } catch (error) {
                console.error('Failed to update weight measurement:', error);
                throw error;
            }
        }, 'updateWeightMeasurement');
    }

    /**
     * Delete a weight measurement
     */
    public async deleteWeightMeasurement(localId: string): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();

            try {
                await db.runAsync('DELETE FROM weight_measurements WHERE id = ?', [localId]);

                console.log(`Weight measurement deleted: ${localId}`);
            } catch (error) {
                console.error('Failed to delete weight measurement:', error);
                throw error;
            }
        }, 'deleteWeightMeasurement');
    }

    /**
     * Get weight measurements that need syncing
     */
    public async getPendingWeightMeasurements(userId: string): Promise<WeightMeasurementWithStatus[]> {
        this.ensureInitialized();

        const db = databaseManager.getDatabase();

        try {
            const rows = (await db.getAllAsync(
                `
                SELECT * FROM weight_measurements 
                WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
                ORDER BY created_at ASC
            `,
                [userId],
            )) as WeightMeasurementRecord[];

            return rows.map((row) => this.transformToWeightMeasurementWithStatus(row));
        } catch (error) {
            console.error('Failed to get pending weight measurements:', error);
            throw error;
        }
    }

    /**
     * Update sync status after server operation
     */
    public async updateSyncStatus(
        localId: string,
        status: 'synced' | 'failed' | 'conflict',
        options?: {
            serverTimestamp?: string;
            errorMessage?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const now = new Date().toISOString();

            try {
                const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
                const params = [status, now, now];

                if (options?.serverTimestamp) {
                    setParts.push('server_timestamp = ?');
                    params.push(options.serverTimestamp);
                }

                if (options?.errorMessage) {
                    setParts.push('error_message = ?');
                    params.push(options.errorMessage);
                } else if (status === 'synced') {
                    setParts.push('error_message = NULL');
                }

                if (options?.incrementRetry) {
                    setParts.push('retry_count = retry_count + 1');
                } else if (status === 'synced') {
                    setParts.push('retry_count = 0');
                }

                params.push(localId);

                await db.runAsync(`UPDATE weight_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);

                console.log(`Sync status updated for ${localId}: ${status}`);
            } catch (error) {
                console.error('Failed to update sync status:', error);
                throw error;
            }
        }, 'updateSyncStatus');
    }

    /**
     * Merge server data with local data (handles conflicts)
     * Now queued to prevent concurrent access issues
     */
    public async mergeServerWeightMeasurements(userId: string, serverMeasurements: UserWeightMeasurement[]): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();

            try {
                await databaseManager.withTransaction(async () => {
                    for (const serverData of serverMeasurements) {
                        // Check if we already have this record
                        const existingRecord = (await db.getFirstAsync('SELECT * FROM weight_measurements WHERE user_id = ? AND measurement_timestamp = ?', [
                            userId,
                            serverData.MeasurementTimestamp,
                        ])) as WeightMeasurementRecord | null;

                        if (existingRecord) {
                            // Update existing record with server data
                            await db.runAsync(
                                `
                                UPDATE weight_measurements 
                                SET weight = ?, server_timestamp = ?, sync_status = 'synced', 
                                    updated_at = ?, retry_count = 0, error_message = NULL
                                WHERE id = ?
                            `,
                                [serverData.Weight, serverData.MeasurementTimestamp, new Date().toISOString(), existingRecord.id],
                            );
                        } else {
                            // Insert new server record
                            const localId = uuidv4();
                            const now = new Date().toISOString();

                            await db.runAsync(
                                `INSERT INTO weight_measurements (
                                    id, user_id, weight, measurement_timestamp,
                                    server_timestamp, sync_status, created_at, updated_at, retry_count
                                 ) VALUES (?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                                [localId, userId, serverData.Weight, serverData.MeasurementTimestamp, serverData.MeasurementTimestamp, now, now],
                            );
                        }
                    }
                });
                console.log(`Merged ${serverMeasurements.length} server weight measurements`);
            } catch (error) {
                console.error('Failed to merge server weight measurements:', error);
                throw error;
            }
        }, 'mergeServerWeightMeasurements');
    }

    // ==================== DATA RETENTION ====================

    /**
     * Clean up expired data based on retention policy
     */
    public async cleanupExpiredData(dataType: string, retentionDays: number): Promise<number> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            try {
                if (dataType === 'weight_measurements') {
                    return await databaseManager.cleanupOldWeightMeasurements(retentionDays);
                }

                console.warn(`Cleanup not implemented for data type: ${dataType}`);
                return 0;
            } catch (error) {
                console.error('Failed to cleanup expired data:', error);
                throw error;
            }
        }, 'cleanupExpiredData');
    }

    /**
     * Get retention policy for data type
     */
    public getRetentionPolicy(dataType: string): RetentionPolicy {
        switch (dataType) {
            case 'weight_measurements':
                return {
                    retentionDays: this.options.retentionDays || 90,
                    cleanupFrequency: 'daily',
                    dataType: 'time_limited',
                };
            default:
                return {
                    retentionDays: 'unlimited',
                    cleanupFrequency: 'monthly',
                    dataType: 'unlimited',
                };
        }
    }

    /**
     * Check if data is within retention period
     */
    public isWithinRetentionPeriod(timestamp: number, retentionDays: number): boolean {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        return timestamp > cutoffDate.getTime();
    }

    // ==================== UTILITIES ====================

    /**
     * Get storage statistics
     */
    public async getStorageStats(): Promise<{
        weightMeasurements: number;
        pendingSyncItems: number;
        failedSyncItems: number;
        databaseSize: number;
    }> {
        this.ensureInitialized();
        return await databaseManager.getStats();
    }

    /**
     * Clear all local data (for logout/reset)
     * Queued to ensure safe execution
     */
    public async clearAllData(): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();

            try {
                await databaseManager.withTransaction(async () => {
                    await db.execAsync('DELETE FROM weight_measurements;');
                    await db.execAsync('DELETE FROM sync_queue;');
                    await db.execAsync('DELETE FROM sync_metadata;');
                });

                console.log('All offline data cleared');
            } catch (error) {
                console.error('Failed to clear all data:', error);
                throw error;
            }
        }, 'clearAllData');
    }

    /**
     * Get current queue status for debugging
     */
    public getQueueStatus(): { isIdle: boolean } {
        // Check if the current promise in the queue has resolved
        // This is a simple way to determine if operations are pending
        return {
            isIdle: this.operationQueue === Promise.resolve(),
        };
    }

    // ==================== PRIVATE METHODS ====================

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('OfflineStorageService not initialized. Call initialize() first.');
        }
    }

    private transformToWeightMeasurementWithStatus(record: WeightMeasurementRecord): WeightMeasurementWithStatus {
        return {
            // UserWeightMeasurement properties
            UserId: record.user_id,
            MeasurementTimestamp: record.measurement_timestamp,
            Weight: record.weight,

            // Additional offline properties
            localId: record.id,
            syncStatus: record.sync_status,
            isLocalOnly: record.sync_status === 'local_only',
            retryCount: record.retry_count,
            errorMessage: record.error_message || undefined,
        };
    }
}

// Export singleton instance
export const offlineStorageService = OfflineStorageService.getInstance();
