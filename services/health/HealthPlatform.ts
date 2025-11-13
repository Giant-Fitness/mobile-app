// services/health/HealthPlatform.ts
// Abstract interface for health platform integrations

import { DataSource, SleepStages } from '../../types/userTypes';

// Common health data types
export interface WeightSample {
    value: number; // in kg
    timestamp: string; // ISO string
    id: string; // platform-specific ID
    source: string; // source app/device name
}

export interface SleepSample {
    startTime: string; // ISO string
    endTime: string; // ISO string
    durationMinutes: number;
    id: string;
    source: string;
    stages?: SleepStages; // optional sleep stage breakdown
}

export interface BodyMeasurementSample {
    timestamp: string; // ISO string
    id: string;
    source: string;
    waist?: number; // in cm
    hip?: number; // in cm
}

export interface HealthPermissions {
    weight: boolean;
    sleep: boolean;
    bodyMeasurements: boolean;
}

export interface SyncOptions {
    startDate: Date;
    endDate: Date;
}

/**
 * Abstract interface for health platform integrations (Apple Health, Health Connect)
 * Provides a unified API for reading health data across platforms
 */
export interface IHealthPlatform {
    /**
     * Get the platform name
     */
    getPlatformName(): string;

    /**
     * Get the data source identifier
     */
    getDataSource(): DataSource;

    /**
     * Check if the health platform is available on this device
     */
    isAvailable(): Promise<boolean>;

    /**
     * Request permissions for health data access
     * @param permissions Which data types to request access to
     * @returns Promise<boolean> true if permissions granted
     */
    requestPermissions(permissions: HealthPermissions): Promise<boolean>;

    /**
     * Check if we have permission for specific data types
     * @param permissions Which data types to check
     * @returns Promise<HealthPermissions> object with permission status
     */
    checkPermissions(permissions: HealthPermissions): Promise<HealthPermissions>;

    /**
     * Sync weight measurements from the health platform
     * @param options Date range for sync
     * @returns Array of weight samples
     */
    syncWeightData(options: SyncOptions): Promise<WeightSample[]>;

    /**
     * Sync sleep data from the health platform
     * @param options Date range for sync
     * @returns Array of sleep samples
     */
    syncSleepData(options: SyncOptions): Promise<SleepSample[]>;

    /**
     * Sync body measurements from the health platform
     * @param options Date range for sync
     * @returns Array of body measurement samples
     */
    syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]>;

    /**
     * Write weight data back to health platform (future feature)
     * @param weight Weight in kg
     * @param timestamp ISO string
     */
    writeWeightData?(weight: number, timestamp: string): Promise<boolean>;

    /**
     * Write sleep data back to health platform (future feature)
     * @param startTime ISO string
     * @param endTime ISO string
     */
    writeSleepData?(startTime: string, endTime: string): Promise<boolean>;
}
