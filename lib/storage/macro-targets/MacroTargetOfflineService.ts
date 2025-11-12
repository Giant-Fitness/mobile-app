// lib/storage/macro-targets/MacroTargetOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserMacroTarget } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Macro target specific types
export interface CreateMacroTargetInput {
    effectiveDate: string; // YYYY-MM-DD
    targetCalories: number;
    targetMacros: {
        Protein: number;
        Carbs: number;
        Fat: number;
    };
    calculatedTDEE: number;
    isCaloriesOverridden: boolean;
    overriddenCalories?: number;
    adjustmentReason: 'INITIAL_CALCULATION' | 'WEEKLY_ADAPTIVE_ADJUSTMENT' | 'MANUAL_OVERRIDE' | 'GOAL_CHANGED';
    adjustmentDetails?: {
        ExpectedWeightChange: number;
        ActualWeightChange: number;
        ComplianceRate: number;
        CalorieAdjustment: number;
    };
    adjustmentNotes?: string;
    previousTargetDate?: string;
    isActive: boolean;
}

export interface UpdateMacroTargetInput {
    targetCalories?: number;
    targetMacros?: {
        Protein: number;
        Carbs: number;
        Fat: number;
    };
    isCaloriesOverridden?: boolean;
    overriddenCalories?: number;
    isActive?: boolean;
}

export interface MacroTargetWithStatus extends UserMacroTarget {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface MacroTargetRecord {
    id: string;
    user_id: string;
    effective_date: string;
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
    calculated_tdee: number;
    is_calories_overridden: number; // SQLite stores booleans as 0/1
    overridden_calories?: number;
    adjustment_reason: string;
    adjustment_details?: string; // JSON string
    adjustment_notes?: string;
    previous_target_date?: string;
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

export class MacroTargetOfflineService extends BaseOfflineDataService<UserMacroTarget, CreateMacroTargetInput, UpdateMacroTargetInput> {
    private static instance: MacroTargetOfflineService;

