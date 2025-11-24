// lib/storage/exercise-history/ExerciseHistorySyncHandler.ts

import { exerciseHistoryOfflineService } from '@/lib/storage/exercise-history/ExerciseHistoryOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import ExerciseProgressService from '@/store/exerciseProgress/service';
import { ExerciseLog } from '@/types/exerciseProgressTypes';

export class ExerciseHistorySyncHandler implements SyncHandler {
    private static instance: ExerciseHistorySyncHandler;

    public static getInstance(): ExerciseHistorySyncHandler {
        if (!ExerciseHistorySyncHandler.instance) {
            ExerciseHistorySyncHandler.instance = new ExerciseHistorySyncHandler();
        }
        return ExerciseHistorySyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync exercise history to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<ExerciseLog | void> {
        console.log(`Syncing exercise history ${operation}: ${recordId}`);

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
            serverTimestamp?: string;
            incrementRetry?: boolean;
        },
    ): Promise<void> {
        await exerciseHistoryOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create exercise history on server
     */
    private async createOnServer(recordId: string): Promise<ExerciseLog> {
        const localRecord = await exerciseHistoryOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise history not found: ${recordId}`);
        }

        try {
            const serverResponse = await ExerciseProgressService.saveExerciseProgress(
                localRecord.userId,
                localRecord.data.ExerciseId,
                localRecord.data.Date,
                localRecord.data.Sets,
            );

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.UpdatedAt,
            });

            console.log(`Successfully created exercise history on server: ${recordId}`);
            return serverResponse;
        } catch (error) {
            // Update local record with failure
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Create failed',
                incrementRetry: true,
            });

            console.error(`Failed to create exercise history on server: ${recordId}`, error);
            throw error;
        }
    }

    /**
     * Update exercise history on server
     */
    private async updateOnServer(recordId: string): Promise<ExerciseLog> {
        const localRecord = await exerciseHistoryOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local exercise history not found: ${recordId}`);
        }

