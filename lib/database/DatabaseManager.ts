// lib/database/DatabaseManager.ts

import * as SQLite from 'expo-sqlite';

export interface DatabaseConnection {
    database: SQLite.SQLiteDatabase;
}

export interface WeightMeasurementRecord {
    id: string; // Local UUID
    user_id: string;
    weight: number;
    measurement_timestamp: string; // ISO string
    server_timestamp?: string; // Server's timestamp after sync
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string; // Local creation time
    updated_at: string; // Last local update
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export interface SyncQueueRecord {
    id: string; // Local UUID
    table_name: string; // 'weight_measurements', 'sleep_measurements', etc.
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    record_id: string; // References the local record ID
    data: string; // JSON stringified data
    created_at: string;
    retry_count: number;
    last_attempt?: string;
    error_message?: string;
    priority: number; // Higher = more urgent
}

export interface SyncMetadata {
    key: string;
    value: string;
    updated_at: string;
}

export class DatabaseManager {
    private static instance: DatabaseManager;
    private database: SQLite.SQLiteDatabase | null = null;
    private isInitialized = false;
    private isInTransaction = false; // Track transaction state
    private readonly DB_NAME = 'kyn_offline.db';
    private readonly DB_VERSION = 1;

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * Initialize database and run migrations
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized && this.database) {
            return;
        }

