// lib/storage/exercise-substitutions/ExerciseSubstitutionSyncHandler.ts

import { exerciseSubstitutionOfflineService } from '@/lib/storage/exercise-substitutions/ExerciseSubstitutionOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserExerciseSubstitution } from '@/types';

export class ExerciseSubstitutionSyncHandler implements SyncHandler {
    private static instance: ExerciseSubstitutionSyncHandler;

    public static getInstance(): ExerciseSubstitutionSyncHandler {
        if (!ExerciseSubstitutionSyncHandler.instance) {
            ExerciseSubstitutionSyncHandler.instance = new ExerciseSubstitutionSyncHandler();
        }
        return ExerciseSubstitutionSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync exercise substitution to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserExerciseSubstitution | void> {
        console.log(`Syncing exercise substitution ${operation}: ${recordId}`);

        switch (operation) {
            case 'CREATE':
                return await this.createOnServer(recordId);
            case 'UPDATE':
                return await this.updateOnServer(recordId);
            case 'DELETE':
                return await this.deleteFromServer(data);
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }

    /**
     * Update local record sync status
     */
    public async updateLocalSyncStatus(
        recordId: string,
        status: 'synced' | 'failed' | 'conflict',
        options: {
            errorMessage?: string;
            substitutionId?: string;
            serverCreatedAt?: string;
            serverUpdatedAt?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await exerciseSubstitutionOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create exercise substitution on server
     */
    private async createOnServer(recordId: string): Promise<UserExerciseSubstitution> {
        const localRecord = await exerciseSubstitutionOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise substitution not found: ${recordId}`);
        }

        try {
            const { data } = localRecord;

            // Call server to create substitution
            const serverSubstitution = await UserService.createExerciseSubstitution(data.UserId, {
                originalExerciseId: data.OriginalExerciseId,
                substituteExerciseId: data.SubstituteExerciseId,
                programId: data.ProgramId,
                isTemporary: data.IsTemporary,
                temporaryDate: data.TemporaryDate,
            });

            // Update local record with server ID and mark as synced
            await this.updateLocalSyncStatus(recordId, 'synced', {
                substitutionId: serverSubstitution.SubstitutionId,
                serverCreatedAt: serverSubstitution.CreatedAt,
                serverUpdatedAt: serverSubstitution.UpdatedAt,
            });

            console.log('Exercise substitution successfully created on server');
            return serverSubstitution;
        } catch (error) {
            // Update local record with failure
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Create failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Update exercise substitution on server
     */
    private async updateOnServer(recordId: string): Promise<UserExerciseSubstitution> {
        const localRecord = await exerciseSubstitutionOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise substitution not found: ${recordId}`);
        }

        try {
            const { data } = localRecord;

            // Ensure we have a server SubstitutionId to update
            if (!data.SubstitutionId) {
                throw new Error('Cannot update substitution without server SubstitutionId');
            }

            // Call server to update substitution
            const serverSubstitution = await UserService.updateExerciseSubstitution(data.UserId, data.SubstitutionId, {
                substituteExerciseId: data.SubstituteExerciseId,
                isTemporary: data.IsTemporary,
                temporaryDate: data.TemporaryDate,
            });

            // Update local record as synced
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: serverSubstitution.UpdatedAt,
            });

            console.log('Exercise substitution successfully updated on server');
            return serverSubstitution;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete exercise substitution from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, substitutionId } = data;

            if (!userId || !substitutionId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, substitutionId=${substitutionId}`);
            }

            // Call server to delete substitution
            await UserService.deleteExerciseSubstitution(userId, substitutionId);

            console.log(`Successfully deleted exercise substitution from server: ${substitutionId}`);
        } catch (error) {
            console.error(`Failed to delete exercise substitution from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const exerciseSubstitutionSyncHandler = ExerciseSubstitutionSyncHandler.getInstance();
