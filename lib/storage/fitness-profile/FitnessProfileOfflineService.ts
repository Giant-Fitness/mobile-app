// lib/storage/fitness-profile/FitnessProfileOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserFitnessProfile } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Fitness profile specific types
export interface CreateFitnessProfileInput {
    GymExperienceLevel: string;
    AccessToEquipment: string;
    DaysPerWeekDesired: string;
    ActivityLevel?: string;
}

export interface UpdateFitnessProfileInput {
    GymExperienceLevel?: string;
    AccessToEquipment?: string;
    DaysPerWeekDesired?: string;
    ActivityLevel?: string;
}

export interface FitnessProfileWithStatus extends UserFitnessProfile {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface FitnessProfileRecord {
    id: string;
    user_id: string;
    gym_experience_level: string;
    access_to_equipment: string;
    days_per_week_desired: string;
    activity_level?: string;
    server_updated_at?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class FitnessProfileOfflineService extends BaseOfflineDataService<UserFitnessProfile, CreateFitnessProfileInput, UpdateFitnessProfileInput> {
    private static instance: FitnessProfileOfflineService;

    public static getInstance(): FitnessProfileOfflineService {
        if (!FitnessProfileOfflineService.instance) {
            FitnessProfileOfflineService.instance = new FitnessProfileOfflineService();
        }
        return FitnessProfileOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'fitness_profiles',
            retentionDays: 365, // Keep fitness profiles longer since there's only one per user
            enableCleanup: false, // No cleanup needed for single-record-per-user data
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS fitness_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                gym_experience_level TEXT NOT NULL,
                access_to_equipment TEXT NOT NULL,
                days_per_week_desired TEXT NOT NULL,
                activity_level TEXT DEFAULT '',  -- Default to empty string
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
            CREATE INDEX IF NOT EXISTS idx_fitness_user_id 
            ON fitness_profiles(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_fitness_sync_status 
            ON fitness_profiles(sync_status);
        `);

        console.log('Fitness profiles table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateFitnessProfileInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT OR REPLACE INTO fitness_profiles (
                id, user_id, gym_experience_level, access_to_equipment,
                days_per_week_desired, activity_level,
                sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [localId, userId, data.GymExperienceLevel, data.AccessToEquipment, data.DaysPerWeekDesired, data.ActivityLevel || '', now, now],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<FitnessProfileRecord[]> {
        const { includeLocalOnly } = query;

        let sql = `SELECT * FROM fitness_profiles WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        return (await db.getAllAsync(sql, params)) as FitnessProfileRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<FitnessProfileRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM fitness_profiles WHERE id = ?', [localId])) as FitnessProfileRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateFitnessProfileInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.GymExperienceLevel !== undefined) {
            setParts.push('gym_experience_level = ?');
            params.push(updates.GymExperienceLevel);
        }

        if (updates.AccessToEquipment !== undefined) {
            setParts.push('access_to_equipment = ?');
            params.push(updates.AccessToEquipment);
        }

        if (updates.DaysPerWeekDesired !== undefined) {
            setParts.push('days_per_week_desired = ?');
            params.push(updates.DaysPerWeekDesired);
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

        await db.runAsync(`UPDATE fitness_profiles SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM fitness_profiles WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<FitnessProfileRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM fitness_profiles 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY updated_at DESC`,
            [userId],
        )) as FitnessProfileRecord[];
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

        await db.runAsync(`UPDATE fitness_profiles SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserFitnessProfile): Promise<void> {
        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM fitness_profiles WHERE user_id = ?', [userId])) as FitnessProfileRecord | null;
        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE fitness_profiles 
                 SET gym_experience_level = ?, access_to_equipment = ?, 
                     days_per_week_desired = ?, activity_level = ?,
                     server_updated_at = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.GymExperienceLevel,
                    serverRecord.AccessToEquipment,
                    serverRecord.DaysPerWeekDesired,
                    serverRecord.ActivityLevel,
                    new Date().toISOString(),
                    new Date().toISOString(),
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO fitness_profiles (
                    id, user_id, gym_experience_level, access_to_equipment,
                    days_per_week_desired, activity_level,
                    server_updated_at, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.GymExperienceLevel,
                    serverRecord.AccessToEquipment,
                    serverRecord.DaysPerWeekDesired,
                    serverRecord.ActivityLevel,
                    now,
                    now,
                    now,
                ],
            );
        }
    }

    protected async performCleanup(): Promise<number> {
        // No cleanup needed for fitness profiles since there's only one per user
        // and we want to keep it indefinitely
        return 0;
    }

    /**
     * Merge single server record (override base class method that expects array)
     */
    public async mergeServerData(userId: string, serverRecord: UserFitnessProfile): Promise<void>;
    public async mergeServerData(userId: string, serverRecords: UserFitnessProfile[]): Promise<void>;
    public async mergeServerData(userId: string, serverData: UserFitnessProfile | UserFitnessProfile[]): Promise<void> {
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
                    // Handle single record (fitness profile case)
                    await this.mergeServerRecord(db, userId, serverData);
                    console.log(`Merged server ${this.options.tableName}`);
                }
            });
        }, `mergeServer${this.options.tableName}`);
    }

    protected transformToOfflineRecord(row: FitnessProfileRecord): OfflineRecord<UserFitnessProfile> {
        const fitnessProfile: UserFitnessProfile = {
            UserId: row.user_id,
            GymExperienceLevel: row.gym_experience_level,
            AccessToEquipment: row.access_to_equipment,
            DaysPerWeekDesired: row.days_per_week_desired,
            ActivityLevel: row.activity_level,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: fitnessProfile,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: FitnessProfileRecord): any {
        return {
            userId: record.user_id,
        };
    }

    // Convenience methods specific to fitness profiles

    /**
     * Get the fitness profile for a user (since there's only one per user)
     */
    public async getProfileForUser(userId: string): Promise<OfflineRecord<UserFitnessProfile> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Create or update fitness profile (upsert operation)
     */
    public async upsertProfile(input: { userId: string; data: CreateFitnessProfileInput }): Promise<OfflineRecord<UserFitnessProfile>> {
        const existingProfile = await this.getProfileForUser(input.userId);

        if (existingProfile) {
            // Update existing profile
            await this.update(existingProfile.localId, input.data);
            const updated = await this.getById(existingProfile.localId);
            if (!updated) {
                throw new Error('Failed to retrieve updated fitness profile');
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
                throw new Error('Failed to retrieve created fitness profile');
            }
            return created;
        }
    }

    public transformToFitnessProfileWithStatus(record: FitnessProfileRecord): FitnessProfileWithStatus {
        return {
            UserId: record.user_id,
            GymExperienceLevel: record.gym_experience_level,
            AccessToEquipment: record.access_to_equipment,
            DaysPerWeekDesired: record.days_per_week_desired,
            ActivityLevel: record.activity_level,

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
export const fitnessProfileOfflineService = FitnessProfileOfflineService.getInstance();