        try {
            const serverResponse = await ExerciseProgressService.saveExerciseProgress(
                localRecord.userId,
                localRecord.data.ExerciseId,
                localRecord.data.Date,
                localRecord.data.Sets,
            );

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.UpdatedAt,
            });

            console.log(`Successfully updated exercise history on server: ${recordId}`);
            return serverResponse;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            console.error(`Failed to update exercise history on server: ${recordId}`, error);
            throw error;
        }
    }

    /**
     * Delete exercise history from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            console.log(`Processing DELETE sync entry for exercise history`);

            // Extract data from queue entry for DELETE operations
            const { userId, exerciseId, date } = data;

            if (!userId || !exerciseId || !date) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, exerciseId=${exerciseId}, date=${date}`);
            }

            // Delete from server
            await ExerciseProgressService.deleteExerciseLog(userId, exerciseId, date);

            console.log(`Successfully deleted exercise history from server: ${exerciseId} on ${date}`);
        } catch (error) {
            console.error(`Failed to delete exercise history from server:`, error);
            throw error;
        }
    }

    /**
     * Handle conflict resolution when server rejects our changes
     * This implements "server authority" - server always wins
     */
    public async handleConflict(recordId: string, localData: ExerciseLog, serverData: ExerciseLog): Promise<void> {
        console.log(`Resolving exercise history conflict for record: ${recordId}`);
        console.log(`Local data:`, localData);
        console.log(`Server data (authoritative):`, serverData);

        try {
            // Server authority: update local record to match server
            await exerciseHistoryOfflineService.update(recordId, {
                sets: serverData.Sets,
            });

            // Mark as synced since we've resolved the conflict
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverData.UpdatedAt,
            });

            console.log(`Exercise history conflict resolved - local data updated to match server`);
        } catch (error) {
            console.error(`Failed to resolve exercise history conflict:`, error);

            // Mark as conflict if we can't resolve
            await this.updateLocalSyncStatus(recordId, 'conflict', {
                errorMessage: `Conflict resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });

            throw error;
        }
    }

    /**
     * Batch sync multiple exercise history records
     * Useful for initial sync or bulk operations
     */
    public async batchSyncToServer(
        records: Array<{
            recordId: string;
            operation: 'CREATE' | 'UPDATE' | 'DELETE';
            data: any;
        }>,
    ): Promise<Array<{ recordId: string; success: boolean; error?: string }>> {
        const results: Array<{ recordId: string; success: boolean; error?: string }> = [];

        console.log(`Starting batch sync for ${records.length} exercise history records`);

        for (const record of records) {
            try {
                await this.syncToServer(record.operation, record.recordId, record.data);
                results.push({ recordId: record.recordId, success: true });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({ recordId: record.recordId, success: false, error: errorMessage });
                console.error(`Batch sync failed for record ${record.recordId}:`, error);
            }

            // Small delay between requests to avoid overwhelming server
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;

        console.log(`Batch sync completed: ${successCount} succeeded, ${failureCount} failed`);
        return results;
    }

    /**
     * Force sync all pending exercise history for a user
     * Useful for manual sync triggers or app resume
     */
    public async forceSyncAllPending(userId: string): Promise<void> {
        console.log(`Force syncing all pending exercise history for user: ${userId}`);

        try {
            const pendingRecords = await exerciseHistoryOfflineService.getPendingRecords(userId);

            if (pendingRecords.length === 0) {
                console.log('No pending exercise history to sync');
                return;
            }

            const batchRecords = pendingRecords.map((record) => ({
                recordId: record.localId,
                operation: (record.syncStatus === 'local_only' ? 'CREATE' : 'UPDATE') as 'CREATE' | 'UPDATE',
                data: record.data,
            }));

            const results = await this.batchSyncToServer(batchRecords);

            const successCount = results.filter((r) => r.success).length;
            console.log(`Force sync completed: ${successCount}/${pendingRecords.length} exercise history records synced`);
        } catch (error) {
            console.error('Force sync failed:', error);
            throw error;
        }
    }

    /**
     * Get sync statistics for exercise history
     * Useful for debugging and monitoring
     */
    public async getSyncStats(userId: string): Promise<{
        totalRecords: number;
        syncedRecords: number;
        pendingRecords: number;
        failedRecords: number;
        conflictRecords: number;
    }> {
        try {
            const allRecords = await exerciseHistoryOfflineService.getRecords(userId, {
                includeLocalOnly: true,
            });

            const stats = {
                totalRecords: allRecords.length,
                syncedRecords: allRecords.filter((r) => r.syncStatus === 'synced').length,
                pendingRecords: allRecords.filter((r) => r.syncStatus === 'local_only').length,
                failedRecords: allRecords.filter((r) => r.syncStatus === 'failed').length,
                conflictRecords: allRecords.filter((r) => r.syncStatus === 'conflict').length,
            };

            console.log('Exercise history sync stats:', stats);
            return stats;
        } catch (error) {
            console.error('Failed to get sync stats:', error);
            throw error;
        }
    }

    /**
     * Sync specific exercise history from server
     * Useful for pulling latest data for a specific exercise
     */
    public async syncFromServer(userId: string, exerciseId: string, options?: { limit?: number }): Promise<void> {
        console.log(`Syncing exercise history from server for exercise: ${exerciseId}`);

        try {
            const serverHistory = await ExerciseProgressService.getExerciseHistory(userId, exerciseId, options || {});

            // Convert array to ExerciseLog array if needed
            const historyArray = Array.isArray(serverHistory) ? serverHistory : Object.values(serverHistory);

            if (historyArray.length > 0) {
                await exerciseHistoryOfflineService.mergeServerData(userId, historyArray as ExerciseLog[]);
                console.log(`Synced ${historyArray.length} exercise history records from server for ${exerciseId}`);
            }
        } catch (error) {
            console.error(`Failed to sync exercise history from server:`, error);
            throw error;
        }
    }

    /**
     * Sync all exercise history from server for initial load
     * This should be called during app initialization if local DB is empty
     */
    public async syncAllFromServer(userId: string, exerciseIds: string[]): Promise<void> {
        console.log(`Syncing all exercise history from server for ${exerciseIds.length} exercises`);

        try {
            let totalSynced = 0;

            // Sync in batches to avoid overwhelming the server
            const batchSize = 5;
            for (let i = 0; i < exerciseIds.length; i += batchSize) {
                const batch = exerciseIds.slice(i, i + batchSize);

                const promises = batch.map(async (exerciseId) => {
                    try {
                        const serverHistory = await ExerciseProgressService.getExerciseHistory(userId, exerciseId, { limit: 50 });
                        const historyArray = Array.isArray(serverHistory) ? serverHistory : Object.values(serverHistory);

                        if (historyArray.length > 0) {
                            await exerciseHistoryOfflineService.mergeServerData(userId, historyArray as ExerciseLog[]);
                            totalSynced += historyArray.length;
                        }
                    } catch (error) {
                        console.warn(`Failed to sync history for exercise ${exerciseId}:`, error);
                        // Continue with other exercises even if one fails
                    }
                });

                await Promise.allSettled(promises);

                // Small delay between batches
                if (i + batchSize < exerciseIds.length) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }

            console.log(`Synced ${totalSynced} total exercise history records from server`);
        } catch (error) {
            console.error('Failed to sync all exercise history from server:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const exerciseHistorySyncHandler = ExerciseHistorySyncHandler.getInstance();
