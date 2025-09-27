// lib/storage/fitness-profile/FitnessProfileSyncHandler.ts

import { fitnessProfileOfflineService } from '@/lib/storage/fitness-profile/FitnessProfileOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserFitnessProfile } from '@/types';

export class FitnessProfileSyncHandler implements SyncHandler {
    private static instance: FitnessProfileSyncHandler;

    public static getInstance(): FitnessProfileSyncHandler {
        if (!FitnessProfileSyncHandler.instance) {
            FitnessProfileSyncHandler.instance = new FitnessProfileSyncHandler();
        }
        return FitnessProfileSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync fitness profile to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserFitnessProfile | void> {
        console.log(`Syncing fitness profile ${operation}: ${recordId}`);

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
            serverUpdatedAt?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await fitnessProfileOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create fitness profile on server
     */
    private async createOnServer(recordId: string): Promise<UserFitnessProfile> {
        const localRecord = await fitnessProfileOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local fitness profile not found: ${recordId}`);
        }

        try {
            // The UserService.updateUserFitnessProfile method handles both create and update
            // since there's only one fitness profile per user
            const serverResponse = await UserService.updateUserFitnessProfile(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            // Return just the fitness profile from the response
            return serverResponse.userFitnessProfile;
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
     * Update fitness profile on server
     */
    private async updateOnServer(recordId: string): Promise<UserFitnessProfile> {
        const localRecord = await fitnessProfileOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local fitness profile not found: ${recordId}`);
        }

        try {
            // Same as create - the UserService handles both create and update
            const serverResponse = await UserService.updateUserFitnessProfile(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            // Return just the fitness profile from the response
            return serverResponse.userFitnessProfile;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete fitness profile from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId } = data;

            if (!userId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}`);
            }

            // Note: You might need to implement a delete fitness profile method in UserService
            // For now, this is a placeholder since profile deletion might be rare
            console.warn('Delete fitness profile from server not implemented yet');

            // If you have a delete method:
            // await UserService.deleteUserFitnessProfile(userId);

            console.log(`Successfully deleted fitness profile from server for user: ${userId}`);
        } catch (error) {
            console.error(`Failed to delete fitness profile from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const fitnessProfileSyncHandler = FitnessProfileSyncHandler.getInstance();