    public static getInstance(): MacroTargetOfflineService {
        if (!MacroTargetOfflineService.instance) {
            MacroTargetOfflineService.instance = new MacroTargetOfflineService();
        }
        return MacroTargetOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'macro_targets',
            retentionDays: 730, // Keep targets for 2 years
            enableCleanup: true,
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS macro_targets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                effective_date TEXT NOT NULL,
                target_calories REAL NOT NULL,
                target_protein REAL NOT NULL,
                target_carbs REAL NOT NULL,
                target_fat REAL NOT NULL,
                calculated_tdee REAL NOT NULL,
                is_calories_overridden INTEGER NOT NULL DEFAULT 0,
                overridden_calories REAL,
                adjustment_reason TEXT NOT NULL,
                adjustment_details TEXT,
                adjustment_notes TEXT,
                previous_target_date TEXT,
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
            CREATE INDEX IF NOT EXISTS idx_macro_targets_user_id 
            ON macro_targets(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_macro_targets_effective_date 
            ON macro_targets(user_id, effective_date DESC);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_macro_targets_active 
            ON macro_targets(user_id, is_active);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_macro_targets_sync_status 
            ON macro_targets(sync_status);
        `);

        console.log('Macro targets table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateMacroTargetInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT INTO macro_targets (
                id, user_id, effective_date, target_calories,
                target_protein, target_carbs, target_fat, calculated_tdee,
                is_calories_overridden, overridden_calories, adjustment_reason,
                adjustment_details, adjustment_notes, previous_target_date, is_active,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [
                localId,
                userId,
                data.effectiveDate,
                data.targetCalories,
                data.targetMacros.Protein,
                data.targetMacros.Carbs,
                data.targetMacros.Fat,
                data.calculatedTDEE,
                data.isCaloriesOverridden ? 1 : 0,
                data.overriddenCalories || null,
                data.adjustmentReason,
                data.adjustmentDetails ? JSON.stringify(data.adjustmentDetails) : null,
                data.adjustmentNotes || null,
                data.previousTargetDate || null,
                data.isActive ? 1 : 0,
                now,
                now,
            ],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<MacroTargetRecord[]> {
        const { includeLocalOnly, activeOnly, orderBy = 'DESC' } = query;

        let sql = `SELECT * FROM macro_targets WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (activeOnly) {
            sql += ` AND is_active = 1`;
        }

        sql += ` ORDER BY effective_date ${orderBy}`;

        return (await db.getAllAsync(sql, params)) as MacroTargetRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<MacroTargetRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM macro_targets WHERE id = ?', [localId])) as MacroTargetRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateMacroTargetInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.targetCalories !== undefined) {
            setParts.push('target_calories = ?');
            params.push(updates.targetCalories);
        }

        if (updates.targetMacros !== undefined) {
            setParts.push('target_protein = ?', 'target_carbs = ?', 'target_fat = ?');
            params.push(updates.targetMacros.Protein, updates.targetMacros.Carbs, updates.targetMacros.Fat);
        }

        if (updates.isCaloriesOverridden !== undefined) {
            setParts.push('is_calories_overridden = ?');
            params.push(updates.isCaloriesOverridden ? 1 : 0);
        }

        if (updates.overriddenCalories !== undefined) {
            setParts.push('overridden_calories = ?');
            params.push(updates.overriddenCalories);
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

        await db.runAsync(`UPDATE macro_targets SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM macro_targets WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<MacroTargetRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM macro_targets 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY effective_date DESC`,
            [userId],
        )) as MacroTargetRecord[];
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

        await db.runAsync(`UPDATE macro_targets SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: any): Promise<void> {
        // API returns:
        // - EffectiveDate: present
        // - TDEE: present (instead of CalculatedTDEE)
        // - TargetCalories: present
        // - TargetMacros: {Carbs, Fat, Protein}
        // - AdjustmentReason: present
        // - AdjustmentNotes: present
        // - IsActive: present

        const effectiveDate = serverRecord.EffectiveDate || serverRecord.CreatedAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        const adjustmentReason = serverRecord.AdjustmentReason || 'INITIAL_CALCULATION';

        // API uses TDEE field instead of CalculatedTDEE
        const calculatedTDEE = serverRecord.TDEE || serverRecord.CalculatedTDEE || serverRecord.TargetCalories || 2000;

        // Ensure we have target macros with defaults
        const targetMacros = serverRecord.TargetMacros || {
            Protein: 0,
            Carbs: 0,
            Fat: 0,
        };

        // Check if record already exists (by effective_date)
        const existing = (await db.getFirstAsync('SELECT * FROM macro_targets WHERE user_id = ? AND effective_date = ?', [
            userId,
            effectiveDate,
        ])) as MacroTargetRecord | null;

        const now = new Date().toISOString();

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE macro_targets 
                 SET target_calories = ?, target_protein = ?, target_carbs = ?, target_fat = ?,
                     calculated_tdee = ?, is_calories_overridden = ?, overridden_calories = ?,
                     adjustment_reason = ?, adjustment_details = ?, adjustment_notes = ?,
                     previous_target_date = ?, is_active = ?, server_created_at = ?,
                     server_updated_at = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.TargetCalories || 0,
                    targetMacros.Protein,
                    targetMacros.Carbs,
                    targetMacros.Fat,
                    calculatedTDEE,
                    serverRecord.IsCaloriesOverridden ? 1 : 0,
                    serverRecord.OverriddenCalories || null,
                    adjustmentReason,
                    serverRecord.AdjustmentDetails ? JSON.stringify(serverRecord.AdjustmentDetails) : null,
                    serverRecord.AdjustmentNotes || null,
                    serverRecord.PreviousTargetDate || null,
                    serverRecord.IsActive ? 1 : 0,
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
                `INSERT INTO macro_targets (
                    id, user_id, effective_date, target_calories,
                    target_protein, target_carbs, target_fat, calculated_tdee,
                    is_calories_overridden, overridden_calories, adjustment_reason,
                    adjustment_details, adjustment_notes, previous_target_date, is_active,
                    server_created_at, server_updated_at, sync_status, 
                    created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    effectiveDate,
                    serverRecord.TargetCalories || 0,
                    targetMacros.Protein,
                    targetMacros.Carbs,
                    targetMacros.Fat,
                    calculatedTDEE,
                    serverRecord.IsCaloriesOverridden ? 1 : 0,
                    serverRecord.OverriddenCalories || null,
                    adjustmentReason,
                    serverRecord.AdjustmentDetails ? JSON.stringify(serverRecord.AdjustmentDetails) : null,
                    serverRecord.AdjustmentNotes || null,
                    serverRecord.PreviousTargetDate || null,
                    serverRecord.IsActive ? 1 : 0,
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
        const cutoffDateStr = cutoffDate.toISOString();

        // Delete old, synced records (keep active targets and local_only records)
        const result = await db.runAsync(
            `DELETE FROM macro_targets 
             WHERE created_at < ? 
             AND sync_status = 'synced'
             AND is_active = 0`,
            [cutoffDateStr],
        );

        return result.changes;
    }

    protected transformToOfflineRecord(row: MacroTargetRecord): OfflineRecord<UserMacroTarget> {
        const macroTarget: UserMacroTarget = {
            UserId: row.user_id,
            EffectiveDate: row.effective_date,
            TargetCalories: row.target_calories,
            TargetMacros: {
                Protein: row.target_protein,
                Carbs: row.target_carbs,
                Fat: row.target_fat,
            },
            CalculatedTDEE: row.calculated_tdee,
            IsCaloriesOverridden: row.is_calories_overridden === 1,
            OverriddenCalories: row.overridden_calories || undefined,
            AdjustmentReason: row.adjustment_reason as any,
            AdjustmentDetails: row.adjustment_details ? JSON.parse(row.adjustment_details) : undefined,
            AdjustmentNotes: row.adjustment_notes || undefined,
            PreviousTargetDate: row.previous_target_date || undefined,
            CreatedAt: row.server_created_at || row.created_at,
            IsActive: row.is_active === 1,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: macroTarget,
            timestamp: row.effective_date,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: MacroTargetRecord): any {
        return {
            userId: record.user_id,
            effectiveDate: record.effective_date,
        };
    }

    // Convenience methods specific to macro targets

    /**
     * Get the active macro target for a user
     */
    public async getActiveTarget(userId: string): Promise<OfflineRecord<UserMacroTarget> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        const active = records.find((r) => r.data.IsActive);
        return active || null;
    }

    /**
     * Get macro target by effective date
     */
    public async getByEffectiveDate(userId: string, effectiveDate: string): Promise<OfflineRecord<UserMacroTarget> | null> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const row = (await db.getFirstAsync('SELECT * FROM macro_targets WHERE user_id = ? AND effective_date = ?', [
                userId,
                effectiveDate,
            ])) as MacroTargetRecord | null;

            return row ? this.transformToOfflineRecord(row) : null;
        }, 'getByEffectiveDate');
    }

