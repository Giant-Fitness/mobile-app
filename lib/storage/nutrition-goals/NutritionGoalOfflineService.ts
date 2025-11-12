// lib/storage/nutrition-goals/NutritionGoalOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserNutritionGoal } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Nutrition goal specific types
export interface CreateNutritionGoalInput {
    effectiveDate: string; // YYYY-MM-DD
    primaryFitnessGoal: 'lose-fat' | 'build-muscle' | 'body-recomposition' | 'maintain-fitness';
    targetWeight: number;
    weightChangeRate: number;
    startingWeight: number;
    activityLevel: string;
    adjustmentReason: 'INITIAL_SETUP' | 'USER_UPDATED' | 'GOAL_CHANGED';
    adjustmentNotes?: string;
    previousGoalDate?: string;
    isActive: boolean;
}

export interface UpdateNutritionGoalInput {
    primaryFitnessGoal?: 'lose-fat' | 'build-muscle' | 'body-recomposition' | 'maintain-fitness';
    targetWeight?: number;
    weightChangeRate?: number;
    activityLevel?: string;
    isActive?: boolean;
}

export interface NutritionGoalWithStatus extends UserNutritionGoal {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface NutritionGoalRecord {
    id: string;
    user_id: string;
    effective_date: string;
    primary_fitness_goal: string;
    target_weight: number;
    weight_change_rate: number;
    starting_weight: number;
    activity_level: string;
    adjustment_reason: string;
    adjustment_notes?: string;
    previous_goal_date?: string;
    is_active: number; // SQLite stores booleans as 0/1
    server_created_at?: string;
    server_updated_at?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class NutritionGoalOfflineService extends BaseOfflineDataService<UserNutritionGoal, CreateNutritionGoalInput, UpdateNutritionGoalInput> {
    private static instance: NutritionGoalOfflineService;

    public static getInstance(): NutritionGoalOfflineService {
        if (!NutritionGoalOfflineService.instance) {
            NutritionGoalOfflineService.instance = new NutritionGoalOfflineService();
        }
        return NutritionGoalOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'nutrition_goals',
            retentionDays: 730, // Keep goals for 2 years
            enableCleanup: true,
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS nutrition_goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                effective_date TEXT NOT NULL,
                primary_fitness_goal TEXT NOT NULL,
                target_weight REAL NOT NULL,
                weight_change_rate REAL NOT NULL,
                starting_weight REAL NOT NULL,
                activity_level TEXT NOT NULL,
                adjustment_reason TEXT NOT NULL,
                adjustment_notes TEXT,
                previous_goal_date TEXT,
                is_active INTEGER NOT NULL DEFAULT 0,
                server_created_at TEXT,
                server_updated_at TEXT,
                sync_status TEXT NOT NULL DEFAULT 'local_only',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_sync_attempt TEXT,
                error_message TEXT,
                UNIQUE(user_id, effective_date)
            );
        `);

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id 
            ON nutrition_goals(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_goals_effective_date 
            ON nutrition_goals(user_id, effective_date DESC);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_goals_active 
            ON nutrition_goals(user_id, is_active);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_goals_sync_status 
            ON nutrition_goals(sync_status);
        `);

        console.log('Nutrition goals table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateNutritionGoalInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT INTO nutrition_goals (
                id, user_id, effective_date, primary_fitness_goal,
                target_weight, weight_change_rate, starting_weight, activity_level,
                adjustment_reason, adjustment_notes, previous_goal_date, is_active,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [
                localId,
                userId,
                data.effectiveDate,
                data.primaryFitnessGoal,
                data.targetWeight,
                data.weightChangeRate,
                data.startingWeight,
                data.activityLevel,
                data.adjustmentReason,
                data.adjustmentNotes || null,
                data.previousGoalDate || null,
                data.isActive ? 1 : 0,
                now,
                now,
            ],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<NutritionGoalRecord[]> {
        const { includeLocalOnly, activeOnly, orderBy = 'DESC' } = query;

        let sql = `SELECT * FROM nutrition_goals WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (activeOnly) {
            sql += ` AND is_active = 1`;
        }

        sql += ` ORDER BY effective_date ${orderBy}`;

        return (await db.getAllAsync(sql, params)) as NutritionGoalRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<NutritionGoalRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM nutrition_goals WHERE id = ?', [localId])) as NutritionGoalRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateNutritionGoalInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.primaryFitnessGoal !== undefined) {
            setParts.push('primary_fitness_goal = ?');
            params.push(updates.primaryFitnessGoal);
        }

        if (updates.targetWeight !== undefined) {
            setParts.push('target_weight = ?');
            params.push(updates.targetWeight);
        }

        if (updates.weightChangeRate !== undefined) {
            setParts.push('weight_change_rate = ?');
            params.push(updates.weightChangeRate);
        }

        if (updates.activityLevel !== undefined) {
            setParts.push('activity_level = ?');
            params.push(updates.activityLevel);
        }

        if (updates.isActive !== undefined) {
            setParts.push('is_active = ?');
            params.push(updates.isActive ? 1 : 0);
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE nutrition_goals SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM nutrition_goals WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<NutritionGoalRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM nutrition_goals 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY effective_date DESC`,
            [userId],
        )) as NutritionGoalRecord[];
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

