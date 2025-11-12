// lib/storage/nutrition-logs/NutritionLogSyncHandler.ts

import { nutritionLogOfflineService } from '@/lib/storage/nutrition-logs/NutritionLogOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserNutritionLog } from '@/types';

export class NutritionLogSyncHandler implements SyncHandler {
    private static instance: NutritionLogSyncHandler;

    public static getInstance(): NutritionLogSyncHandler {
        if (!NutritionLogSyncHandler.instance) {
            NutritionLogSyncHandler.instance = new NutritionLogSyncHandler();
        }
        return NutritionLogSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync nutrition log to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserNutritionLog | void> {
        console.log(`Syncing nutrition log ${operation}: ${recordId}`);

        switch (operation) {
            case 'CREATE':
            case 'UPDATE':
                // For nutrition logs, create and update are the same (upsert)
                return await this.upsertOnServer(recordId);
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
        await nutritionLogOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create/Update nutrition log on server (upsert)
     */
    private async upsertOnServer(recordId: string): Promise<UserNutritionLog> {
        const localRecord = await nutritionLogOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local nutrition log not found: ${recordId}`);
        }

        try {
            // Nutrition logs don't have a direct "create" endpoint
            // They're created/updated via add/update/delete food entry operations
            // So we just mark as synced if all food entries are synced

            // For now, mark as synced (individual food operations handle actual sync)
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            return localRecord.data;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Sync failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete nutrition log from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, dateString } = data;

            if (!userId || !dateString) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, dateString=${dateString}`);
            }

            // Delete entire day's log
            await UserService.deleteSpecificDayLog(userId, dateString);

            console.log(`Successfully deleted nutrition log from server for date: ${dateString}`);
        } catch (error) {
            console.error(`Failed to delete nutrition log from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const nutritionLogSyncHandler = NutritionLogSyncHandler.getInstance();
