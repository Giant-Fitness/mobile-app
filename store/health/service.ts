// store/health/service.ts
// Health integration API service layer

import { authenticatedApi } from '../../utils/api/apiConfig';
import { UserHealthIntegrationSettings } from '../../types/userTypes';

const BASE_PATH = '/users';

/**
 * Fetch health integration settings for a user
 */
export async function fetchHealthSettings(
    userId: string
): Promise<UserHealthIntegrationSettings> {
    try {
        const response = await authenticatedApi.get(`${BASE_PATH}/${userId}/health-settings`);
        return response.data;
    } catch (error: any) {
        // If settings don't exist, return default settings
        if (error.response?.status === 404) {
            return {
                UserId: userId,
                AppleHealthEnabled: false,
                HealthConnectEnabled: false,
                AutoSyncEnabled: true,
                SyncFrequency: 'daily',
                SyncHistoryDays: 30,
                WriteBackEnabled: false,
            };
        }
        throw error;
    }
}

/**
 * Update health integration settings
 */
export async function updateHealthSettings(
    userId: string,
    settings: Partial<UserHealthIntegrationSettings>
): Promise<UserHealthIntegrationSettings> {
    const response = await authenticatedApi.put(
        `${BASE_PATH}/${userId}/health-settings`,
        settings
    );
    return response.data;
}

/**
 * Record a sync event
 */
export async function recordSyncEvent(
    userId: string,
    platform: 'apple_health' | 'health_connect',
    syncData: {
        weightCount: number;
        sleepCount: number;
        bodyMeasurementCount: number;
        timestamp: string;
    }
): Promise<void> {
    await authenticatedApi.post(`${BASE_PATH}/${userId}/health-sync-events`, {
        platform,
        ...syncData,
    });
}
