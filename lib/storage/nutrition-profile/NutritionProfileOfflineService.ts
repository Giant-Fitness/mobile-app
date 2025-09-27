// lib/storage/nutrition-profile/NutritionProfileOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserNutritionProfile } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Nutrition profile specific types
export interface CreateNutritionProfileInput {
    WeightGoal: number;
    PrimaryNutritionGoal: string;
    ActivityLevel: string;
}

export interface UpdateNutritionProfileInput {
    WeightGoal?: number;
    PrimaryNutritionGoal?: string;
    ActivityLevel?: string;
}

export interface NutritionProfileWithStatus extends UserNutritionProfile {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface NutritionProfileRecord {
    id: string;
    user_id: string;
    weight_goal: number;
    primary_nutrition_goal: string;
    activity_level: string;
    created_at_server?: string;
    updated_at_server?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class NutritionProfileOfflineService extends BaseOfflineDataService<UserNutritionProfile, CreateNutritionProfileInput, UpdateNutritionProfileInput> {
    private static instance: NutritionProfileOfflineService;

    public static getInstance(): NutritionProfileOfflineService {
        if (!NutritionProfileOfflineService.instance) {
            NutritionProfileOfflineService.instance = new NutritionProfileOfflineService();
        }
        return NutritionProfileOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'nutrition_profiles',
            retentionDays: 365, // Keep nutrition profiles longer since there's only one per user
            enableCleanup: false, // No cleanup needed for single-record-per-user data
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS nutrition_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                weight_goal REAL NOT NULL,
                primary_nutrition_goal TEXT NOT NULL,
                activity_level TEXT NOT NULL,
                created_at_server TEXT,
                updated_at_server TEXT,
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
            CREATE INDEX IF NOT EXISTS idx_nutrition_user_id 
            ON nutrition_profiles(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_nutrition_sync_status 
            ON nutrition_profiles(sync_status);
        `);

        console.log('Nutrition profiles table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateNutritionProfileInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT OR REPLACE INTO nutrition_profiles (
                id, user_id, weight_goal, primary_nutrition_goal, activity_level,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, data.WeightGoal, data.PrimaryNutritionGoal, data.ActivityLevel, now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<NutritionProfileRecord[]> {
        const { includeLocalOnly } = query;

        let sql = `SELECT * FROM nutrition_profiles WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        return (await db.getAllAsync(sql, params)) as NutritionProfileRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<NutritionProfileRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM nutrition_profiles WHERE id = ?', [localId])) as NutritionProfileRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateNutritionProfileInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.WeightGoal !== undefined) {
            setParts.push('weight_goal = ?');
            params.push(updates.WeightGoal);
        }

        if (updates.PrimaryNutritionGoal !== undefined) {
            setParts.push('primary_nutrition_goal = ?');
            params.push(updates.PrimaryNutritionGoal);
        }

        if (updates.ActivityLevel !== undefined) {
            setParts.push('activity_level = ?');
            params.push(updates.ActivityLevel);
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE nutrition_profiles SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM nutrition_profiles WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<NutritionProfileRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM nutrition_profiles 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY updated_at DESC`,
            [userId],
        )) as NutritionProfileRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.serverCreatedAt) {
            setParts.push('created_at_server = ?');
            params.push(options.serverCreatedAt);
        }

        if (options.serverUpdatedAt) {
            setParts.push('updated_at_server = ?');
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

        await db.runAsync(`UPDATE nutrition_profiles SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserNutritionProfile): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM nutrition_profiles WHERE user_id = ?', [userId])) as NutritionProfileRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE nutrition_profiles 
                 SET weight_goal = ?, primary_nutrition_goal = ?, activity_level = ?,
                     created_at_server = ?, updated_at_server = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.WeightGoal,
                    serverRecord.PrimaryNutritionGoal,
                    serverRecord.ActivityLevel,
                    serverRecord.CreatedAt || new Date().toISOString(),
                    serverRecord.UpdatedAt || new Date().toISOString(),
                    new Date().toISOString(),
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO nutrition_profiles (
                    id, user_id, weight_goal, primary_nutrition_goal, activity_level,
                    created_at_server, updated_at_server, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.WeightGoal,
                    serverRecord.PrimaryNutritionGoal,
                    serverRecord.ActivityLevel,
                    serverRecord.CreatedAt || now,
                    serverRecord.UpdatedAt || now,
                    now,
                    now,
                ],
            );
        }
    }

    /**
     * Merge single server record (override base class method that expects array)
     */
    public async mergeServerData(userId: string, serverRecord: UserNutritionProfile): Promise<void>;
    public async mergeServerData(userId: string, serverRecords: UserNutritionProfile[]): Promise<void>;
    public async mergeServerData(userId: string, serverData: UserNutritionProfile | UserNutritionProfile[]): Promise<void> {
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
                    // Handle single record (nutrition profile case)
                    await this.mergeServerRecord(db, userId, serverData);
                    console.log(`Merged server ${this.options.tableName}`);
                }
            });
        }, `mergeServer${this.options.tableName}`);
    }

    protected async performCleanup(): Promise<number> {
        // No cleanup needed for nutrition profiles since there's only one per user
        // and we want to keep it indefinitely
        return 0;
    }

    protected transformToOfflineRecord(row: NutritionProfileRecord): OfflineRecord<UserNutritionProfile> {
        const nutritionProfile: UserNutritionProfile = {
            UserId: row.user_id,
            WeightGoal: row.weight_goal,
            PrimaryNutritionGoal: row.primary_nutrition_goal,
            ActivityLevel: row.activity_level,
            CreatedAt: row.created_at_server,
            UpdatedAt: row.updated_at_server,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: nutritionProfile,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: NutritionProfileRecord): any {
        return {
            userId: record.user_id,
        };
    }

    // Convenience methods specific to nutrition profiles

    /**
     * Get the nutrition profile for a user (since there's only one per user)
     */
    public async getProfileForUser(userId: string): Promise<OfflineRecord<UserNutritionProfile> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Create or update nutrition profile (upsert operation)
     */
    public async upsertProfile(input: { userId: string; data: CreateNutritionProfileInput }): Promise<OfflineRecord<UserNutritionProfile>> {
        const existingProfile = await this.getProfileForUser(input.userId);

        if (existingProfile) {
            // Update existing profile
            await this.update(existingProfile.localId, input.data);
            const updated = await this.getById(existingProfile.localId);
            if (!updated) {
                throw new Error('Failed to retrieve updated nutrition profile');
            }
            return updated;
        } else {
            // Create new profile
            const localId = await this.create({
                userId: input.userId,
                data: input.data,
                timestamp: new Date().toISOString(),
            });

            // Retrieve the created record
            const created = await this.getById(localId);
            if (!created) {
                throw new Error('Failed to retrieve created nutrition profile');
            }
            return created;
        }
    }

    public transformToNutritionProfileWithStatus(record: NutritionProfileRecord): NutritionProfileWithStatus {
        return {
            UserId: record.user_id,
            WeightGoal: record.weight_goal,
            PrimaryNutritionGoal: record.primary_nutrition_goal,
            ActivityLevel: record.activity_level,
            CreatedAt: record.created_at_server,
            UpdatedAt: record.updated_at_server,

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
export const nutritionProfileOfflineService = NutritionProfileOfflineService.getInstance();
