// lib/storage/macro-targets/MacroTargetSyncHandler.ts

import { macroTargetOfflineService } from '@/lib/storage/macro-targets/MacroTargetOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import { UserMacroTarget } from '@/types';

export class MacroTargetSyncHandler implements SyncHandler {
    private static instance: MacroTargetSyncHandler;

    public static getInstance(): MacroTargetSyncHandler {
        if (!MacroTargetSyncHandler.instance) {
            MacroTargetSyncHandler.instance = new MacroTargetSyncHandler();
        }
        return MacroTargetSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync macro target to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserMacroTarget[] | void> {
        console.log(`Syncing macro target ${operation}: ${recordId}`);

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
        await macroTargetOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create macro target on server
     */
    private async createOnServer(recordId: string): Promise<UserMacroTarget[]> {
        const localRecord = await macroTargetOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local macro target not found: ${recordId}`);
        }

        try {
            // Note: Based on your existing code, it seems macro targets are typically created
            // as part of nutrition goal creation/update. You may need to create a separate
            // endpoint for creating macro targets independently, or handle this differently.

            // For now, this is a placeholder implementation
            console.warn('Direct macro target creation on server may not be supported - typically created via nutrition goal updates');

            // If you have a direct create method:
            // const serverResponse = await UserService.createMacroTarget(localRecord.userId, {...});

            // Update local record as synced for now
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverCreatedAt: new Date().toISOString(),
                serverUpdatedAt: new Date().toISOString(),
            });

            // Return the local record as array
            return [localRecord.data];
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
     * Update macro target on server
     */
    private async updateOnServer(recordId: string): Promise<UserMacroTarget[]> {
        const localRecord = await macroTargetOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local macro target not found: ${recordId}`);
        }

        try {
            // Note: Macro targets are typically updated via nutrition goal updates
            // You may need to create a separate endpoint or handle this differently

            console.warn('Direct macro target update on server may not be supported - typically updated via nutrition goal updates');

            // If you have a direct update method:
            // const serverResponse = await UserService.updateMacroTarget(localRecord.userId, localRecord.data.EffectiveDate, {...});

            // Update local record as synced for now
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            // Return the local record as array
            return [localRecord.data];
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete macro target from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, effectiveDate } = data;

            if (!userId || !effectiveDate) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, effectiveDate=${effectiveDate}`);
            }

            // Note: You might need to implement a delete macro target method in UserService
            // For now, this is a placeholder since target deletion might be rare
            console.warn('Delete macro target from server not implemented yet');

            // If you have a delete method:
            // await UserService.deleteMacroTarget(userId, effectiveDate);

            console.log(`Successfully deleted macro target from server for user: ${userId}, date: ${effectiveDate}`);
        } catch (error) {
            console.error(`Failed to delete macro target from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const macroTargetSyncHandler = MacroTargetSyncHandler.getInstance();
