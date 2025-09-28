// lib/storage/weight-measurements/WeightMeasurementOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserWeightMeasurement } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Weight measurement specific types
export interface CreateWeightMeasurementInput {
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

interface WeightMeasurementRecord {
    id: string;
    user_id: string;
    weight: number;
    measurement_timestamp: string;
    server_timestamp?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class WeightMeasurementOfflineService extends BaseOfflineDataService<UserWeightMeasurement, CreateWeightMeasurementInput, UpdateWeightMeasurementInput> {
    private static instance: WeightMeasurementOfflineService;

    public static getInstance(): WeightMeasurementOfflineService {
        if (!WeightMeasurementOfflineService.instance) {
            WeightMeasurementOfflineService.instance = new WeightMeasurementOfflineService();
        }
        return WeightMeasurementOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'weight_measurements',
            retentionDays: 365,
            enableCleanup: true,
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

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

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_weight_user_timestamp 
            ON weight_measurements(user_id, measurement_timestamp);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_weight_sync_status 
            ON weight_measurements(sync_status);
        `);

        console.log('Weight measurements table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateWeightMeasurementInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT INTO weight_measurements (
                id, user_id, weight, measurement_timestamp,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, data.weight, data.measurementTimestamp, now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<WeightMeasurementRecord[]> {
        const { includeLocalOnly, limit, offset, orderBy } = query;

        let sql = `SELECT * FROM weight_measurements WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        sql += ` ORDER BY measurement_timestamp ${orderBy}`;

        if (limit) {
            sql += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        return (await db.getAllAsync(sql, params)) as WeightMeasurementRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<WeightMeasurementRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM weight_measurements WHERE id = ?', [localId])) as WeightMeasurementRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateWeightMeasurementInput): Promise<void> {
        const now = new Date().toISOString();
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

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE weight_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM weight_measurements WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<WeightMeasurementRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM weight_measurements 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY created_at ASC`,
            [userId],
        )) as WeightMeasurementRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.serverTimestamp) {
            setParts.push('server_timestamp = ?');
            params.push(options.serverTimestamp);
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

        await db.runAsync(`UPDATE weight_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserWeightMeasurement): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM weight_measurements WHERE user_id = ? AND measurement_timestamp = ?', [
            userId,
            serverRecord.MeasurementTimestamp,
        ])) as WeightMeasurementRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE weight_measurements 
                 SET weight = ?, server_timestamp = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [serverRecord.Weight, serverRecord.MeasurementTimestamp, new Date().toISOString(), existing.id],
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
                [localId, userId, serverRecord.Weight, serverRecord.MeasurementTimestamp, serverRecord.MeasurementTimestamp, now, now],
            );
        }
    }

    protected async performCleanup(db: any, retentionDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await db.runAsync(
            `DELETE FROM weight_measurements 
             WHERE measurement_timestamp < ? AND sync_status = 'synced'`,
            [cutoffDate.toISOString()],
        );

        console.log(`Cleaned up ${result.changes} old weight measurements`);
        return result.changes;
    }

    protected transformToOfflineRecord(row: WeightMeasurementRecord): OfflineRecord<UserWeightMeasurement> {
        const weightMeasurement: UserWeightMeasurement = {
            UserId: row.user_id,
            MeasurementTimestamp: row.measurement_timestamp,
            Weight: row.weight,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: weightMeasurement,
            timestamp: row.measurement_timestamp,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: WeightMeasurementRecord): any {
        return {
            userId: record.user_id,
            measurementTimestamp: record.measurement_timestamp,
        };
    }

    // Convenience methods specific to weight measurements
    public transformToWeightMeasurementWithStatus(record: WeightMeasurementRecord): WeightMeasurementWithStatus {
        return {
            UserId: record.user_id,
            MeasurementTimestamp: record.measurement_timestamp,
            Weight: record.weight,

            // Offline-specific properties
            localId: record.id,
            syncStatus: record.sync_status,
            isLocalOnly: record.sync_status === 'local_only',
            retryCount: record.retry_count,
            errorMessage: record.error_message || undefined,
        };
    }

    /**
     * Get weight measurements by date range
     */
    public async getWeightMeasurementsByDateRange(userId: string, startDate: string, endDate: string): Promise<WeightMeasurementWithStatus[]> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const rows = (await db.getAllAsync(
                `SELECT * FROM weight_measurements 
                 WHERE user_id = ? AND measurement_timestamp BETWEEN ? AND ?
                 ORDER BY measurement_timestamp DESC`,
                [userId, startDate, endDate],
            )) as WeightMeasurementRecord[];

            return rows.map((row) => this.transformToWeightMeasurementWithStatus(row));
        } catch (error) {
            console.error('Failed to get weight measurements by date range:', error);
            throw error;
        }
    }

    /**
     * Get latest weight measurement
     */
    public async getLatestWeightMeasurement(userId: string): Promise<WeightMeasurementWithStatus | null> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const row = (await db.getFirstAsync(
                `SELECT * FROM weight_measurements 
                 WHERE user_id = ? 
                 ORDER BY measurement_timestamp DESC 
                 LIMIT 1`,
                [userId],
            )) as WeightMeasurementRecord | null;

            return row ? this.transformToWeightMeasurementWithStatus(row) : null;
        } catch (error) {
            console.error('Failed to get latest weight measurement:', error);
            throw error;
        }
    }

    /**
     * Get weight measurement by exact timestamp
     */
    public async getWeightMeasurementByTimestamp(userId: string, timestamp: string): Promise<WeightMeasurementWithStatus | null> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const row = (await db.getFirstAsync('SELECT * FROM weight_measurements WHERE user_id = ? AND measurement_timestamp = ?', [
                userId,
                timestamp,
            ])) as WeightMeasurementRecord | null;

            return row ? this.transformToWeightMeasurementWithStatus(row) : null;
        } catch (error) {
            console.error('Failed to get weight measurement by timestamp:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const weightMeasurementOfflineService = WeightMeasurementOfflineService.getInstance();
