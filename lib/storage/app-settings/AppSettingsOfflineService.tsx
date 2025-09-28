// lib/storage/app-settings/AppSettingsOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserAppSettings, UserAppSettingsMeasurementUnitsItem } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// App settings specific types
export interface CreateAppSettingsInput {
    UnitsOfMeasurement: UserAppSettingsMeasurementUnitsItem;
}

export interface UpdateAppSettingsInput {
    UnitsOfMeasurement?: UserAppSettingsMeasurementUnitsItem;
}

export interface AppSettingsWithStatus extends UserAppSettings {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface AppSettingsRecord {
    id: string;
    user_id: string;
    units_of_measurement_json: string; // JSON stringified UserAppSettingsMeasurementUnitsItem
    server_updated_at?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class AppSettingsOfflineService extends BaseOfflineDataService<UserAppSettings, CreateAppSettingsInput, UpdateAppSettingsInput> {
    private static instance: AppSettingsOfflineService;

    public static getInstance(): AppSettingsOfflineService {
        if (!AppSettingsOfflineService.instance) {
            AppSettingsOfflineService.instance = new AppSettingsOfflineService();
        }
        return AppSettingsOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'app_settings',
            retentionDays: 365, // Keep app settings longer since there's only one per user
            enableCleanup: false, // No cleanup needed for single-record-per-user data
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS app_settings (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                units_of_measurement_json TEXT NOT NULL,
                server_updated_at TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT
            );
        `);

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_app_settings_user_id 
            ON app_settings(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_app_settings_sync_status 
            ON app_settings(sync_status);
        `);

        console.log('App settings table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateAppSettingsInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT OR REPLACE INTO app_settings (
                id, user_id, units_of_measurement_json,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, JSON.stringify(data.UnitsOfMeasurement), now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<AppSettingsRecord[]> {
        const { includeLocalOnly } = query;

        let sql = `SELECT * FROM app_settings WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        return (await db.getAllAsync(sql, params)) as AppSettingsRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<AppSettingsRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM app_settings WHERE id = ?', [localId])) as AppSettingsRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateAppSettingsInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.UnitsOfMeasurement !== undefined) {
            setParts.push('units_of_measurement_json = ?');
            params.push(JSON.stringify(updates.UnitsOfMeasurement));
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE app_settings SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM app_settings WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<AppSettingsRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM app_settings 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY updated_at DESC`,
            [userId],
        )) as AppSettingsRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.serverUpdatedAt) {
            setParts.push('server_updated_at = ?');
            params.push(options.serverUpdatedAt);
        }

        if (options.errorMessage) {
            setParts.push('error_message = ?');
            params.push(options.errorMessage);
        } else if (status === 'synced') {
            setParts.push('error_message = NULL');
        }

        if (options.incrementRetry) {
            setParts.push('retry_count = retry_count + 1');
        } else if (status === 'synced') {
            setParts.push('retry_count = 0');
        }

        params.push(localId);

        await db.runAsync(`UPDATE app_settings SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserAppSettings): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM app_settings WHERE user_id = ?', [userId])) as AppSettingsRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE app_settings 
                 SET units_of_measurement_json = ?, server_updated_at = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [JSON.stringify(serverRecord.UnitsOfMeasurement), new Date().toISOString(), new Date().toISOString(), existing.id],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO app_settings (
                    id, user_id, units_of_measurement_json,
                    server_updated_at, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [localId, userId, JSON.stringify(serverRecord.UnitsOfMeasurement), now, now, now],
            );
        }
    }

    /**
     * Merge single server record (override base class method that expects array)
     */
    public async mergeServerData(userId: string, serverRecord: UserAppSettings): Promise<void>;
    public async mergeServerData(userId: string, serverRecords: UserAppSettings[]): Promise<void>;
    public async mergeServerData(userId: string, serverData: UserAppSettings | UserAppSettings[]): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            await databaseManager.withTransaction(async (db) => {
                if (Array.isArray(serverData)) {
                    // Handle array of records (for compatibility)
                    for (const serverRecord of serverData) {
                        await this.mergeServerRecord(db, userId, serverRecord);
                    }
                    console.log(`Merged ${serverData.length} server ${this.options.tableName}`);
                } else {
                    // Handle single record (app settings case)
                    await this.mergeServerRecord(db, userId, serverData);
                    console.log(`Merged server ${this.options.tableName}`);
                }
            });
        }, `mergeServer${this.options.tableName}`);
    }

    protected async performCleanup(): Promise<number> {
        // No cleanup needed for app settings since there's only one per user
        // and we want to keep it indefinitely
        return 0;
    }

    protected transformToOfflineRecord(row: AppSettingsRecord): OfflineRecord<UserAppSettings> {
        const unitsOfMeasurement = JSON.parse(row.units_of_measurement_json) as UserAppSettingsMeasurementUnitsItem;

        const appSettings: UserAppSettings = {
            UserId: row.user_id,
            UnitsOfMeasurement: unitsOfMeasurement,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: appSettings,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: AppSettingsRecord): any {
        return {
            userId: record.user_id,
        };
    }

    // Convenience methods specific to app settings

    /**
     * Get the app settings for a user (since there's only one per user)
     */
    public async getSettingsForUser(userId: string): Promise<OfflineRecord<UserAppSettings> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Create or update app settings (upsert operation)
     */
    public async upsertSettings(input: { userId: string; data: CreateAppSettingsInput }): Promise<OfflineRecord<UserAppSettings>> {
        const existingSettings = await this.getSettingsForUser(input.userId);

        if (existingSettings) {
            // Update existing settings
            await this.update(existingSettings.localId, input.data);
            const updated = await this.getById(existingSettings.localId);
            if (!updated) {
                throw new Error('Failed to retrieve updated app settings');
            }
            return updated;
        } else {
            // Create new settings
            const localId = await this.create({
                userId: input.userId,
                data: input.data,
                timestamp: new Date().toISOString(),
            });

            // Retrieve the created record
            const created = await this.getById(localId);
            if (!created) {
                throw new Error('Failed to retrieve created app settings');
            }
            return created;
        }
    }

    public transformToAppSettingsWithStatus(record: AppSettingsRecord): AppSettingsWithStatus {
        const unitsOfMeasurement = JSON.parse(record.units_of_measurement_json) as UserAppSettingsMeasurementUnitsItem;

        return {
            UserId: record.user_id,
            UnitsOfMeasurement: unitsOfMeasurement,

            // Offline-specific properties
            localId: record.id,
            syncStatus: record.sync_status,
            isLocalOnly: record.sync_status === 'local_only',
            retryCount: record.retry_count,
            errorMessage: record.error_message || undefined,
        };
    }
}

// Export singleton instance
export const appSettingsOfflineService = AppSettingsOfflineService.getInstance();
