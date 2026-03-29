// services/health/HealthConnectService.ts
// Android Health Connect integration service

import { Platform } from 'react-native';
import {
    initialize,
    requestPermission,
    readRecords,
    getSdkStatus,
    SdkAvailabilityStatus,
} from 'react-native-health-connect';
import {
    IHealthPlatform,
    WeightSample,
    SleepSample,
    BodyMeasurementSample,
    HealthPermissions,
    SyncOptions,
} from './HealthPlatform';
import { DataSource, SleepStages } from '../../types/userTypes';

/**
 * Android Health Connect service implementation
 * Provides access to Android Health Connect data
 */
export class HealthConnectService implements IHealthPlatform {
    private initialized: boolean = false;

    getPlatformName(): string {
        return 'Health Connect';
    }

    getDataSource(): DataSource {
        return DataSource.HEALTH_CONNECT;
    }

    async isAvailable(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            const status = await getSdkStatus();
            return (
                status === SdkAvailabilityStatus.SDK_AVAILABLE ||
                status === SdkAvailabilityStatus.SDK_AVAILABLE_PROVIDER_UPDATE_REQUIRED
            );
        } catch (error) {
            console.error('Health Connect availability check failed:', error);
            return false;
        }
    }

    async requestPermissions(permissions: HealthPermissions): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            // Initialize Health Connect
            const isInitialized = await initialize();
            if (!isInitialized) {
                console.error('Failed to initialize Health Connect');
                return false;
            }
            this.initialized = true;

            // Build permission array
            const permissionRequests: Array<{ accessType: 'read'; recordType: string }> = [];

            if (permissions.weight) {
                permissionRequests.push({
                    accessType: 'read',
                    recordType: 'Weight',
                });
            }

            if (permissions.sleep) {
                permissionRequests.push({
                    accessType: 'read',
                    recordType: 'SleepSession',
                });
            }

            if (permissions.bodyMeasurements) {
                permissionRequests.push(
                    {
                        accessType: 'read',
                        recordType: 'WaistCircumference',
                    },
                    {
                        accessType: 'read',
                        recordType: 'HipCircumference',
                    }
                );
            }

            // Request permissions
            const granted = await requestPermission(permissionRequests);
            return granted === true;
        } catch (error) {
            console.error('Health Connect permission request failed:', error);
            return false;
        }
    }

    async checkPermissions(permissions: HealthPermissions): Promise<HealthPermissions> {
        // Health Connect doesn't provide a way to check individual permissions
        // without requesting them. Return the requested permissions.
        if (!this.initialized) {
            const granted = await this.requestPermissions(permissions);
            return {
                weight: granted && permissions.weight,
                sleep: granted && permissions.sleep,
                bodyMeasurements: granted && permissions.bodyMeasurements,
            };
        }

        return permissions;
    }

    async syncWeightData(options: SyncOptions): Promise<WeightSample[]> {
        if (Platform.OS !== 'android' || !this.initialized) {
            return [];
        }

        try {
            const result = await readRecords('Weight', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: options.startDate.toISOString(),
                    endTime: options.endDate.toISOString(),
                },
            });

            const samples: WeightSample[] = (result || []).map((record: any) => ({
                value: record.weight.inKilograms, // Health Connect stores weight in kg
                timestamp: record.time,
                id: record.metadata.id,
                source: record.metadata.dataOrigin || 'Health Connect',
            }));

            return samples;
        } catch (error) {
            console.error('Failed to fetch weight data from Health Connect:', error);
            return [];
        }
    }

    async syncSleepData(options: SyncOptions): Promise<SleepSample[]> {
        if (Platform.OS !== 'android' || !this.initialized) {
            return [];
        }

        try {
            const result = await readRecords('SleepSession', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: options.startDate.toISOString(),
                    endTime: options.endDate.toISOString(),
                },
            });

            const samples: SleepSample[] = (result || []).map((record: any) => {
                const startTime = new Date(record.startTime);
                const endTime = new Date(record.endTime);
                const durationMinutes = Math.floor(
                    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                );

                // Map sleep stages if available
                const stages: SleepStages = {};
                if (record.stages && Array.isArray(record.stages)) {
                    record.stages.forEach((stage: any) => {
                        const stageDuration = Math.floor(
                            (new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) /
                                (1000 * 60)
                        );

                        switch (stage.stage) {
                            case 1: // STAGE_TYPE_DEEP
                                stages.deep = (stages.deep || 0) + stageDuration;
                                break;
                            case 2: // STAGE_TYPE_LIGHT
                                stages.light = (stages.light || 0) + stageDuration;
                                break;
                            case 3: // STAGE_TYPE_REM
                                stages.rem = (stages.rem || 0) + stageDuration;
                                break;
                            case 4: // STAGE_TYPE_AWAKE
                                stages.awake = (stages.awake || 0) + stageDuration;
                                break;
                        }
                    });
                }

                return {
                    startTime: record.startTime,
                    endTime: record.endTime,
                    durationMinutes,
                    id: record.metadata.id,
                    source: record.metadata.dataOrigin || 'Health Connect',
                    stages: Object.keys(stages).length > 0 ? stages : undefined,
                };
            });

            return samples;
        } catch (error) {
            console.error('Failed to fetch sleep data from Health Connect:', error);
            return [];
        }
    }

    async syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]> {
        if (Platform.OS !== 'android' || !this.initialized) {
            return [];
        }

        try {
            // Fetch waist circumference
            const waistResult = await readRecords('WaistCircumference', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: options.startDate.toISOString(),
                    endTime: options.endDate.toISOString(),
                },
            });

            // Fetch hip circumference
            const hipResult = await readRecords('HipCircumference', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: options.startDate.toISOString(),
                    endTime: options.endDate.toISOString(),
                },
            });

            // Combine measurements by date
            const measurementMap = new Map<string, BodyMeasurementSample>();

            // Process waist measurements
            (waistResult || []).forEach((record: any) => {
                const dateKey = new Date(record.time).toISOString().split('T')[0];
                if (!measurementMap.has(dateKey)) {
                    measurementMap.set(dateKey, {
                        timestamp: record.time,
                        id: record.metadata.id,
                        source: record.metadata.dataOrigin || 'Health Connect',
                    });
                }
                const measurement = measurementMap.get(dateKey)!;
                measurement.waist = record.circumference.inMeters * 100; // Convert m to cm
            });

            // Process hip measurements
            (hipResult || []).forEach((record: any) => {
                const dateKey = new Date(record.time).toISOString().split('T')[0];
                if (!measurementMap.has(dateKey)) {
                    measurementMap.set(dateKey, {
                        timestamp: record.time,
                        id: record.metadata.id,
                        source: record.metadata.dataOrigin || 'Health Connect',
                    });
                } else {
                    const measurement = measurementMap.get(dateKey)!;
                    measurement.hip = record.circumference.inMeters * 100; // Convert m to cm
                }
            });

            return Array.from(measurementMap.values());
        } catch (error) {
            console.error('Failed to fetch body measurements from Health Connect:', error);
            return [];
        }
    }

    // Future: Write-back methods
    async writeWeightData(weight: number, timestamp: string): Promise<boolean> {
        // Implementation would use insertRecords from Health Connect
        console.warn('Write-back not yet implemented for Health Connect');
        return false;
    }

    async writeSleepData(startTime: string, endTime: string): Promise<boolean> {
        // Implementation would use insertRecords from Health Connect
        console.warn('Write-back not yet implemented for Health Connect');
        return false;
    }
}

// Export singleton instance
export const healthConnectService = new HealthConnectService();
