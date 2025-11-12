// lib/storage/nutrition-logs/NutritionLogOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserNutritionLog } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Nutrition log specific types
export interface CreateNutritionLogInput {
    dateString: string; // YYYY-MM-DD
    meals: any[]; // Array of meals
    dailyTotals: {
        Calories: number;
        Protein: number;
        Carbs: number;
        Fat: number;
        Fiber: number;
    };
}

export interface UpdateNutritionLogInput {
    meals?: any[];
    dailyTotals?: {
        Calories: number;
        Protein: number;
        Carbs: number;
        Fat: number;
        Fiber: number;
    };
}

export interface NutritionLogWithStatus extends UserNutritionLog {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface NutritionLogRecord {
    id: string;
    user_id: string;
    date_string: string; // YYYY-MM-DD
    meals: string; // JSON string
    daily_totals: string; // JSON string
    server_created_at?: string;
    server_updated_at?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class NutritionLogOfflineService extends BaseOfflineDataService<UserNutritionLog, CreateNutritionLogInput, UpdateNutritionLogInput> {
    private static instance: NutritionLogOfflineService;

    public static getInstance(): NutritionLogOfflineService {
        if (!NutritionLogOfflineService.instance) {
            NutritionLogOfflineService.instance = new NutritionLogOfflineService();
        }
        return NutritionLogOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'nutrition_logs',
            retentionDays: 365, // Keep logs for 1 year
            enableCleanup: true,
        });
    }

    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS nutrition_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date_string TEXT NOT NULL,
                meals TEXT NOT NULL,
                daily_totals TEXT NOT NULL,
                server_created_at TEXT,
                server_updated_at TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT,
                UNIQUE(user_id, date_string)
            );
        `);

        // Create indexes
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id 
            ON nutrition_logs(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date 
            ON nutrition_logs(user_id, date_string DESC);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_logs_sync_status 
            ON nutrition_logs(sync_status);
        `);

        console.log('Nutrition logs table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateNutritionLogInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT OR REPLACE INTO nutrition_logs (
                id, user_id, date_string, meals, daily_totals,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, data.dateString, JSON.stringify(data.meals), JSON.stringify(data.dailyTotals), now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<NutritionLogRecord[]> {
        const { includeLocalOnly, startDate, endDate, orderBy = 'DESC', limit } = query;

        let sql = `SELECT * FROM nutrition_logs WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (startDate) {
            sql += ` AND date_string >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            sql += ` AND date_string <= ?`;
            params.push(endDate);
        }

        sql += ` ORDER BY date_string ${orderBy}`;

        if (limit) {
            sql += ` LIMIT ?`;
            params.push(limit);
        }

        return (await db.getAllAsync(sql, params)) as NutritionLogRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<NutritionLogRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM nutrition_logs WHERE id = ?', [localId])) as NutritionLogRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateNutritionLogInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.meals !== undefined) {
            setParts.push('meals = ?');
            params.push(JSON.stringify(updates.meals));
        }

        if (updates.dailyTotals !== undefined) {
            setParts.push('daily_totals = ?');
            params.push(JSON.stringify(updates.dailyTotals));
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE nutrition_logs SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM nutrition_logs WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<NutritionLogRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM nutrition_logs 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY date_string DESC`,
            [userId],
        )) as NutritionLogRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.serverCreatedAt) {
            setParts.push('server_created_at = ?');
            params.push(options.serverCreatedAt);
        }

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

        await db.runAsync(`UPDATE nutrition_logs SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: any): Promise<void> {
        const dateString = serverRecord.DateString;

        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM nutrition_logs WHERE user_id = ? AND date_string = ?', [
            userId,
            dateString,
        ])) as NutritionLogRecord | null;

        const now = new Date().toISOString();

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE nutrition_logs 
                 SET meals = ?, daily_totals = ?,
                     server_created_at = ?, server_updated_at = ?,
                     sync_status = 'synced', updated_at = ?,
                     retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    JSON.stringify(serverRecord.Meals || []),
                    JSON.stringify(serverRecord.DailyTotals || { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Fiber: 0 }),
                    serverRecord.CreatedAt || now,
                    serverRecord.UpdatedAt || now,
                    now,
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();

            await db.runAsync(
                `INSERT INTO nutrition_logs (
                    id, user_id, date_string, meals, daily_totals,
                    server_created_at, server_updated_at, sync_status,
                    created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    dateString,
                    JSON.stringify(serverRecord.Meals || []),
                    JSON.stringify(serverRecord.DailyTotals || { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Fiber: 0 }),
                    serverRecord.CreatedAt || now,
                    serverRecord.UpdatedAt || now,
                    now,
                    now,
                ],
            );
        }
    }

    protected async performCleanup(): Promise<number> {
        const db = databaseManager.getDatabase();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Delete old, synced records
        const result = await db.runAsync(
            `DELETE FROM nutrition_logs 
             WHERE date_string < ? 
             AND sync_status = 'synced'`,
            [cutoffDateStr],
        );

        return result.changes;
    }

    protected transformToOfflineRecord(row: NutritionLogRecord): OfflineRecord<UserNutritionLog> {
        const nutritionLog: UserNutritionLog = {
            UserId: row.user_id,
            DateString: row.date_string,
            Meals: JSON.parse(row.meals),
            DailyTotals: JSON.parse(row.daily_totals),
            CreatedAt: row.server_created_at || row.created_at,
            UpdatedAt: row.server_updated_at || row.updated_at,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: nutritionLog,
            timestamp: row.date_string,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: NutritionLogRecord): any {
        return {
            userId: record.user_id,
            dateString: record.date_string,
        };
    }

    // Convenience methods

    /**
     * Get nutrition log for a specific date
     */
    public async getLogForDate(userId: string, dateString: string): Promise<OfflineRecord<UserNutritionLog> | null> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const row = (await db.getFirstAsync('SELECT * FROM nutrition_logs WHERE user_id = ? AND date_string = ?', [
                userId,
                dateString,
            ])) as NutritionLogRecord | null;

            return row ? this.transformToOfflineRecord(row) : null;
        }, 'getLogForDate');
    }

    /**
     * Get logs for a date range
     */
    public async getLogsForDateRange(userId: string, startDate: string, endDate: string): Promise<OfflineRecord<UserNutritionLog>[]> {
        return await this.getRecords(userId, {
            includeLocalOnly: true,
            startDate,
            endDate,
            orderBy: 'DESC',
        });
    }

    /**
     * Get recent logs (last N days)
     */
    public async getRecentLogs(userId: string, days: number = 30): Promise<OfflineRecord<UserNutritionLog>[]> {
        return await this.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
            limit: days,
        });
    }
}

// Export singleton instance
export const nutritionLogOfflineService = NutritionLogOfflineService.getInstance();
