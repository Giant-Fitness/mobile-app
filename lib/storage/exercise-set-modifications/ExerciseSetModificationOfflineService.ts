// lib/storage/exercise-set-modifications/ExerciseSetModificationOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord, RecordQuery } from '@/lib/storage/base/BaseOfflineDataService';
import { UserExerciseSetModification } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Exercise set modification specific types
export interface CreateExerciseSetModificationInput {
    exerciseId: string;
    programId: string;
    originalSets: number;
    additionalSets: number;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

export interface UpdateExerciseSetModificationInput {
    additionalSets?: number;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

// Extended query interface for exercise set modifications
export interface ExerciseSetModificationQuery extends RecordQuery {
    programId?: string;
    includeTemporary?: boolean;
    date?: string;
}

interface ExerciseSetModificationRecord {
    id: string;
    user_id: string;
    modification_id: string;
    exercise_id: string;
    program_id: string;
    original_sets: number;
    additional_sets: number;
    is_temporary: number; // SQLite boolean (0/1)
    temporary_date: string | null;
    created_at_server?: string;
    updated_at_server?: string;
    sync_status: 'local_only' | 'synced' | 'conflict' | 'failed';
    created_at: string;
    updated_at: string;
    retry_count: number;
    last_sync_attempt?: string;
    error_message?: string;
}

export class ExerciseSetModificationOfflineService extends BaseOfflineDataService<
    UserExerciseSetModification,
    CreateExerciseSetModificationInput,
    UpdateExerciseSetModificationInput
> {
    private static instance: ExerciseSetModificationOfflineService;

    public static getInstance(): ExerciseSetModificationOfflineService {
        if (!ExerciseSetModificationOfflineService.instance) {
            ExerciseSetModificationOfflineService.instance = new ExerciseSetModificationOfflineService();
        }
        return ExerciseSetModificationOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'exercise_set_modifications',
            retentionDays: 365,
            enableCleanup: false,
        });
    }

    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS exercise_set_modifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                modification_id TEXT,
                exercise_id TEXT NOT NULL,
                program_id TEXT NOT NULL,
                original_sets INTEGER NOT NULL,
                additional_sets INTEGER NOT NULL,
                is_temporary INTEGER DEFAULT 0,
                temporary_date TEXT,
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

