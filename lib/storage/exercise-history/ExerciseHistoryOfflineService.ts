// lib/storage/exercise-history/ExerciseHistoryOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { ExerciseLog, ExerciseSet } from '@/types/exerciseProgressTypes';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Exercise history specific types
export interface CreateExerciseHistoryInput {
    exerciseId: string;
    date: string;
    sets: ExerciseSet[];
}

export interface UpdateExerciseHistoryInput {
    sets?: ExerciseSet[];
}

export interface ExerciseHistoryWithStatus extends ExerciseLog {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface ExerciseHistoryRecord {
    id: string;
    user_id: string;
    exercise_id: string;
    date: string;
    exercise_log_id: string;
    user_exercise_id: string;
    sets: string; // JSON stringified ExerciseSet[]
    server_timestamp?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class ExerciseHistoryOfflineService extends BaseOfflineDataService<ExerciseLog, CreateExerciseHistoryInput, UpdateExerciseHistoryInput> {
    private static instance: ExerciseHistoryOfflineService;

    public static getInstance(): ExerciseHistoryOfflineService {
        if (!ExerciseHistoryOfflineService.instance) {
            ExerciseHistoryOfflineService.instance = new ExerciseHistoryOfflineService();
        }
        return ExerciseHistoryOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'exercise_history',
            retentionDays: 365, // Keep 1 year of history by default
            enableCleanup: true,
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS exercise_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                exercise_id TEXT NOT NULL,
                date TEXT NOT NULL,
                exercise_log_id TEXT NOT NULL,
                user_exercise_id TEXT NOT NULL,
                sets TEXT NOT NULL,
                server_timestamp TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT,
                UNIQUE(user_id, exercise_id, date)
            );
        `);

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_exercise_history_user_exercise 
            ON exercise_history(user_id, exercise_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_exercise_history_user_date 
            ON exercise_history(user_id, date);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_exercise_history_sync_status 
            ON exercise_history(sync_status);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_exercise_history_log_id 
            ON exercise_history(exercise_log_id);
        `);

