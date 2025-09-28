// lib/storage/app-settings/AppSettingsSyncHandler.ts

import { appSettingsOfflineService } from '@/lib/storage/app-settings/AppSettingsOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserAppSettings } from '@/types';

export class AppSettingsSyncHandler implements SyncHandler {
    private static instance: AppSettingsSyncHandler;

    public static getInstance(): AppSettingsSyncHandler {
        if (!AppSettingsSyncHandler.instance) {
            AppSettingsSyncHandler.instance = new AppSettingsSyncHandler();
        }
        return AppSettingsSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync app settings to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserAppSettings | void> {
        console.log(`Syncing app settings ${operation}: ${recordId}`);

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
        await appSettingsOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create app settings on server
     */
    private async createOnServer(recordId: string): Promise<UserAppSettings> {
        const localRecord = await appSettingsOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local app settings not found: ${recordId}`);
        }

        try {
            // The UserService.updateUserAppSettings method handles both create and update
            // since there's only one app settings record per user
            const serverResponse = await UserService.updateUserAppSettings(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            // UserService.updateUserAppSettings returns UserAppSettings directly
            return serverResponse;
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
     * Update app settings on server
     */
    private async updateOnServer(recordId: string): Promise<UserAppSettings> {
        const localRecord = await appSettingsOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local app settings not found: ${recordId}`);
        }

        try {
            // Same as create - the UserService handles both create and update
            const serverResponse = await UserService.updateUserAppSettings(localRecord.userId, localRecord.data);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            // UserService.updateUserAppSettings returns UserAppSettings directly
            return serverResponse;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete app settings from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId } = data;

            if (!userId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}`);
            }

            // Note: You might need to implement a delete app settings method in UserService
            // For now, this is a placeholder since settings deletion might be rare
            console.warn('Delete app settings from server not implemented yet');

            // If you have a delete method:
            // await UserService.deleteUserAppSettings(userId);

            console.log(`Successfully deleted app settings from server for user: ${userId}`);
        } catch (error) {
            console.error(`Failed to delete app settings from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const appSettingsSyncHandler = AppSettingsSyncHandler.getInstance();
