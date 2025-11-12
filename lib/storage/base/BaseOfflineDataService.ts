// lib/storage/base/BaseOfflineDataService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { syncQueueManager } from '@/lib/sync/SyncQueueManager';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

export interface OfflineDataServiceOptions {
    tableName: string;
    retentionDays?: number;
    enableCleanup?: boolean;
}

export interface CreateRecordInput<T> {
    userId: string;
    data: T;
    timestamp: string;
}

export interface UpdateRecordInput<T> {
    localId: string;
    updates: Partial<T>;
}

export interface OfflineRecord<T> {
    localId: string;
    userId: string;
    data: T;
    timestamp: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecordQuery {
    includeLocalOnly?: boolean;
    limit?: number;
    offset?: number;
    orderBy?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
}

/**
 * Base class for all offline data services
 * Provides common CRUD operations and sync functionality
 */
export abstract class BaseOfflineDataService<TRecord, TCreateInput, TUpdateInput = Partial<TRecord>> {
    protected options: Required<OfflineDataServiceOptions>;
    protected isInitialized = false;
    protected operationQueue: Promise<any> = Promise.resolve();

    constructor(options: OfflineDataServiceOptions) {
        this.options = {
            retentionDays: 90,
            enableCleanup: true,
            ...options,
        };
    }

    /**
     * Initialize the service
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await databaseManager.initialize();
            await this.createTables();
            this.isInitialized = true;
        } catch (error) {
            console.error(`Failed to initialize ${this.options.tableName} service:`, error);
            throw error;
        }
    }

    /**
     * Queue operations to prevent concurrent access issues
     */
    protected async queueOperation<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
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

        this.operationQueue = result.catch(() => {});
        return result;
    }

    /**
     * Create a record (optimistic - stored locally immediately)
     */
    public async create(input: CreateRecordInput<TCreateInput>): Promise<string> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const localId = uuidv4();
            const now = new Date().toISOString();

            try {
                await this.insertRecord(db, localId, input.userId, input.data, input.timestamp, now);

                // Queue for server sync
                await syncQueueManager.queueOperation(this.options.tableName, 'CREATE', localId, { ...input, localId });

                console.log(`${this.options.tableName} stored locally with ID: ${localId}`);
                return localId;
            } catch (error) {
                console.error(`Failed to create ${this.options.tableName}:`, error);
                throw error;
            }
        }, `create${this.options.tableName}`);
    }

    /**
     * Get records for a user
     */
    public async getRecords(userId: string, query: RecordQuery = {}): Promise<OfflineRecord<TRecord>[]> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const { includeLocalOnly = true, limit, offset = 0, orderBy = 'DESC' } = query;

            try {
                const records = await this.selectRecords(db, userId, {
                    includeLocalOnly,
                    limit,
                    offset,
                    orderBy,
                });

                return records.map((row) => this.transformToOfflineRecord(row));
            } catch (error) {
                console.error(`Failed to get ${this.options.tableName}:`, error);
                throw error;
            }
        }, `get${this.options.tableName}`);
    }

    /**
     * Get a single record by local ID
     */
    public async getById(localId: string): Promise<OfflineRecord<TRecord> | null> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const row = await this.selectRecordById(db, localId);
            return row ? this.transformToOfflineRecord(row) : null;
        } catch (error) {
            console.error(`Failed to get ${this.options.tableName} by ID:`, error);
            throw error;
        }
    }

    /**
     * Update a record
     */
    public async update(localId: string, updates: TUpdateInput): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();

            try {
                await this.updateRecord(db, localId, updates);

                // Queue for server sync
                await syncQueueManager.queueOperation(this.options.tableName, 'UPDATE', localId, updates);

                console.log(`${this.options.tableName} updated: ${localId}`);
            } catch (error) {
                console.error(`Failed to update ${this.options.tableName}:`, error);
                throw error;
            }
        }, `update${this.options.tableName}`);
    }

    /**
     * Delete a record
     */
    public async delete(localId: string): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();

            try {
                const record = await this.selectRecordById(db, localId);
                if (!record) {
                    throw new Error(`${this.options.tableName} not found: ${localId}`);
                }

                // If synced record, queue for server deletion
                if (record.sync_status === 'synced') {
                    await syncQueueManager.queueOperation(this.options.tableName, 'DELETE', localId, this.extractDeleteData(record));
                }

                await this.deleteRecord(db, localId);
                console.log(`${this.options.tableName} deleted: ${localId}`);
            } catch (error) {
                console.error(`Failed to delete ${this.options.tableName}:`, error);
                throw error;
            }
        }, `delete${this.options.tableName}`);
    }

    /**
     * Get records that need syncing
     */
    public async getPendingRecords(userId: string): Promise<OfflineRecord<TRecord>[]> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const rows = await this.selectPendingRecords(db, userId);
            return rows.map((row) => this.transformToOfflineRecord(row));
        } catch (error) {
            console.error(`Failed to get pending ${this.options.tableName}:`, error);
            throw error;
        }
    }

    /**
     * Update sync status after server operation
     */
    public async updateSyncStatus(
        localId: string,
        status: 'synced' | 'failed' | 'conflict',
        options: {
            serverTimestamp?: string;
            errorMessage?: string;
            incrementRetry?: boolean;
        } = {},
    ): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            await this.updateRecordSyncStatus(db, localId, status, options);
        }, `updateSyncStatus${this.options.tableName}`);
    }

    /**
     * Merge server data with local data
     */
    public async mergeServerData(userId: string, serverRecords: TRecord[]): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            await databaseManager.withTransaction(async (db) => {
                for (const serverRecord of serverRecords) {
                    await this.mergeServerRecord(db, userId, serverRecord);
                }
            });
            console.log(`Merged ${serverRecords.length} server ${this.options.tableName}`);
        }, `mergeServer${this.options.tableName}`);
    }

    /**
     * Clean up expired data
     */
    public async cleanupExpiredData(): Promise<number> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            return await this.performCleanup(db, this.options.retentionDays);
        }, `cleanup${this.options.tableName}`);
    }

    protected ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error(`${this.options.tableName} service not initialized. Call initialize() first.`);
        }
    }

    // Abstract methods that each data service must implement
    protected abstract createTables(): Promise<void>;
    protected abstract insertRecord(db: any, localId: string, userId: string, data: TCreateInput, timestamp: string, now: string): Promise<void>;
    protected abstract selectRecords(db: any, userId: string, query: RecordQuery): Promise<any[]>;
    protected abstract selectRecordById(db: any, localId: string): Promise<any | null>;
    protected abstract updateRecord(db: any, localId: string, updates: TUpdateInput): Promise<void>;
    protected abstract deleteRecord(db: any, localId: string): Promise<void>;
    protected abstract selectPendingRecords(db: any, userId: string): Promise<any[]>;
    protected abstract updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void>;
    protected abstract mergeServerRecord(db: any, userId: string, serverRecord: TRecord): Promise<void>;
    protected abstract performCleanup(db: any, retentionDays: number): Promise<number>;
    protected abstract transformToOfflineRecord(row: any): OfflineRecord<TRecord>;
    protected abstract extractDeleteData(record: any): any;
}