        console.log('Exercise history table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateExerciseHistoryInput, timestamp: string, now: string): Promise<void> {
        const exerciseLogId = this.generateExerciseLogId(data.exerciseId, data.date);
        const userExerciseId = `${userId}#${data.exerciseId}`;

        await db.runAsync(
            `INSERT INTO exercise_history (
                id, user_id, exercise_id, date, exercise_log_id, user_exercise_id,
                sets, sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, data.exerciseId, data.date, exerciseLogId, userExerciseId, JSON.stringify(data.sets), now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<ExerciseHistoryRecord[]> {
        const { includeLocalOnly, limit, offset, orderBy, startDate, endDate } = query;

        let sql = `SELECT * FROM exercise_history WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (startDate) {
            sql += ` AND date >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            sql += ` AND date <= ?`;
            params.push(endDate);
        }

        sql += ` ORDER BY date ${orderBy}`;

        if (limit) {
            sql += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        return (await db.getAllAsync(sql, params)) as ExerciseHistoryRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<ExerciseHistoryRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM exercise_history WHERE id = ?', [localId])) as ExerciseHistoryRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateExerciseHistoryInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.sets !== undefined) {
            setParts.push('sets = ?');
            params.push(JSON.stringify(updates.sets));
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE exercise_history SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM exercise_history WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<ExerciseHistoryRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM exercise_history 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY created_at ASC`,
            [userId],
        )) as ExerciseHistoryRecord[];
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

        await db.runAsync(`UPDATE exercise_history SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: ExerciseLog): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM exercise_history WHERE user_id = ? AND exercise_id = ? AND date = ?', [
            userId,
            serverRecord.ExerciseId,
            serverRecord.Date,
        ])) as ExerciseHistoryRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE exercise_history 
                 SET sets = ?, server_timestamp = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [JSON.stringify(serverRecord.Sets), serverRecord.UpdatedAt, new Date().toISOString(), existing.id],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO exercise_history (
                    id, user_id, exercise_id, date, exercise_log_id, user_exercise_id,
                    sets, server_timestamp, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.ExerciseId,
                    serverRecord.Date,
                    serverRecord.ExerciseLogId,
                    serverRecord.UserExerciseId,
                    JSON.stringify(serverRecord.Sets),
                    serverRecord.UpdatedAt,
                    now,
                    now,
                ],
            );
        }
    }

    protected async performCleanup(db: any, retentionDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await db.runAsync(
            `DELETE FROM exercise_history 
             WHERE date < ? AND sync_status = 'synced'`,
            [cutoffDate.toISOString().split('T')[0]], // Use date only
        );

        console.log(`Cleaned up ${result.changes} old exercise history records`);
        return result.changes;
    }

    protected transformToOfflineRecord(row: ExerciseHistoryRecord): OfflineRecord<ExerciseLog> {
        const exerciseLog: ExerciseLog = {
            UserId: row.user_id,
            ExerciseLogId: row.exercise_log_id,
            ExerciseId: row.exercise_id,
            Date: row.date,
            UserExerciseId: row.user_exercise_id,
            Sets: JSON.parse(row.sets),
            CreatedAt: row.created_at,
            UpdatedAt: row.updated_at,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: exerciseLog,
            timestamp: row.date,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: ExerciseHistoryRecord): any {
        return {
            userId: record.user_id,
            exerciseId: record.exercise_id,
            date: record.date,
        };
    }

    // Helper method to generate ExerciseLogId
    private generateExerciseLogId(exerciseId: string, date: string): string {
        return `${exerciseId}#${date}`;
    }

    // Convenience methods specific to exercise history
    public transformToExerciseHistoryWithStatus(record: ExerciseHistoryRecord): ExerciseHistoryWithStatus {
        return {
            UserId: record.user_id,
            ExerciseLogId: record.exercise_log_id,
            ExerciseId: record.exercise_id,
            Date: record.date,
            UserExerciseId: record.user_exercise_id,
            Sets: JSON.parse(record.sets),
            CreatedAt: record.created_at,
            UpdatedAt: record.updated_at,

            // Offline-specific properties
            localId: record.id,
            syncStatus: record.sync_status,
            isLocalOnly: record.sync_status === 'local_only',
            retryCount: record.retry_count,
            errorMessage: record.error_message || undefined,
        };
    }

    /**
     * Get all history for a specific exercise
     */
    public async getHistoryForExercise(
        userId: string,
        exerciseId: string,
        options?: { limit?: number; orderBy?: 'ASC' | 'DESC' },
    ): Promise<ExerciseHistoryWithStatus[]> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const limit = options?.limit;
            const orderBy = options?.orderBy || 'DESC';

            let sql = `SELECT * FROM exercise_history 
                 WHERE user_id = ? AND exercise_id = ?
                 ORDER BY date ${orderBy}`;

            const params: any[] = [userId, exerciseId];

            if (limit) {
                sql += ` LIMIT ?`;
                params.push(limit);
            }

            const rows = (await db.getAllAsync(sql, params)) as ExerciseHistoryRecord[];

            return rows.map((row) => this.transformToExerciseHistoryWithStatus(row));
        } catch (error) {
            console.error(`Failed to get history for exercise ${exerciseId}:`, error);
            throw error;
        }
    }

    /**
     * Get history for multiple exercises (optimized for program day loading)
     */
    public async getHistoryForExercises(userId: string, exerciseIds: string[], limit: number = 10): Promise<Record<string, ExerciseHistoryWithStatus[]>> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const result: Record<string, ExerciseHistoryWithStatus[]> = {};

            // Use a single query with IN clause for efficiency
            const placeholders = exerciseIds.map(() => '?').join(',');
            const sql = `
                SELECT * FROM (
                    SELECT *, 
                           ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY date DESC) as rn
                    FROM exercise_history 
                    WHERE user_id = ? AND exercise_id IN (${placeholders})
                ) ranked
                WHERE rn <= ?
                ORDER BY exercise_id, date DESC
            `;

            const params = [userId, ...exerciseIds, limit];
            const rows = (await db.getAllAsync(sql, params)) as ExerciseHistoryRecord[];

            // Group by exercise_id
            for (const row of rows) {
                if (!result[row.exercise_id]) {
                    result[row.exercise_id] = [];
                }
                result[row.exercise_id].push(this.transformToExerciseHistoryWithStatus(row));
            }

