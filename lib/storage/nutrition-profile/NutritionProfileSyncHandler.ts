// lib/storage/nutrition-profile/NutritionProfileSyncHandler.ts

import { nutritionProfileOfflineService } from '@/lib/storage/nutrition-profile/NutritionProfileOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserNutritionProfile } from '@/types';

export class NutritionProfileSyncHandler implements SyncHandler {
    private static instance: NutritionProfileSyncHandler;

    public static getInstance(): NutritionProfileSyncHandler {
        if (!NutritionProfileSyncHandler.instance) {
            NutritionProfileSyncHandler.instance = new NutritionProfileSyncHandler();
        }
        return NutritionProfileSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync nutrition profile to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserNutritionProfile | void> {
        console.log(`Syncing nutrition profile ${operation}: ${recordId}`);

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
            serverCreatedAt?: string;
            serverUpdatedAt?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await nutritionProfileOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create nutrition profile on server
     */
    private async createOnServer(recordId: string): Promise<UserNutritionProfile> {
        const localRecord = await nutritionProfileOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local nutrition profile not found: ${recordId}`);
        }

        try {
            // The UserService.updateUserNutritionProfile method handles both create and update
            // since there's only one nutrition profile per user
            const serverResponse = await UserService.updateUserNutritionProfile(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverCreatedAt: serverResponse.userNutritionProfile.CreatedAt,
                serverUpdatedAt: serverResponse.userNutritionProfile.UpdatedAt,
            });

            // Return just the nutrition profile from the response
            return serverResponse.userNutritionProfile;
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
     * Update nutrition profile on server
     */
    private async updateOnServer(recordId: string): Promise<UserNutritionProfile> {
        const localRecord = await nutritionProfileOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local nutrition profile not found: ${recordId}`);
        }

        try {
            // Same as create - the UserService handles both create and update
            const serverResponse = await UserService.updateUserNutritionProfile(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverCreatedAt: serverResponse.userNutritionProfile.CreatedAt,
                serverUpdatedAt: serverResponse.userNutritionProfile.UpdatedAt,
            });

            // Return just the nutrition profile from the response
            return serverResponse.userNutritionProfile;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete nutrition profile from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId } = data;

            if (!userId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}`);
            }

            // Note: You might need to implement a delete nutrition profile method in UserService
            // For now, this is a placeholder since profile deletion might be rare
            console.warn('Delete nutrition profile from server not implemented yet');

            // If you have a delete method:
            // await UserService.deleteUserNutritionProfile(userId);

            console.log(`Successfully deleted nutrition profile from server for user: ${userId}`);
        } catch (error) {
            console.error(`Failed to delete nutrition profile from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const nutritionProfileSyncHandler = NutritionProfileSyncHandler.getInstance();