        try {
            console.log('Initializing SQLite database...');

            this.database = await SQLite.openDatabaseAsync(this.DB_NAME);

            // Enable foreign keys and WAL mode for better performance
            await this.database.execAsync('PRAGMA foreign_keys = ON;');
            await this.database.execAsync('PRAGMA journal_mode = WAL;');

            // Create tables - pass database instance
            await this.createTables(this.database);

            // Run migrations if needed - pass database instance
            await this.runMigrations(this.database);

            this.isInitialized = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw new Error(`Database initialization failed: ${error}`);
        }
    }

    /**
     * Close database connection
     */
    public async close(): Promise<void> {
        if (this.database) {
            await this.database.closeAsync();
            this.database = null;
            this.isInitialized = false;
            this.isInTransaction = false; // Reset transaction state
            console.log('Database connection closed');
        }
    }

    /**
     * Get database instance (throws if not initialized)
     */
    public getDatabase(): SQLite.SQLiteDatabase {
        if (!this.database || !this.isInitialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.database;
    }

    /**
     * Execute a transaction with rollback capability
     * Handles nested transaction attempts gracefully
     */
    public async withTransaction<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
        const db = this.getDatabase();

        // If already in transaction, just execute the operation
        if (this.isInTransaction) {
            console.log('Already in transaction, executing operation directly');
            return await operation(db);
        }

        try {
            this.isInTransaction = true;
            await db.execAsync('BEGIN TRANSACTION;');
            const result = await operation(db);
            await db.execAsync('COMMIT;');
            return result;
        } catch (error) {
            await db.execAsync('ROLLBACK;');
            console.error('Transaction failed, rolled back:', error);
            throw error;
        } finally {
            this.isInTransaction = false;
        }
    }

    /**
     * Check if currently in a transaction
     */
    public isCurrentlyInTransaction(): boolean {
        return this.isInTransaction;
    }

    /**
     * Clean up old weight measurements (data retention)
     */
    public async cleanupOldWeightMeasurements(retentionDays: number = 90): Promise<number> {
        const db = this.getDatabase();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        try {
            const result = await db.runAsync(
                `DELETE FROM weight_measurements 
                 WHERE measurement_timestamp < ? AND sync_status = 'synced'`,
                [cutoffDate.toISOString()],
            );

            console.log(`Cleaned up ${result.changes} old weight measurements`);
            return result.changes;
        } catch (error) {
            console.error('Failed to cleanup old weight measurements:', error);
            throw error;
        }
    }

    /**
     * Get database statistics for debugging
     */
    public async getStats(): Promise<{
        weightMeasurements: number;
        pendingSyncItems: number;
        failedSyncItems: number;
        databaseSize: number;
    }> {
        const db = this.getDatabase();

        try {
            const weightCount = (await db.getFirstAsync('SELECT COUNT(*) as count FROM weight_measurements')) as { count: number };

            const pendingCount = (await db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue')) as { count: number };

            const failedCount = (await db.getFirstAsync(
                `SELECT COUNT(*) as count FROM weight_measurements 
                 WHERE sync_status = 'failed'`,
            )) as { count: number };

            // Get database file size (approximate)
            const sizeQuery = (await db.getFirstAsync('PRAGMA page_count')) as { page_count: number };
            const pageSize = (await db.getFirstAsync('PRAGMA page_size')) as { page_size: number };
            const dbSize = (sizeQuery?.page_count || 0) * (pageSize?.page_size || 0);

            return {
                weightMeasurements: weightCount?.count || 0,
                pendingSyncItems: pendingCount?.count || 0,
                failedSyncItems: failedCount?.count || 0,
                databaseSize: dbSize,
            };
        } catch (error) {
            console.error('Failed to get database stats:', error);
            throw error;
        }
    }

    private async createTables(db: SQLite.SQLiteDatabase): Promise<void> {
        // Weight measurements table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS weight_measurements (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                weight REAL NOT NULL,
                measurement_timestamp TEXT NOT NULL,
                server_timestamp TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT,
                UNIQUE(user_id, measurement_timestamp)
            );
        `);

        // Body measurements table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS body_measurements (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                measurements_json TEXT NOT NULL,
                measurement_timestamp TEXT NOT NULL,
                server_timestamp TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT,
                UNIQUE(user_id, measurement_timestamp)
            );
        `);

        // Sync queue table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY,
                table_name TEXT NOT NULL,
                operation TEXT NOT NULL,
                record_id TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_attempt TEXT,
                error_message TEXT,
                priority INTEGER DEFAULT 1
            );
        `);

        // Sync metadata table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sync_metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        `);

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_weight_user_timestamp 
            ON weight_measurements(user_id, measurement_timestamp);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_weight_sync_status 
            ON weight_measurements(sync_status);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_sync_queue_priority 
            ON sync_queue(priority DESC, created_at ASC);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_sync_queue_table_operation 
            ON sync_queue(table_name, operation);
        `);
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_body_user_timestamp 
            ON body_measurements(user_id, measurement_timestamp);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_body_sync_status 
            ON body_measurements(sync_status);
        `);

        console.log('Database tables created successfully');
    }

    private async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
        // Get current schema version
        let currentVersion = 0;
        try {
            const versionResult = (await db.getFirstAsync('SELECT value FROM sync_metadata WHERE key = ?', ['schema_version'])) as { value: string } | null;

            currentVersion = versionResult ? parseInt(versionResult.value) : 0;
        } catch {
            // sync_metadata table might not exist yet
        }

        console.log(`Current schema version: ${currentVersion}, target: ${this.DB_VERSION}`);

        // Run migrations if needed
        if (currentVersion < this.DB_VERSION) {
            // Use the passed db instance directly for transaction during initialization
            // instead of this.withTransaction() which calls this.getDatabase()
            try {
                // Directly manage transaction state during initialization
                const wasInTransaction = this.isInTransaction;
                this.isInTransaction = true;

                await db.execAsync('BEGIN TRANSACTION;');

                for (let version = currentVersion + 1; version <= this.DB_VERSION; version++) {
                    console.log(`Running migration to version ${version}`);
                    await this.runMigrationForVersion(db, version);
                }

                // Update schema version
                await db.runAsync(
                    `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) 
                 VALUES (?, ?, ?)`,
                    ['schema_version', this.DB_VERSION.toString(), new Date().toISOString()],
                );

                await db.execAsync('COMMIT;');
                this.isInTransaction = wasInTransaction;
            } catch (error) {
                await db.execAsync('ROLLBACK;');
                this.isInTransaction = false;
                console.error('Migration transaction failed, rolled back:', error);
                throw error;
            }

            console.log(`Database migrated to version ${this.DB_VERSION}`);
        }
    }

    private async runMigrationForVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
        switch (version) {
            case 1:
                // Initial schema - already created in createTables()
                console.log('Migration v1: Initial schema (already created)');
                break;

            // Future migrations will go here
            // case 2:
            //     await db.execAsync('ALTER TABLE weight_measurements ADD COLUMN new_field TEXT;');
            //     break;

            default:
                console.warn(`Unknown migration version: ${version}`);
        }
    }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
