// lib/storage/body-measurements/BodyMeasurementOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserBodyMeasurement } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Body measurement specific types
export interface CreateBodyMeasurementInput {
    measurements: Record<string, number>; // waist, hip, chest, etc.
    measurementTimestamp: string;
}

export interface UpdateBodyMeasurementInput {
    measurements?: Record<string, number>;
    measurementTimestamp?: string;
}

export interface BodyMeasurementWithStatus extends UserBodyMeasurement {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface BodyMeasurementRecord {
    id: string;
    user_id: string;
    measurements_json: string; // Stored as JSON string
    measurement_timestamp: string;
    server_timestamp?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class BodyMeasurementOfflineService extends BaseOfflineDataService<UserBodyMeasurement, CreateBodyMeasurementInput, UpdateBodyMeasurementInput> {
    private static instance: BodyMeasurementOfflineService;

    public static getInstance(): BodyMeasurementOfflineService {
        if (!BodyMeasurementOfflineService.instance) {
            BodyMeasurementOfflineService.instance = new BodyMeasurementOfflineService();
        }
        return BodyMeasurementOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'body_measurements',
            retentionDays: 365,
            enableCleanup: true,
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

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

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_body_user_timestamp 
            ON body_measurements(user_id, measurement_timestamp);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_body_sync_status 
            ON body_measurements(sync_status);
        `);

        console.log('Body measurements table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateBodyMeasurementInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT INTO body_measurements (
                id, user_id, measurements_json, measurement_timestamp,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, JSON.stringify(data.measurements), data.measurementTimestamp, now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<BodyMeasurementRecord[]> {
        const { includeLocalOnly, limit, offset, orderBy } = query;

        let sql = `SELECT * FROM body_measurements WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        sql += ` ORDER BY measurement_timestamp ${orderBy}`;

        if (limit) {
            sql += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        return (await db.getAllAsync(sql, params)) as BodyMeasurementRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<BodyMeasurementRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM body_measurements WHERE id = ?', [localId])) as BodyMeasurementRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateBodyMeasurementInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.measurements !== undefined) {
            setParts.push('measurements_json = ?');
            params.push(JSON.stringify(updates.measurements));
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

        await db.runAsync(`UPDATE body_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM body_measurements WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<BodyMeasurementRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM body_measurements 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY created_at ASC`,
            [userId],
        )) as BodyMeasurementRecord[];
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

        await db.runAsync(`UPDATE body_measurements SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserBodyMeasurement): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM body_measurements WHERE user_id = ? AND measurement_timestamp = ?', [
            userId,
            serverRecord.MeasurementTimestamp,
        ])) as BodyMeasurementRecord | null;

        // Convert server record to measurements object
        const measurements = {
            waist: serverRecord.waist,
            hip: serverRecord.hip,
            chest: serverRecord.chest,
            neck: serverRecord.neck,
            shoulder: serverRecord.shoulder,
            abdomen: serverRecord.abdomen,
            leftBicep: serverRecord.leftBicep,
            rightBicep: serverRecord.rightBicep,
            leftThigh: serverRecord.leftThigh,
            rightThigh: serverRecord.rightThigh,
            leftCalf: serverRecord.leftCalf,
            rightCalf: serverRecord.rightCalf,
            waistHipRatio: serverRecord.waistHipRatio,
        };

        // Filter out undefined values
        const cleanMeasurements = Object.fromEntries(Object.entries(measurements).filter(([, v]) => v !== undefined));

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE body_measurements 
                 SET measurements_json = ?, server_timestamp = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [JSON.stringify(cleanMeasurements), serverRecord.MeasurementTimestamp, new Date().toISOString(), existing.id],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO body_measurements (
                    id, user_id, measurements_json, measurement_timestamp,
                    server_timestamp, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [localId, userId, JSON.stringify(cleanMeasurements), serverRecord.MeasurementTimestamp, serverRecord.MeasurementTimestamp, now, now],
            );
        }
    }

    protected async performCleanup(db: any, retentionDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await db.runAsync(
            `DELETE FROM body_measurements 
             WHERE measurement_timestamp < ? AND sync_status = 'synced'`,
            [cutoffDate.toISOString()],
        );

        console.log(`Cleaned up ${result.changes} old body measurements`);
        return result.changes;
    }

    protected transformToOfflineRecord(row: BodyMeasurementRecord): OfflineRecord<UserBodyMeasurement> {
        const measurements = JSON.parse(row.measurements_json);

        const bodyMeasurement: UserBodyMeasurement = {
            UserId: row.user_id,
            MeasurementTimestamp: row.measurement_timestamp,
            UpdatedAt: row.updated_at,
            ...measurements, // Spread the measurements object
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: bodyMeasurement,
            timestamp: row.measurement_timestamp,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: BodyMeasurementRecord): any {
        return {
            userId: record.user_id,
            measurementTimestamp: record.measurement_timestamp,
        };
    }

    // Convenience methods specific to body measurements
    public transformToBodyMeasurementWithStatus(record: BodyMeasurementRecord): BodyMeasurementWithStatus {
        const measurements = JSON.parse(record.measurements_json);

        return {
            UserId: record.user_id,
            MeasurementTimestamp: record.measurement_timestamp,
            UpdatedAt: record.updated_at,
            ...measurements,

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
export const bodyMeasurementOfflineService = BodyMeasurementOfflineService.getInstance();
