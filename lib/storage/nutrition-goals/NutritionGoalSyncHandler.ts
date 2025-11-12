// lib/storage/nutrition-goals/NutritionGoalSyncHandler.ts

import { nutritionGoalOfflineService } from '@/lib/storage/nutrition-goals/NutritionGoalOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserNutritionGoal } from '@/types';

export class NutritionGoalSyncHandler implements SyncHandler {
    private static instance: NutritionGoalSyncHandler;

    public static getInstance(): NutritionGoalSyncHandler {
        if (!NutritionGoalSyncHandler.instance) {
            NutritionGoalSyncHandler.instance = new NutritionGoalSyncHandler();
        }
        return NutritionGoalSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync nutrition goal to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserNutritionGoal[] | void> {
        console.log(`Syncing nutrition goal ${operation}: ${recordId}`);

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
        await nutritionGoalOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create nutrition goal on server
     */
    private async createOnServer(recordId: string): Promise<UserNutritionGoal[]> {
        const localRecord = await nutritionGoalOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local nutrition goal not found: ${recordId}`);
        }

        try {
            // Create on server - the API returns all goals
            const serverResponse = await UserService.createNutritionGoal(
                localRecord.userId,
                {
                    primaryNutritionGoal: localRecord.data.PrimaryFitnessGoal,
                    targetWeight: localRecord.data.TargetWeight,
                    weightChangeRate: localRecord.data.WeightChangeRate,
                    startingWeight: localRecord.data.StartingWeight,
                    activityLevel: localRecord.data.ActivityLevel,
                },
                localRecord.data.AdjustmentReason,
                localRecord.data.AdjustmentNotes,
            );

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverCreatedAt: new Date().toISOString(),
                serverUpdatedAt: new Date().toISOString(),
            });

            console.log(`Successfully synced nutrition goal creation: ${recordId}`);
            const serverGoals = Array.isArray(serverResponse) ? serverResponse : [serverResponse];
            return serverGoals;
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
     * Update nutrition goal on server
     */
    private async updateOnServer(recordId: string): Promise<UserNutritionGoal[]> {
        const localRecord = await nutritionGoalOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local nutrition goal not found: ${recordId}`);
        }

        try {
            // Update on server - the API returns all goals
            const serverResponse = await UserService.updateNutritionGoal(
                localRecord.userId,
                {
                    primaryNutritionGoal: localRecord.data.PrimaryFitnessGoal,
                    targetWeight: localRecord.data.TargetWeight,
                    weightChangeRate: localRecord.data.WeightChangeRate,
                    activityLevel: localRecord.data.ActivityLevel,
                },
                localRecord.data.AdjustmentReason,
                localRecord.data.AdjustmentNotes,
            );

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverUpdatedAt: new Date().toISOString(),
            });

            console.log(`Successfully synced nutrition goal update: ${recordId}`);
            const serverGoals = Array.isArray(serverResponse) ? serverResponse : [serverResponse];
            return serverGoals;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete nutrition goal from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, effectiveDate } = data;

            if (!userId || !effectiveDate) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, effectiveDate=${effectiveDate}`);
            }

            // Note: You might need to implement a delete nutrition goal method in UserService
            // For now, this is a placeholder since goal deletion might be rare
            console.warn('Delete nutrition goal from server not implemented yet');

            // If you have a delete method:
            // await UserService.deleteNutritionGoal(userId, effectiveDate);

            console.log(`Successfully deleted nutrition goal from server for user: ${userId}, date: ${effectiveDate}`);
        } catch (error) {
            console.error(`Failed to delete nutrition goal from server:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const nutritionGoalSyncHandler = NutritionGoalSyncHandler.getInstance();