        // Create indexes
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_set_mods_user_id 
            ON exercise_set_modifications(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_set_mods_sync_status 
            ON exercise_set_modifications(sync_status);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_set_mods_program_id 
            ON exercise_set_modifications(program_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_set_mods_exercise_id 
            ON exercise_set_modifications(exercise_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_set_mods_temporary_date 
            ON exercise_set_modifications(temporary_date);
        `);

        console.log('Exercise set modifications table created successfully');
    }

    protected async insertRecord(
        db: any,
        localId: string,
        userId: string,
        data: CreateExerciseSetModificationInput,
        timestamp: string,
        now: string,
    ): Promise<void> {
        await db.runAsync(
            `INSERT INTO exercise_set_modifications (
                id, user_id, exercise_id, program_id, original_sets, additional_sets,
                is_temporary, temporary_date, sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [
                localId,
                userId,
                data.exerciseId,
                data.programId,
                data.originalSets,
                data.additionalSets,
                data.isTemporary ? 1 : 0,
                data.temporaryDate || null,
                now,
                now,
            ],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<ExerciseSetModificationRecord[]> {
        const { includeLocalOnly, programId, includeTemporary, date } = query;

        let sql = `SELECT * FROM exercise_set_modifications WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (programId !== undefined) {
            sql += ` AND program_id = ?`;
            params.push(programId);
        }

        if (includeTemporary === false) {
            sql += ` AND is_temporary = 0`;
        }

        if (date) {
            sql += ` AND (is_temporary = 0 OR temporary_date = ?)`;
            params.push(date);
        }

        sql += ` ORDER BY created_at DESC`;

        return (await db.getAllAsync(sql, params)) as ExerciseSetModificationRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<ExerciseSetModificationRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM exercise_set_modifications WHERE id = ?', [localId])) as ExerciseSetModificationRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateExerciseSetModificationInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.additionalSets !== undefined) {
            setParts.push('additional_sets = ?');
            params.push(updates.additionalSets);
        }

        if (updates.isTemporary !== undefined) {
            setParts.push('is_temporary = ?');
            params.push(updates.isTemporary ? 1 : 0);
        }

        if (updates.temporaryDate !== undefined) {
            setParts.push('temporary_date = ?');
            params.push(updates.temporaryDate);
        }

        // Reset sync status to local_only if updating a synced record
        setParts.push(`sync_status = CASE 
            WHEN sync_status = 'synced' THEN 'local_only' 
            ELSE sync_status 
        END`);

        params.push(localId);

        await db.runAsync(`UPDATE exercise_set_modifications SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM exercise_set_modifications WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<ExerciseSetModificationRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM exercise_set_modifications 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY created_at DESC`,
            [userId],
        )) as ExerciseSetModificationRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.modificationId) {
            setParts.push('modification_id = ?');
            params.push(options.modificationId);
        }

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

        await db.runAsync(`UPDATE exercise_set_modifications SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserExerciseSetModification): Promise<void> {
        // Check if record already exists by ModificationId
        const existing = (await db.getFirstAsync('SELECT * FROM exercise_set_modifications WHERE user_id = ? AND modification_id = ?', [
            userId,
            serverRecord.ModificationId,
        ])) as ExerciseSetModificationRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE exercise_set_modifications 
                 SET exercise_id = ?, program_id = ?, original_sets = ?, additional_sets = ?,
                     is_temporary = ?, temporary_date = ?, created_at_server = ?, updated_at_server = ?,
                     sync_status = 'synced', updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.ExerciseId,
                    serverRecord.ProgramId,
                    serverRecord.OriginalSets,
                    serverRecord.AdditionalSets,
                    serverRecord.IsTemporary ? 1 : 0,
                    serverRecord.TemporaryDate,
                    serverRecord.CreatedAt,
                    serverRecord.UpdatedAt,
                    new Date().toISOString(),
                    existing.id,
                ],
            );
        } else {
            // Insert new server record
            const localId = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO exercise_set_modifications (
                    id, user_id, modification_id, exercise_id, program_id, original_sets, additional_sets,
                    is_temporary, temporary_date, created_at_server, updated_at_server,
                    sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.ModificationId,
                    serverRecord.ExerciseId,
                    serverRecord.ProgramId,
                    serverRecord.OriginalSets,
                    serverRecord.AdditionalSets,
                    serverRecord.IsTemporary ? 1 : 0,
                    serverRecord.TemporaryDate,
                    serverRecord.CreatedAt,
                    serverRecord.UpdatedAt,
                    now,
                    now,
                ],
            );
        }
    }

    protected async performCleanup(): Promise<number> {
        return 0;
    }

    protected transformToOfflineRecord(row: ExerciseSetModificationRecord): OfflineRecord<UserExerciseSetModification> {
        const modification: UserExerciseSetModification = {
            UserId: row.user_id,
            ModificationId: row.modification_id || row.id,
            ExerciseId: row.exercise_id,
            ProgramId: row.program_id,
            OriginalSets: row.original_sets,
            AdditionalSets: row.additional_sets,
            IsTemporary: row.is_temporary === 1,
            TemporaryDate: row.temporary_date,
            CreatedAt: row.created_at_server || row.created_at,
            UpdatedAt: row.updated_at_server || row.updated_at,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: modification,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: ExerciseSetModificationRecord): any {
        return {
            userId: record.user_id,
            modificationId: record.modification_id,
        };
    }

    /**
     * Find modification by ModificationId (server ID)
     */
    public async getByModificationId(userId: string, modificationId: string): Promise<OfflineRecord<UserExerciseSetModification> | null> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const record = (await db.getFirstAsync('SELECT * FROM exercise_set_modifications WHERE user_id = ? AND modification_id = ?', [
                userId,
                modificationId,
            ])) as ExerciseSetModificationRecord | null;

            return record ? this.transformToOfflineRecord(record) : null;
        }, `getByModificationId_${modificationId}`);
    }

    /**
     * Override getRecords to support extended query parameters
     */
    public async getRecords(userId: string, query?: ExerciseSetModificationQuery): Promise<OfflineRecord<UserExerciseSetModification>[]> {
        return super.getRecords(userId, query || {});
    }
}

// Export singleton instance
export const exerciseSetModificationOfflineService = ExerciseSetModificationOfflineService.getInstance();
