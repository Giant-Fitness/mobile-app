// lib/storage/weight-measurements/WeightMeasurementSyncHandler.ts

import { weightMeasurementOfflineService } from '@/lib/storage/weight-measurements/WeightMeasurementOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserWeightMeasurement } from '@/types';

export class WeightMeasurementSyncHandler implements SyncHandler {
    private static instance: WeightMeasurementSyncHandler;

    public static getInstance(): WeightMeasurementSyncHandler {
        if (!WeightMeasurementSyncHandler.instance) {
            WeightMeasurementSyncHandler.instance = new WeightMeasurementSyncHandler();
        }
        return WeightMeasurementSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync weight measurement to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserWeightMeasurement | void> {
        console.log(`Syncing weight measurement ${operation}: ${recordId}`);

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
        await weightMeasurementOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create weight measurement on server
     */
    private async createOnServer(recordId: string): Promise<UserWeightMeasurement> {
        const localRecord = await weightMeasurementOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local weight measurement not found: ${recordId}`);
        }

        try {
            const serverResponse = await UserService.logWeightMeasurement(localRecord.userId, localRecord.data.Weight, localRecord.data.MeasurementTimestamp);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.MeasurementTimestamp,
            });

            console.log(`Successfully created weight measurement on server: ${recordId}`);
            return serverResponse;
        } catch (error) {
            // Update local record with failure
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Create failed',
                incrementRetry: true,
            });

            console.error(`Failed to create weight measurement on server: ${recordId}`, error);
            throw error;
        }
    }

    /**
     * Update weight measurement on server
     */
    private async updateOnServer(recordId: string): Promise<UserWeightMeasurement> {
        const localRecord = await weightMeasurementOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local weight measurement not found: ${recordId}`);
        }

        try {
            const serverResponse = await UserService.updateWeightMeasurement(
                localRecord.userId,
                localRecord.data.MeasurementTimestamp,
                localRecord.data.Weight,
            );

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.MeasurementTimestamp,
            });

            console.log(`Successfully updated weight measurement on server: ${recordId}`);
            return serverResponse;
        } catch (error) {
            await this.updateLocalSyncStatus(recordId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Update failed',
                incrementRetry: true,
            });

            console.error(`Failed to update weight measurement on server: ${recordId}`, error);
            throw error;
        }
    }

    /**
     * Delete weight measurement from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            console.log(`Processing DELETE sync entry for weight measurement`);

            // Extract data from queue entry for DELETE operations
            const { userId, measurementTimestamp } = data;

            if (!userId || !measurementTimestamp) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, measurementTimestamp=${measurementTimestamp}`);
            }

            // Delete from server
            await UserService.deleteWeightMeasurement(userId, measurementTimestamp);

            console.log(`Successfully deleted weight measurement from server: ${measurementTimestamp}`);
        } catch (error) {
            console.error(`Failed to delete weight measurement from server:`, error);
            throw error;
        }
    }

    /**
     * Handle conflict resolution when server rejects our changes
     * This implements "server authority" - server always wins
     */
    public async handleConflict(recordId: string, localData: UserWeightMeasurement, serverData: UserWeightMeasurement): Promise<void> {
        console.log(`Resolving weight measurement conflict for record: ${recordId}`);
        console.log(`Local data:`, localData);
        console.log(`Server data (authoritative):`, serverData);

        try {
            // Server authority: update local record to match server
            await weightMeasurementOfflineService.update(recordId, {
                weight: serverData.Weight,
                measurementTimestamp: serverData.MeasurementTimestamp,
            });

            // Mark as synced since we've resolved the conflict
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverData.MeasurementTimestamp,
            });

            console.log(`Weight measurement conflict resolved - local data updated to match server`);
        } catch (error) {
            console.error(`Failed to resolve weight measurement conflict:`, error);

            // Mark as conflict if we can't resolve
            await this.updateLocalSyncStatus(recordId, 'conflict', {
                errorMessage: `Conflict resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });

            throw error;
        }
    }

    /**
     * Batch sync multiple weight measurements
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

        console.log(`Starting batch sync for ${records.length} weight measurements`);

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
     * Force sync all pending weight measurements for a user
     * Useful for manual sync triggers or app resume
     */
    public async forceSyncAllPending(userId: string): Promise<void> {
        console.log(`Force syncing all pending weight measurements for user: ${userId}`);

        try {
            const pendingRecords = await weightMeasurementOfflineService.getPendingRecords(userId);

            if (pendingRecords.length === 0) {
                console.log('No pending weight measurements to sync');
                return;
            }

            const batchRecords = pendingRecords.map((record) => ({
                recordId: record.localId,
                operation: (record.syncStatus === 'local_only' ? 'CREATE' : 'UPDATE') as 'CREATE' | 'UPDATE',
                data: record.data,
            }));

            const results = await this.batchSyncToServer(batchRecords);

            const successCount = results.filter((r) => r.success).length;
            console.log(`Force sync completed: ${successCount}/${pendingRecords.length} weight measurements synced`);
        } catch (error) {
            console.error('Force sync failed:', error);
            throw error;
        }
    }
    /**
     * Get sync statistics for weight measurements
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
            const allRecords = await weightMeasurementOfflineService.getRecords(userId, {
                includeLocalOnly: true,
            });

            const stats = {
                totalRecords: allRecords.length,
                syncedRecords: allRecords.filter((r) => r.syncStatus === 'synced').length,
                pendingRecords: allRecords.filter((r) => r.syncStatus === 'local_only').length,
                failedRecords: allRecords.filter((r) => r.syncStatus === 'failed').length,
                conflictRecords: allRecords.filter((r) => r.syncStatus === 'conflict').length,
            };

            console.log('Weight measurement sync stats:', stats);
            return stats;
        } catch (error) {
            console.error('Failed to get sync stats:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const weightMeasurementSyncHandler = WeightMeasurementSyncHandler.getInstance();
