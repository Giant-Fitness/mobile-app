// lib/storage/exercise-substitutions/ExerciseSubstitutionOfflineService.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { BaseOfflineDataService, OfflineRecord, RecordQuery } from '@/lib/storage/base/BaseOfflineDataService';
import { UserExerciseSubstitution } from '@/types';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

// Exercise substitution specific types
export interface CreateExerciseSubstitutionInput {
    originalExerciseId: string;
    substituteExerciseId: string;
    programId?: string | null;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

export interface UpdateExerciseSubstitutionInput {
    substituteExerciseId?: string;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

// Extended query interface for exercise substitutions
export interface ExerciseSubstitutionQuery extends RecordQuery {
    programId?: string | null;
    includeTemporary?: boolean;
    date?: string;
}

interface ExerciseSubstitutionRecord {
    id: string;
    user_id: string;
    substitution_id: string;
    original_exercise_id: string;
    substitute_exercise_id: string;
    program_id: string | null;
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

export class ExerciseSubstitutionOfflineService extends BaseOfflineDataService<
    UserExerciseSubstitution,
    CreateExerciseSubstitutionInput,
    UpdateExerciseSubstitutionInput
> {
    private static instance: ExerciseSubstitutionOfflineService;

    public static getInstance(): ExerciseSubstitutionOfflineService {
        if (!ExerciseSubstitutionOfflineService.instance) {
            ExerciseSubstitutionOfflineService.instance = new ExerciseSubstitutionOfflineService();
        }
        return ExerciseSubstitutionOfflineService.instance;
    }

    private constructor() {
        super({
            tableName: 'exercise_substitutions',
            retentionDays: 365, // Keep substitutions for a year
            enableCleanup: false, // Users might want to keep these indefinitely
        });
    }

    protected async createTables(): Promise<void> {
        const db = databaseManager.getDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS exercise_substitutions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                substitution_id TEXT,
                original_exercise_id TEXT NOT NULL,
                substitute_exercise_id TEXT NOT NULL,
                program_id TEXT,
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

        // Create indexes for better query performance
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_substitutions_user_id 
            ON exercise_substitutions(user_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_substitutions_sync_status 
            ON exercise_substitutions(sync_status);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_substitutions_program_id 
            ON exercise_substitutions(program_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_substitutions_original_exercise 
            ON exercise_substitutions(original_exercise_id);
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_substitutions_temporary_date 
            ON exercise_substitutions(temporary_date);
        `);

        console.log('Exercise substitutions table created successfully');
    }

    protected async insertRecord(
        db: any,
        localId: string,
        userId: string,
        data: CreateExerciseSubstitutionInput,
        timestamp: string,
        now: string,
    ): Promise<void> {
        await db.runAsync(
            `INSERT INTO exercise_substitutions (
                id, user_id, original_exercise_id, substitute_exercise_id, program_id,
                is_temporary, temporary_date, sync_status, created_at, updated_at, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'local_only', ?, ?, 0)`,
            [
                localId,
                userId,
                data.originalExerciseId,
                data.substituteExerciseId,
                data.programId || null,
                data.isTemporary ? 1 : 0,
                data.temporaryDate || null,
                now,
                now,
            ],
        );
    }

    protected async selectRecords(db: any, userId: string, query: any): Promise<ExerciseSubstitutionRecord[]> {
        const { includeLocalOnly, programId, includeTemporary, date } = query;

        let sql = `SELECT * FROM exercise_substitutions WHERE user_id = ?`;
        const params: any[] = [userId];

        if (!includeLocalOnly) {
            sql += ` AND sync_status != 'local_only'`;
        }

        if (programId !== undefined) {
            if (programId === null) {
                sql += ` AND program_id IS NULL`;
            } else {
                sql += ` AND program_id = ?`;
                params.push(programId);
            }
        }

        if (includeTemporary === false) {
            sql += ` AND is_temporary = 0`;
        }

        if (date) {
            sql += ` AND (is_temporary = 0 OR temporary_date = ?)`;
            params.push(date);
        }

        sql += ` ORDER BY created_at DESC`;

        return (await db.getAllAsync(sql, params)) as ExerciseSubstitutionRecord[];
    }

    protected async selectRecordById(db: any, localId: string): Promise<ExerciseSubstitutionRecord | null> {
        return (await db.getFirstAsync('SELECT * FROM exercise_substitutions WHERE id = ?', [localId])) as ExerciseSubstitutionRecord | null;
    }

    protected async updateRecord(db: any, localId: string, updates: UpdateExerciseSubstitutionInput): Promise<void> {
        const now = new Date().toISOString();
        const setParts: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (updates.substituteExerciseId !== undefined) {
            setParts.push('substitute_exercise_id = ?');
            params.push(updates.substituteExerciseId);
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

        await db.runAsync(`UPDATE exercise_substitutions SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async deleteRecord(db: any, localId: string): Promise<void> {
        await db.runAsync('DELETE FROM exercise_substitutions WHERE id = ?', [localId]);
    }

    protected async selectPendingRecords(db: any, userId: string): Promise<ExerciseSubstitutionRecord[]> {
        return (await db.getAllAsync(
            `SELECT * FROM exercise_substitutions 
             WHERE user_id = ? AND sync_status IN ('local_only', 'failed')
             ORDER BY created_at DESC`,
            [userId],
        )) as ExerciseSubstitutionRecord[];
    }

    protected async updateRecordSyncStatus(db: any, localId: string, status: string, options: any): Promise<void> {
        const now = new Date().toISOString();
        const setParts = ['sync_status = ?', 'updated_at = ?', 'last_sync_attempt = ?'];
        const params = [status, now, now];

        if (options.substitutionId) {
            setParts.push('substitution_id = ?');
            params.push(options.substitutionId);
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

        await db.runAsync(`UPDATE exercise_substitutions SET ${setParts.join(', ')} WHERE id = ?`, params);
    }

    protected async mergeServerRecord(db: any, userId: string, serverRecord: UserExerciseSubstitution): Promise<void> {
        // Check if record already exists by SubstitutionId
        const existing = (await db.getFirstAsync('SELECT * FROM exercise_substitutions WHERE user_id = ? AND substitution_id = ?', [
            userId,
            serverRecord.SubstitutionId,
        ])) as ExerciseSubstitutionRecord | null;

        if (existing) {
            // Update existing record with server data
            await db.runAsync(
                `UPDATE exercise_substitutions 
                 SET original_exercise_id = ?, substitute_exercise_id = ?, program_id = ?,
                     is_temporary = ?, temporary_date = ?, created_at_server = ?, updated_at_server = ?,
                     sync_status = 'synced', updated_at = ?, retry_count = 0, error_message = NULL
                 WHERE id = ?`,
                [
                    serverRecord.OriginalExerciseId,
                    serverRecord.SubstituteExerciseId,
                    serverRecord.ProgramId,
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
                `INSERT INTO exercise_substitutions (
                    id, user_id, substitution_id, original_exercise_id, substitute_exercise_id, program_id,
                    is_temporary, temporary_date, created_at_server, updated_at_server,
                    sync_status, created_at, updated_at, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, 0)`,
                [
                    localId,
                    userId,
                    serverRecord.SubstitutionId,
                    serverRecord.OriginalExerciseId,
                    serverRecord.SubstituteExerciseId,
                    serverRecord.ProgramId,
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
        // Optional: Clean up old temporary substitutions that have expired
        // For now, skip cleanup since users might want to keep history
        return 0;
    }

    protected transformToOfflineRecord(row: ExerciseSubstitutionRecord): OfflineRecord<UserExerciseSubstitution> {
        const substitution: UserExerciseSubstitution = {
            UserId: row.user_id,
            SubstitutionId: row.substitution_id || row.id, // Use local ID if no server ID yet
            OriginalExerciseId: row.original_exercise_id,
            SubstituteExerciseId: row.substitute_exercise_id,
            ProgramId: row.program_id,
            IsTemporary: row.is_temporary === 1,
            TemporaryDate: row.temporary_date,
            CreatedAt: row.created_at_server || row.created_at,
            UpdatedAt: row.updated_at_server || row.updated_at,
        };

        return {
            localId: row.id,
            userId: row.user_id,
            data: substitution,
            timestamp: row.updated_at,
            syncStatus: row.sync_status,
            isLocalOnly: row.sync_status === 'local_only',
            retryCount: row.retry_count,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    protected extractDeleteData(record: ExerciseSubstitutionRecord): any {
        return {
            userId: record.user_id,
            substitutionId: record.substitution_id,
        };
    }

    /**
     * Find substitution by SubstitutionId (server ID)
     */
    public async getBySubstitutionId(userId: string, substitutionId: string): Promise<OfflineRecord<UserExerciseSubstitution> | null> {
        this.ensureInitialized();

        return this.queueOperation(async () => {
            const db = databaseManager.getDatabase();
            const record = (await db.getFirstAsync('SELECT * FROM exercise_substitutions WHERE user_id = ? AND substitution_id = ?', [
                userId,
                substitutionId,
            ])) as ExerciseSubstitutionRecord | null;

            return record ? this.transformToOfflineRecord(record) : null;
        }, `getBySubstitutionId_${substitutionId}`);
    }

    /**
     * Override getRecords to support extended query parameters
     */
    public async getRecords(userId: string, query?: ExerciseSubstitutionQuery): Promise<OfflineRecord<UserExerciseSubstitution>[]> {
        return super.getRecords(userId, query || {});
    }
}

// Export singleton instance
export const exerciseSubstitutionOfflineService = ExerciseSubstitutionOfflineService.getInstance();
