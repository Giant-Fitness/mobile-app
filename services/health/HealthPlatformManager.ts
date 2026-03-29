// services/health/HealthPlatformManager.ts
// Manager to handle platform-specific health service selection

import { Platform } from 'react-native';
import { IHealthPlatform } from './HealthPlatform';
import { appleHealthService } from './AppleHealthService';
import { healthConnectService } from './HealthConnectService';

/**
 * Health Platform Manager
 * Provides a unified interface to access the appropriate health platform
 * based on the current operating system
 */
class HealthPlatformManager {
    private currentPlatform: IHealthPlatform | null = null;

    /**
     * Get the appropriate health platform service for the current OS
     */
    getPlatform(): IHealthPlatform {
        if (this.currentPlatform) {
            return this.currentPlatform;
        }

        if (Platform.OS === 'ios') {
            this.currentPlatform = appleHealthService;
        } else if (Platform.OS === 'android') {
            this.currentPlatform = healthConnectService;
        } else {
            // Web or other platforms - return a mock platform that does nothing
            this.currentPlatform = this.createMockPlatform();
        }

        return this.currentPlatform;
    }

    /**
     * Check if health platform is available on the current device
     */
    async isHealthPlatformAvailable(): Promise<boolean> {
        const platform = this.getPlatform();
        return await platform.isAvailable();
    }

    /**
     * Get the platform name (Apple Health, Health Connect, etc.)
     */
    getPlatformName(): string {
        return this.getPlatform().getPlatformName();
    }

    /**
     * Reset the platform (useful for testing)
     */
    reset(): void {
        this.currentPlatform = null;
    }

    /**
     * Create a mock platform that does nothing (for unsupported platforms)
     */
    private createMockPlatform(): IHealthPlatform {
        return {
            getPlatformName: () => 'Unsupported',
            getDataSource: () => 'manual' as any,
            isAvailable: async () => false,
            requestPermissions: async () => false,
            checkPermissions: async (permissions) => ({
                weight: false,
                sleep: false,
                bodyMeasurements: false,
            }),
            syncWeightData: async () => [],
            syncSleepData: async () => [],
            syncBodyMeasurements: async () => [],
        };
    }
}

// Export singleton instance
export const healthPlatformManager = new HealthPlatformManager();