            return result;
        } catch (error) {
            console.error('Failed to get history for multiple exercises:', error);
            throw error;
        }
    }

    /**
     * Get exercise history by date range
     */
    public async getHistoryByDateRange(userId: string, startDate: string, endDate: string, exerciseId?: string): Promise<ExerciseHistoryWithStatus[]> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            let sql = `SELECT * FROM exercise_history 
                 WHERE user_id = ? AND date BETWEEN ? AND ?`;
            const params: any[] = [userId, startDate, endDate];

            if (exerciseId) {
                sql += ` AND exercise_id = ?`;
                params.push(exerciseId);
            }

            sql += ` ORDER BY date DESC`;

            const rows = (await db.getAllAsync(sql, params)) as ExerciseHistoryRecord[];

            return rows.map((row) => this.transformToExerciseHistoryWithStatus(row));
        } catch (error) {
            console.error('Failed to get exercise history by date range:', error);
            throw error;
        }
    }

    /**
     * Get exercise history by specific date
     */
    public async getHistoryByDate(userId: string, date: string): Promise<ExerciseHistoryWithStatus[]> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const rows = (await db.getAllAsync(
                `SELECT * FROM exercise_history 
                 WHERE user_id = ? AND date = ?
                 ORDER BY created_at ASC`,
                [userId, date],
            )) as ExerciseHistoryRecord[];

            return rows.map((row) => this.transformToExerciseHistoryWithStatus(row));
        } catch (error) {
            console.error('Failed to get exercise history by date:', error);
            throw error;
        }
    }

    /**
     * Get specific exercise log by exercise ID and date
     */
    public async getExerciseLog(userId: string, exerciseId: string, date: string): Promise<ExerciseHistoryWithStatus | null> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const row = (await db.getFirstAsync('SELECT * FROM exercise_history WHERE user_id = ? AND exercise_id = ? AND date = ?', [
                userId,
                exerciseId,
                date,
            ])) as ExerciseHistoryRecord | null;

            return row ? this.transformToExerciseHistoryWithStatus(row) : null;
        } catch (error) {
            console.error('Failed to get exercise log:', error);
            throw error;
        }
    }

    /**
     * Get latest workout date for any exercise
     */
    public async getLatestWorkoutDate(userId: string): Promise<string | null> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const result = (await db.getFirstAsync(
                `SELECT date FROM exercise_history 
                 WHERE user_id = ? 
                 ORDER BY date DESC 
                 LIMIT 1`,
                [userId],
            )) as { date: string } | null;

            return result?.date || null;
        } catch (error) {
            console.error('Failed to get latest workout date:', error);
            throw error;
        }
    }

    /**
     * Get workout count by date range
     */
    public async getWorkoutCount(userId: string, startDate: string, endDate: string): Promise<number> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const result = (await db.getFirstAsync(
                `SELECT COUNT(DISTINCT date) as count 
                 FROM exercise_history 
                 WHERE user_id = ? AND date BETWEEN ? AND ?`,
                [userId, startDate, endDate],
            )) as { count: number } | null;

            return result?.count || 0;
        } catch (error) {
            console.error('Failed to get workout count:', error);
            throw error;
        }
    }

    /**
     * Get exercise frequency (how many times an exercise was performed)
     */
    public async getExerciseFrequency(userId: string, exerciseId: string, startDate?: string, endDate?: string): Promise<number> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            let sql = `SELECT COUNT(*) as count 
                 FROM exercise_history 
                 WHERE user_id = ? AND exercise_id = ?`;
            const params: any[] = [userId, exerciseId];

            if (startDate && endDate) {
                sql += ` AND date BETWEEN ? AND ?`;
                params.push(startDate, endDate);
            }

            const result = (await db.getFirstAsync(sql, params)) as { count: number } | null;

            return result?.count || 0;
        } catch (error) {
            console.error('Failed to get exercise frequency:', error);
            throw error;
        }
    }

    /**
     * Delete exercise log by exercise ID and date (convenience method)
     */
    public async deleteExerciseLog(userId: string, exerciseId: string, date: string): Promise<void> {
        this.ensureInitialized();
        const db = databaseManager.getDatabase();

        try {
            const record = (await db.getFirstAsync('SELECT * FROM exercise_history WHERE user_id = ? AND exercise_id = ? AND date = ?', [
                userId,
                exerciseId,
                date,
            ])) as ExerciseHistoryRecord | null;

            if (!record) {
                throw new Error(`Exercise log not found: ${exerciseId} on ${date}`);
            }

            await this.delete(record.id);
        } catch (error) {
            console.error('Failed to delete exercise log:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const exerciseHistoryOfflineService = ExerciseHistoryOfflineService.getInstance();
