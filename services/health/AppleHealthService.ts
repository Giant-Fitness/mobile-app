// services/health/AppleHealthService.ts
// Apple HealthKit integration service

import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
} from 'react-native-health';
import { Platform } from 'react-native';
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
 * Apple HealthKit service implementation
 * Provides access to iOS Health app data
 */
export class AppleHealthService implements IHealthPlatform {
    private initialized: boolean = false;

    getPlatformName(): string {
        return 'Apple Health';
    }

    getDataSource(): DataSource {
        return DataSource.APPLE_HEALTH;
    }

    async isAvailable(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            return false;
        }

        return new Promise((resolve) => {
            AppleHealthKit.isAvailable((error, available) => {
                if (error) {
                    console.error('Apple Health availability check failed:', error);
                    resolve(false);
                    return;
                }
                resolve(available === true);
            });
        });
    }

    async requestPermissions(permissions: HealthPermissions): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            return false;
        }

        const healthKitPermissions: HealthKitPermissions = {
            permissions: {
                read: [],
                write: [], // Empty for read-only initially
            },
        };

        // Map our permission types to HealthKit permission types
        if (permissions.weight) {
            healthKitPermissions.permissions.read.push(
                AppleHealthKit.Constants.Permissions.Weight,
                AppleHealthKit.Constants.Permissions.BodyMass
            );
        }

        if (permissions.sleep) {
            healthKitPermissions.permissions.read.push(
                AppleHealthKit.Constants.Permissions.SleepAnalysis
            );
        }

        if (permissions.bodyMeasurements) {
            healthKitPermissions.permissions.read.push(
                AppleHealthKit.Constants.Permissions.WaistCircumference
            );
        }

        return new Promise((resolve) => {
            AppleHealthKit.initHealthKit(healthKitPermissions, (error) => {
                if (error) {
                    console.error('Apple Health permission request failed:', error);
                    resolve(false);
                    return;
                }
                this.initialized = true;
                resolve(true);
            });
        });
    }

    async checkPermissions(permissions: HealthPermissions): Promise<HealthPermissions> {
        // Apple Health doesn't provide a direct way to check permissions
        // We'll attempt initialization and assume success means permissions granted
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
        if (Platform.OS !== 'ios' || !this.initialized) {
            return [];
        }

        return new Promise((resolve) => {
            const opts = {
                startDate: options.startDate.toISOString(),
                endDate: options.endDate.toISOString(),
                ascending: true,
                limit: 1000, // Adjust as needed
            };

            AppleHealthKit.getWeightSamples(opts, (error, results) => {
                if (error) {
                    console.error('Failed to fetch weight samples:', error);
                    resolve([]);
                    return;
                }

                const samples: WeightSample[] = (results || []).map((sample: any) => ({
                    value: sample.value, // HealthKit returns weight in kg
                    timestamp: sample.startDate || sample.endDate,
                    id: sample.id || `${sample.startDate}_${sample.value}`,
                    source: sample.sourceName || 'Apple Health',
                }));

                resolve(samples);
            });
        });
    }

    async syncSleepData(options: SyncOptions): Promise<SleepSample[]> {
        if (Platform.OS !== 'ios' || !this.initialized) {
            return [];
        }

        return new Promise((resolve) => {
            const opts = {
                startDate: options.startDate.toISOString(),
                endDate: options.endDate.toISOString(),
                limit: 1000,
            };

            AppleHealthKit.getSleepSamples(opts, (error, results) => {
                if (error) {
                    console.error('Failed to fetch sleep samples:', error);
                    resolve([]);
                    return;
                }

                // Group sleep samples by date and aggregate
                const sleepMap = new Map<string, SleepSample>();

                (results || []).forEach((sample: any) => {
                    const startTime = new Date(sample.startDate);
                    const endTime = new Date(sample.endDate);
                    const durationMinutes = Math.floor(
                        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                    );

                    // Use the date of the end time (wake time) as the key
                    const dateKey = endTime.toISOString().split('T')[0];

                    if (!sleepMap.has(dateKey)) {
                        sleepMap.set(dateKey, {
                            startTime: sample.startDate,
                            endTime: sample.endDate,
                            durationMinutes: durationMinutes,
                            id: sample.id || dateKey,
                            source: sample.sourceName || 'Apple Health',
                            stages: {},
                        });
                    } else {
                        // Aggregate with existing sample
                        const existing = sleepMap.get(dateKey)!;
                        existing.durationMinutes += durationMinutes;

                        // Update start/end times if needed
                        if (new Date(sample.startDate) < new Date(existing.startTime)) {
                            existing.startTime = sample.startDate;
                        }
                        if (new Date(sample.endDate) > new Date(existing.endTime)) {
                            existing.endTime = sample.endDate;
                        }
                    }

                    // Map sleep stages if available
                    const existingSample = sleepMap.get(dateKey)!;
                    if (sample.value === 'ASLEEP' || sample.value === 'INBED') {
                        existingSample.stages = existingSample.stages || {};
                    }
                    if (sample.value === 'DEEP') {
                        existingSample.stages!.deep = (existingSample.stages!.deep || 0) + durationMinutes;
                    }
                    if (sample.value === 'REM') {
                        existingSample.stages!.rem = (existingSample.stages!.rem || 0) + durationMinutes;
                    }
                    if (sample.value === 'CORE') {
                        existingSample.stages!.light = (existingSample.stages!.light || 0) + durationMinutes;
                    }
                });

                const samples = Array.from(sleepMap.values());
                resolve(samples);
            });
        });
    }

    async syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]> {
        if (Platform.OS !== 'ios' || !this.initialized) {
            return [];
        }

        // Apple HealthKit has waist circumference
        // Hip circumference is not a standard HealthKit metric
        return new Promise((resolve) => {
            const opts = {
                startDate: options.startDate.toISOString(),
                endDate: options.endDate.toISOString(),
                limit: 1000,
            };

            // Unfortunately, react-native-health doesn't have a direct method for waist circumference
            // We would need to use a generic quantity type query
            // For now, return empty array - can be implemented with custom native bridge if needed
            console.warn('Waist circumference sync not yet implemented in react-native-health');
            resolve([]);
        });
    }

    // Future: Write-back methods
    async writeWeightData(weight: number, timestamp: string): Promise<boolean> {
        if (Platform.OS !== 'ios' || !this.initialized) {
            return false;
        }

        return new Promise((resolve) => {
            const options = {
                value: weight,
                startDate: timestamp,
                endDate: timestamp,
            };

            AppleHealthKit.saveWeight(options, (error) => {
                if (error) {
                    console.error('Failed to write weight to Apple Health:', error);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    async writeSleepData(startTime: string, endTime: string): Promise<boolean> {
        if (Platform.OS !== 'ios' || !this.initialized) {
            return false;
        }

        return new Promise((resolve) => {
            const options = {
                value: 'ASLEEP',
                startDate: startTime,
                endDate: endTime,
            };

            AppleHealthKit.saveSleepSample(options, (error) => {
                if (error) {
                    console.error('Failed to write sleep to Apple Health:', error);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
}

// Export singleton instance
export const appleHealthService = new AppleHealthService();
