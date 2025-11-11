// lib/storage/program-progress/ProgramProgressOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord } from '@/lib/storage/base/BaseOfflineDataService';
import { UserProgramProgress } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Program progress specific types
export interface CreateProgramProgressInput {
    ProgramId: string;
    CurrentDay: number;
    CompletedDays: string[];
    StartedAt: string;
    LastActivityAt: string;
    LastAction?: string;
    LastActionWasAutoComplete?: boolean;
}

export interface UpdateProgramProgressInput {
    ProgramId?: string;
    CurrentDay?: number;
    CompletedDays?: string[];
    StartedAt?: string;
    LastActivityAt?: string;
    LastAction?: string;
    LastActionWasAutoComplete?: boolean;
}

export interface ProgramProgressWithStatus extends UserProgramProgress {
    localId: string;
    syncStatus: 'local_only' | 'synced' | 'conflict' | 'failed';
    isLocalOnly: boolean;
    retryCount: number;
    errorMessage?: string;
}

interface ProgramProgressRecord {
    id: string;
    user_id: string;
    program_id: string;
    current_day: number;
    completed_days: string; // JSON string array
    start_at: string;
    last_activity_at: string;
    last_action?: string;
    last_action_was_auto_complete?: number; // SQLite boolean (0/1)
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class ProgramProgressOfflineService extends BaseOfflineDataService<UserProgramProgress, CreateProgramProgressInput, UpdateProgramProgressInput> {
    private static instance: ProgramProgressOfflineService;

    public static getInstance(): ProgramProgressOfflineService {
        if (!ProgramProgressOfflineService.instance) {
            ProgramProgressOfflineService.instance = new ProgramProgressOfflineService();
        }
        return ProgramProgressOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'program_progress',
            retentionDays: 365, // Keep program progress longer since there's only one per user
            enableCleanup: false, // No cleanup needed for single-record-per-user data
        });
    }

    // Implement abstract methods
    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS program_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                program_id TEXT NOT NULL,
                current_day INTEGER NOT NULL,
                completed_days TEXT NOT NULL,
                start_at TEXT NOT NULL,
                last_activity_at TEXT NOT NULL,
                last_action TEXT,
                last_action_was_auto_complete INTEGER DEFAULT 0,
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
            CREATE INDEX IF NOT EXISTS idx_program_progress_user_id 
            ON program_progress(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_program_progress_sync_status 
            ON program_progress(sync_status);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_program_progress_program_id 
            ON program_progress(program_id);
        `);

        console.log('Program progress table created successfully');
    }

    protected async insertRecord(db: any, localId: string, userId: string, data: CreateProgramProgressInput, timestamp: string, now: string): Promise<void> {
        await db.runAsync(
            `INSERT OR REPLACE INTO program_progress (
                id, user_id, program_id, current_day, completed_days, start_at, last_activity_at,
                last_action, last_action_was_auto_complete, sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [
                localId,
                userId,
                data.ProgramId,
                data.CurrentDay,
                JSON.stringify(data.CompletedDays),
                data.StartedAt,
                data.LastActivityAt,
                data.LastAction || null,
                data.LastActionWasAutoComplete ? 1 : 0,
                now,
                now,
            ],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<ProgramProgressRecord[]> {
        const { includeLocalOnly } = query;

        let sql = `SELECT * FROM program_progress WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        return (await db.getAllAsync(sql, params)) as ProgramProgressRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<ProgramProgressRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM program_progress WHERE id = ?', [localId])) as ProgramProgressRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateProgramProgressInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.ProgramId !== undefined) {
            setParts.push('program_id = ?');
            params.push(updates.ProgramId);
        }

        if (updates.CurrentDay !== undefined) {
            setParts.push('current_day = ?');
            params.push(updates.CurrentDay);
        }

        if (updates.CompletedDays !== undefined) {
            setParts.push('completed_days = ?');
            params.push(JSON.stringify(updates.CompletedDays));
        }

        if (updates.StartedAt !== undefined) {
            setParts.push('start_at = ?');
            params.push(updates.StartedAt);
        }

        if (updates.LastActivityAt !== undefined) {
            setParts.push('last_activity_at = ?');
            params.push(updates.LastActivityAt);
        }

        if (updates.LastAction !== undefined) {
            setParts.push('last_action = ?');
            params.push(updates.LastAction);
        }

        if (updates.LastActionWasAutoComplete !== undefined) {
            setParts.push('last_action_was_auto_complete = ?');
            params.push(updates.LastActionWasAutoComplete ? 1 : 0);
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE program_progress SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM program_progress WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<ProgramProgressRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM program_progress 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY updated_at DESC`,
            [userId],
        )) as ProgramProgressRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

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

        await db.runAsync(`UPDATE program_progress SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserProgramProgress): Promise<void> {
        // Handle case where program has ended (ProgramId is null)
        if (!serverRecord.ProgramId) {
            // Delete any existing local record since there's no active program
            await db.runAsync('DELETE FROM program_progress WHERE user_id = ?', [userId]);
            console.log('Deleted program progress - no active program');
            return;
        }

        // Check if record already exists
        const existing = (await db.getFirstAsync('SELECT * FROM program_progress WHERE user_id = ?', [userId])) as ProgramProgressRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE program_progress 
                 SET program_id = ?, current_day = ?, completed_days = ?, start_at = ?, last_activity_at = ?,
                     last_action = ?, last_action_was_auto_complete = ?, sync_status = 'synced',
                     updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.ProgramId,
                    serverRecord.CurrentDay,
                    JSON.stringify(serverRecord.CompletedDays),
                    serverRecord.StartedAt,
                    serverRecord.LastActivityAt,
                    serverRecord.LastAction || null,
                    serverRecord.LastActionWasAutoComplete ? 1 : 0,
                    new Date().toISOString(),
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO program_progress (
                    id, user_id, program_id, current_day, completed_days, start_at, last_activity_at,
                    last_action, last_action_was_auto_complete, sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.ProgramId,
                    serverRecord.CurrentDay,
                    JSON.stringify(serverRecord.CompletedDays),
                    serverRecord.StartedAt,
                    serverRecord.LastActivityAt,
                    serverRecord.LastAction || null,
                    serverRecord.LastActionWasAutoComplete ? 1 : 0,
                    now,
                    now,
                ],
            );
        }
    }

    /**
     * Merge single server record (override base class method that expects array)
     */
    public async mergeServerData(userId: string, serverRecord: UserProgramProgress): Promise<void>;
    public async mergeServerData(userId: string, serverRecords: UserProgramProgress[]): Promise<void>;
    public async mergeServerData(userId: string, serverData: UserProgramProgress | UserProgramProgress[]): Promise<void> {
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
                    // Handle single record (program progress case)
                    await this.mergeServerRecord(db, userId, serverData);
                    console.log(`Merged server ${this.options.tableName}`);
                }
            });
        }, `mergeServer${this.options.tableName}`);
    }

    protected async performCleanup(): Promise<number> {
        // No cleanup needed for program progress since there's only one per user
        // and we want to keep it indefinitely
        return 0;
    }

    protected transformToOfflineRecord(row: ProgramProgressRecord): OfflineRecord<UserProgramProgress> {
        const programProgress: UserProgramProgress = {
            UserId: row.user_id,
            ProgramId: row.program_id,
            CurrentDay: row.current_day,
            CompletedDays: JSON.parse(row.completed_days),
            StartedAt: row.start_at,
            LastActivityAt: row.last_activity_at,
            LastAction: row.last_action || undefined,
            LastActionWasAutoComplete: row.last_action_was_auto_complete === 1,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: programProgress,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: ProgramProgressRecord): any {
        return {
            userId: record.user_id,
            programId: record.program_id,
        };
    }

    // Convenience methods specific to program progress

    /**
     * Get the program progress for a user (since there's only one per user)
     */
    public async getProgressForUser(userId: string): Promise<OfflineRecord<UserProgramProgress> | null> {
        const records = await this.getRecords(userId, { includeLocalOnly: true });
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Create or update program progress (upsert operation)
     */
    public async upsertProgress(input: { userId: string; data: CreateProgramProgressInput }): Promise<OfflineRecord<UserProgramProgress>> {
        const existingProgress = await this.getProgressForUser(input.userId);

        if (existingProgress) {
            // Update existing progress
            await this.update(existingProgress.localId, input.data);
            const updated = await this.getById(existingProgress.localId);
            if (!updated) {
                throw new Error('Failed to retrieve updated program progress');
            }
            return updated;
        } else {
            // Create new progress
            const localId = await this.create({
                userId: input.userId,
                data: input.data,
                timestamp: new Date().toISOString(),
            });

            // Retrieve the created record
            const created = await this.getById(localId);
            if (!created) {
                throw new Error('Failed to retrieve created program progress');
            }
            return created;
        }
    }

    public transformToProgramProgressWithStatus(record: ProgramProgressRecord): ProgramProgressWithStatus {
        return {
            UserId: record.user_id,
            ProgramId: record.program_id,
            CurrentDay: record.current_day,
            CompletedDays: JSON.parse(record.completed_days),
            StartedAt: record.start_at,
            LastActivityAt: record.last_activity_at,
            LastAction: record.last_action || undefined,
            LastActionWasAutoComplete: record.last_action_was_auto_complete === 1,

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
export const programProgressOfflineService = ProgramProgressOfflineService.getInstance();
