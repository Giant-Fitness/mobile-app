// lib/storage/exercise-set-modifications/ExerciseSetModificationSyncHandler.ts

import { exerciseSetModificationOfflineService } from '@/lib/storage/exercise-set-modifications/ExerciseSetModificationOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserExerciseSetModification } from '@/types';

export class ExerciseSetModificationSyncHandler implements SyncHandler {
    private static instance: ExerciseSetModificationSyncHandler;

    public static getInstance(): ExerciseSetModificationSyncHandler {
        if (!ExerciseSetModificationSyncHandler.instance) {
            ExerciseSetModificationSyncHandler.instance = new ExerciseSetModificationSyncHandler();
        }
        return ExerciseSetModificationSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync exercise set modification to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserExerciseSetModification | void> {
        console.log(`Syncing exercise set modification ${operation}: ${recordId}`);

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
            modificationId?: string;
            serverCreatedAt?: string;
            serverUpdatedAt?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await exerciseSetModificationOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create exercise set modification on server
     */
    private async createOnServer(recordId: string): Promise<UserExerciseSetModification> {
        const localRecord = await exerciseSetModificationOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise set modification not found: ${recordId}`);
        }

        try {
            const { data } = localRecord;

            // Call server to create modification
            const serverModification = await UserService.createExerciseSetModification(data.UserId, {
                exerciseId: data.ExerciseId,
                programId: data.ProgramId,
                originalSets: data.OriginalSets,
                additionalSets: data.AdditionalSets,
                isTemporary: data.IsTemporary,
                temporaryDate: data.TemporaryDate,
            });

            // Update local record with server ID and mark as synced
            await this.updateLocalSyncStatus(recordId, 'synced', {
                modificationId: serverModification.ModificationId,
                serverCreatedAt: serverModification.CreatedAt,
                serverUpdatedAt: serverModification.UpdatedAt,
            });

            console.log('Exercise set modification successfully created on server');
            return serverModification;
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
     * Update exercise set modification on server
     */
    private async updateOnServer(recordId: string): Promise<UserExerciseSetModification> {
        const localRecord = await exerciseSetModificationOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise set modification not found: ${recordId}`);
        }

        try {
            const { data } = localRecord;

            // Ensure we have a server ModificationId to update
            if (!data.ModificationId) {
                throw new Error('Cannot update modification without server ModificationId');
            }

            // Call server to update modification
            const serverModification = await UserService.updateExerciseSetModification(data.UserId, data.ModificationId, {
                additionalSets: data.AdditionalSets,
                isTemporary: data.IsTemporary,
                temporaryDate: data.TemporaryDate,
            });

            // Update local record as synced
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: serverModification.UpdatedAt,
            });

            console.log('Exercise set modification successfully updated on server');
            return serverModification;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete exercise set modification from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, modificationId } = data;

            if (!userId || !modificationId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, modificationId=${modificationId}`);
            }

            // Call server to delete modification
            await UserService.deleteExerciseSetModification(userId, modificationId);

            console.log(`Successfully deleted exercise set modification from server: ${modificationId}`);
        } catch (error) {
            console.error(`Failed to delete exercise set modification from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const exerciseSetModificationSyncHandler = ExerciseSetModificationSyncHandler.getInstance();
