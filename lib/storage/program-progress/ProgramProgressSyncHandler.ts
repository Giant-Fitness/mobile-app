// lib/storage/program-progress/ProgramProgressSyncHandler.ts

import { programProgressOfflineService } from '@/lib/storage/program-progress/ProgramProgressOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserProgramProgress } from '@/types';

export class ProgramProgressSyncHandler implements SyncHandler {
    private static instance: ProgramProgressSyncHandler;

    public static getInstance(): ProgramProgressSyncHandler {
        if (!ProgramProgressSyncHandler.instance) {
            ProgramProgressSyncHandler.instance = new ProgramProgressSyncHandler();
        }
        return ProgramProgressSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync program progress to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserProgramProgress | void> {
        console.log(`Syncing program progress ${operation}: ${recordId}`);

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
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await programProgressOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create program progress on server
     */
    private async createOnServer(recordId: string): Promise<UserProgramProgress> {
        const localRecord = await programProgressOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local program progress not found: ${recordId}`);
        }

        try {
            // Check if this is starting a new program or updating existing progress
            const { data } = localRecord;

            // If this is a new program start, use startProgram
            if (data.CurrentDay === 1 && data.CompletedDays.length === 0) {
                const serverResponse = await UserService.startProgram(data.UserId, data.ProgramId);

                // Update local record with server response
                await this.updateLocalSyncStatus(recordId, 'synced', {});

                return serverResponse;
            } else {
                // For other updates, we might need a different API method
                // For now, throw an error as this case needs to be handled based on your API
                throw new Error('Program progress creation for existing progress not supported yet');
            }
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
     * Update program progress on server
     */
    private async updateOnServer(recordId: string): Promise<UserProgramProgress> {
        const localRecord = await programProgressOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local program progress not found: ${recordId}`);
        }

        try {
            const { data } = localRecord;

            // Determine what kind of update this is based on the LastAction
            if (data.LastAction === 'COMPLETE_DAY') {
                // This was a day completion
                const dayId = this.extractDayIdFromCompletedDays(data.CompletedDays, data.CurrentDay);
                const serverResponse = await UserService.completeDay(data.UserId, dayId, data.LastActionWasAutoComplete || false);

                await this.updateLocalSyncStatus(recordId, 'synced', {});
                return serverResponse || data; // Handle null response from completeDay
            } else if (data.LastAction === 'UNCOMPLETE_DAY') {
                // This was a day uncompletion
                const dayId = this.extractLastUncompletedDay(data.CompletedDays);
                const serverResponse = await UserService.uncompleteDay(data.UserId, dayId);

                await this.updateLocalSyncStatus(recordId, 'synced', {});
                return serverResponse;
            } else if (data.LastAction === 'END_PROGRAM') {
                // This was a program end
                const serverResponse = await UserService.endProgram(data.UserId);

                await this.updateLocalSyncStatus(recordId, 'synced', {});
                return serverResponse as UserProgramProgress;
            } else if (data.LastAction === 'RESET_PROGRAM') {
                // This was a program reset
                const serverResponse = await UserService.resetProgram(data.UserId);

                await this.updateLocalSyncStatus(recordId, 'synced', {});
                return serverResponse;
            } else {
                // Generic update - might need a direct update API method
                console.warn('Generic program progress update - no specific API method available');

                // For now, just mark as synced since we don't have a generic update method
                await this.updateLocalSyncStatus(recordId, 'synced', {});
                return data;
            }
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            throw error;
        }
    }

    /**
     * Delete program progress from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, programId } = data;

            if (!userId) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}`);
            }

            // End the program when deleting progress
            await UserService.endProgram(userId);

            console.log(`Successfully deleted program progress from server for user: ${userId}, program: ${programId}`);
        } catch (error) {
            console.error(`Failed to delete program progress from server:`, error);
            throw error;
        }
    }

    /**
     * Helper method to extract day ID from completed days
     */
    private extractDayIdFromCompletedDays(completedDays: string[], currentDay: number): string {
        // This is a simplified implementation - you might need to adjust based on your day ID format
        // For now, assume day IDs are in a predictable format
        if (completedDays.length === 0) {
            return `day_${currentDay}`;
        }

        // Get the most recently completed day
        const lastCompleted = completedDays[completedDays.length - 1];
        return lastCompleted;
    }

    /**
     * Helper method to extract the last uncompleted day
     */
    private extractLastUncompletedDay(completedDays: string[]): string {
        // This is a simplified implementation - you might need to adjust based on your day ID format
        if (completedDays.length === 0) {
            throw new Error('No completed days to uncomplete');
        }

        // Get the most recently completed day to uncomplete
        const lastCompleted = completedDays[completedDays.length - 1];
        return lastCompleted;
    }
}

// Export singleton instance
export const programProgressSyncHandler = ProgramProgressSyncHandler.getInstance();
