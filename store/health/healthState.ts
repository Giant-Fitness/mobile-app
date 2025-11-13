// store/health/healthState.ts

import { UserHealthIntegrationSettings } from '../../types/userTypes';

export type LoadingState = 'IDLE' | 'PENDING' | 'FULFILLED' | 'REJECTED';

export interface HealthState {
    // Health integration settings
    settings: UserHealthIntegrationSettings | null;

    // Platform availability
    isPlatformAvailable: boolean;
    platformName: string;

    // Sync status
    isSyncing: boolean;
    lastSyncTimestamp: string | null;
    syncError: string | null;

    // Loading states
    settingsLoadingState: LoadingState;
    syncLoadingState: LoadingState;
    permissionLoadingState: LoadingState;

    // Error messages
    error: string | null;
}

export const initialHealthState: HealthState = {
    settings: null,
    isPlatformAvailable: false,
    platformName: '',
    isSyncing: false,
    lastSyncTimestamp: null,
    syncError: null,
    settingsLoadingState: 'IDLE',
    syncLoadingState: 'IDLE',
    permissionLoadingState: 'IDLE',
    error: null,
};