    /**
     * Deactivate all targets for a user (typically before creating a new active target)
     */
    public async deactivateAllTargets(userId: string): Promise<void> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const now = new Date().toISOString();

            await db.runAsync(
                `UPDATE macro_targets 
                 SET is_active = 0, updated_at = ?,
                     sync_status = CASE 
                         WHEN sync_status = 'synced' THEN 'local_only'
                         ELSE sync_status
                     END
                 WHERE user_id = ? AND is_active = 1`,
                [now, userId],
            );

            console.log(`Deactivated all targets for user ${userId}`);
        }, 'deactivateAllTargets');
    }

    public transformToMacroTargetWithStatus(record: MacroTargetRecord): MacroTargetWithStatus {
        return {
            UserId: record.user_id,
            EffectiveDate: record.effective_date,
            TargetCalories: record.target_calories,
            TargetMacros: {
                Protein: record.target_protein,
                Carbs: record.target_carbs,
                Fat: record.target_fat,
            },
            CalculatedTDEE: record.calculated_tdee,
            IsCaloriesOverridden: record.is_calories_overridden === 1,
            OverriddenCalories: record.overridden_calories || undefined,
            AdjustmentReason: record.adjustment_reason as any,
            AdjustmentDetails: record.adjustment_details ? JSON.parse(record.adjustment_details) : undefined,
            AdjustmentNotes: record.adjustment_notes || undefined,
            PreviousTargetDate: record.previous_target_date || undefined,
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
export const macroTargetOfflineService = MacroTargetOfflineService.getInstance();
