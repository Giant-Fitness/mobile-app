// lib/storage/body-measurements/BodyMeasurementSyncHandler.ts

import { bodyMeasurementOfflineService } from '@/lib/storage/body-measurements/BodyMeasurementOfflineService';
import { SyncHandler } from '@/lib/sync/SyncQueueManager';
import UserService from '@/store/user/service';
import { UserBodyMeasurement } from '@/types';

export class BodyMeasurementSyncHandler implements SyncHandler {
    private static instance: BodyMeasurementSyncHandler;

    public static getInstance(): BodyMeasurementSyncHandler {
        if (!BodyMeasurementSyncHandler.instance) {
            BodyMeasurementSyncHandler.instance = new BodyMeasurementSyncHandler();
        }
        return BodyMeasurementSyncHandler.instance;
    }

    private constructor() {}

    /**
     * Sync body measurement to server based on operation type
     */
    public async syncToServer(operation: 'CREATE' | 'UPDATE' | 'DELETE', recordId: string, data: any): Promise<UserBodyMeasurement | void> {
        console.log(`Syncing body measurement ${operation}: ${recordId}`);

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
        await bodyMeasurementOfflineService.updateSyncStatus(recordId, status, options);
    }

    /**
     * Create body measurement on server
     */
    private async createOnServer(recordId: string): Promise<UserBodyMeasurement> {
        const localRecord = await bodyMeasurementOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local body measurement not found: ${recordId}`);
        }

        try {
            // Extract measurements from the local record
            const measurements = this.extractMeasurementsFromLocalRecord(localRecord.data);

            const serverResponse = await UserService.logBodyMeasurement(localRecord.userId, measurements, localRecord.data.MeasurementTimestamp);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.MeasurementTimestamp,
            });

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
     * Update body measurement on server
     */
    private async updateOnServer(recordId: string): Promise<UserBodyMeasurement> {
        const localRecord = await bodyMeasurementOfflineService.getById(recordId);

        if (!localRecord) {
            throw new Error(`Local body measurement not found: ${recordId}`);
        }

        try {
            const measurements = this.extractMeasurementsFromLocalRecord(localRecord.data);

            const serverResponse = await UserService.updateBodyMeasurement(localRecord.userId, localRecord.data.MeasurementTimestamp, measurements);

            // Update local record with server response
            await this.updateLocalSyncStatus(recordId, 'synced', {
                serverTimestamp: serverResponse.MeasurementTimestamp,
            });

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
     * Delete body measurement from server
     */
    private async deleteFromServer(data: any): Promise<void> {
        try {
            const { userId, measurementTimestamp } = data;

            if (!userId || !measurementTimestamp) {
                throw new Error(`Missing required data for DELETE operation: userId=${userId}, measurementTimestamp=${measurementTimestamp}`);
            }

            await UserService.deleteBodyMeasurement(userId, measurementTimestamp);
            console.log(`Successfully deleted body measurement from server: ${measurementTimestamp}`);
        } catch (error) {
            console.error(`Failed to delete body measurement from server:`, error);
            throw error;
        }
    }

    /**
     * Extract measurements object from local record data
     */
    private extractMeasurementsFromLocalRecord(data: UserBodyMeasurement): Record<string, number> {
        const measurements: Record<string, number> = {};

        // Extract all possible measurements, filtering out undefined values
        const measurementFields = [
            'waist',
            'hip',
            'chest',
            'neck',
            'shoulder',
            'abdomen',
            'leftBicep',
            'rightBicep',
            'leftThigh',
            'rightThigh',
            'leftCalf',
            'rightCalf',
            'waistHipRatio',
        ];

        measurementFields.forEach((field) => {
            const value = (data as any)[field];
            if (typeof value === 'number' && !isNaN(value)) {
                measurements[field] = value;
            }
        });

        return measurements;
    }
}

// Export singleton instance
export const bodyMeasurementSyncHandler = BodyMeasurementSyncHandler.getInstance();