        await db.runAsync(`UPDATE nutrition_goals SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: any): Promise<void> {
        // API returns different field names:
        // - No EffectiveDate (derive from CreatedAt)
        // - No AdjustmentReason (default to INITIAL_SETUP)
        // - Has Notes instead of AdjustmentNotes
        // - ActivityLevel can be present

        const effectiveDate = serverRecord.EffectiveDate || serverRecord.CreatedAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        const adjustmentReason = serverRecord.AdjustmentReason || 'INITIAL_SETUP';
        const activityLevel = serverRecord.ActivityLevel || '';
        const adjustmentNotes = serverRecord.AdjustmentNotes || serverRecord.Notes || null;

        // Check if record already exists (by effective_date)
        const existing = (await db.getFirstAsync('SELECT * FROM nutrition_goals WHERE user_id = ? AND effective_date = ?', [
            userId,
            effectiveDate,
        ])) as NutritionGoalRecord | null;

        const now = new Date().toISOString();

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE nutrition_goals 
                 SET primary_fitness_goal = ?, target_weight = ?, 
                     weight_change_rate = ?, starting_weight = ?,
                     activity_level = ?, adjustment_reason = ?,
                     adjustment_notes = ?, previous_goal_date = ?,
                     is_active = ?, server_created_at = ?,
                     server_updated_at = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.PrimaryFitnessGoal,
                    serverRecord.TargetWeight,
                    serverRecord.WeightChangeRate,
                    serverRecord.StartingWeight,
                    activityLevel,
                    adjustmentReason,
                    adjustmentNotes,
                    serverRecord.PreviousGoalDate || null,
                    serverRecord.IsActive ? 1 : 0,
                    serverRecord.CreatedAt,
                    serverRecord.UpdatedAt || now,
                    now,
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();

            await db.runAsync(
                `INSERT INTO nutrition_goals (
                    id, user_id, effective_date, primary_fitness_goal,
                    target_weight, weight_change_rate, starting_weight, activity_level,
                    adjustment_reason, adjustment_notes, previous_goal_date, is_active,
                    server_created_at, server_updated_at, sync_status, 
                    created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    effectiveDate,
                    serverRecord.PrimaryFitnessGoal,
                    serverRecord.TargetWeight,
                    serverRecord.WeightChangeRate,
                    serverRecord.StartingWeight,
                    activityLevel,
                    adjustmentReason,
                    adjustmentNotes,
                    serverRecord.PreviousGoalDate || null,
                    serverRecord.IsActive ? 1 : 0,
                    serverRecord.CreatedAt,
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
        const cutoffDateStr = cutoffDate.toISOString();

        // Delete old, synced records (keep active goals and local_only records)
        const result = await db.runAsync(
            `DELETE FROM nutrition_goals 
             WHERE created_at < ? 
             AND sync_status = 'synced'
             AND is_active = 0`,
            [cutoffDateStr],
        );

        return result.changes;
    }

    protected transformToOfflineRecord(row: NutritionGoalRecord): OfflineRecord<UserNutritionGoal> {
        const nutritionGoal: UserNutritionGoal = {
            UserId: row.user_id,
            EffectiveDate: row.effective_date,
            PrimaryFitnessGoal: row.primary_fitness_goal as any,
            TargetWeight: row.target_weight,
            WeightChangeRate: row.weight_change_rate,
            StartingWeight: row.starting_weight,
            ActivityLevel: row.activity_level || '',
            AdjustmentReason: row.adjustment_reason as any,
            AdjustmentNotes: row.adjustment_notes || undefined,
            PreviousGoalDate: row.previous_goal_date || undefined,
            CreatedAt: row.server_created_at || row.created_at,
            IsActive: row.is_active === 1,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: nutritionGoal,
            timestamp: row.effective_date,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: NutritionGoalRecord): any {
        return {
            userId: record.user_id,
            effectiveDate: record.effective_date,
        };
    }

    // Convenience methods specific to nutrition goals

    /**
     * Get the active nutrition goal for a user
     */
    public async getActiveGoal(userId: string): Promise<OfflineRecord<UserNutritionGoal> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        const active = records.find((record) => record.data.IsActive);
        return active || null;
    }

    /**
     * Get nutrition goal by effective date
     */
    public async getByEffectiveDate(userId: string, effectiveDate: string): Promise<OfflineRecord<UserNutritionGoal> | null> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const row = (await db.getFirstAsync('SELECT * FROM nutrition_goals WHERE user_id = ? AND effective_date = ?', [
                userId,
                effectiveDate,
            ])) as NutritionGoalRecord | null;

            return row ? this.transformToOfflineRecord(row) : null;
        }, 'getByEffectiveDate');
    }

    /**
     * Deactivate all goals for a user (typically before creating a new active goal)
     */
    public async deactivateAllGoals(userId: string): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const now = new Date().toISOString();

            await db.runAsync(
                `UPDATE nutrition_goals 
                 SET is_active = 0, updated_at = ?,
                     sync_status = CASE 
                         WHEN sync_status = 'synced' THEN 'local_only'
                         ELSE sync_status
                     END
                 WHERE user_id = ? AND is_active = 1`,
                [now, userId],
            );

            console.log(`Deactivated all goals for user ${userId}`);
        }, 'deactivateAllGoals');
    }

    public transformToNutritionGoalWithStatus(record: NutritionGoalRecord): NutritionGoalWithStatus {
        return {
            UserId: record.user_id,
            EffectiveDate: record.effective_date,
            PrimaryFitnessGoal: record.primary_fitness_goal as any,
            TargetWeight: record.target_weight,
            WeightChangeRate: record.weight_change_rate,
            StartingWeight: record.starting_weight,
            ActivityLevel: record.activity_level || '',
            AdjustmentReason: record.adjustment_reason as any,
            AdjustmentNotes: record.adjustment_notes || undefined,
            PreviousGoalDate: record.previous_goal_date || undefined,
            CreatedAt: record.server_created_at || record.created_at,
            IsActive: record.is_active === 1,

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
export const nutritionGoalOfflineService = NutritionGoalOfflineService.getInstance();
