// store/sync/syncTypes.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { NetworkState } from '@/lib/sync/NetworkStateManager';
import { SyncStatus } from '@/lib/sync/SyncQueueManager';

// ==================== SYNC STATE TYPES ====================

export interface SyncState {
    // Overall sync status
    syncState: REQUEST_STATE;
    isInitialized: boolean;
    lastError: string | null;

    // Network status
    networkState: NetworkState | null;
    isOnline: boolean;

    // Queue status
    queueStatus: SyncStatus | null;
    queueState: REQUEST_STATE;

    // Data type specific sync states
    dataTypeSyncStates: {
        weight_measurements: DataTypeSyncState;
        sleep_measurements: DataTypeSyncState;
        body_measurements: DataTypeSyncState;
        nutrition_logs: DataTypeSyncState;
    };

    // Manual sync controls
    manualSyncState: REQUEST_STATE;
    lastManualSync: string | null;

    // Background sync tracking
    backgroundSyncState: REQUEST_STATE;
    lastBackgroundSync: string | null;

    // Conflict resolution tracking
    conflictsResolved: number;
    lastConflictResolution: string | null;
}

export interface DataTypeSyncState {
    lastSyncAttempt: string | null;
    lastSuccessfulSync: string | null;
    pendingCount: number;
    failedCount: number;
    syncState: REQUEST_STATE;
    errorMessage: string | null;
}

// ==================== ACTION PAYLOAD TYPES ====================

export interface UpdateNetworkStatePayload {
    networkState: NetworkState;
    isOnline: boolean;
}

export interface UpdateQueueStatusPayload {
    queueStatus: SyncStatus;
}

export interface UpdateDataTypeSyncStatePayload {
    dataType: keyof SyncState['dataTypeSyncStates'];
    syncState: Partial<DataTypeSyncState>;
}

export interface SyncErrorPayload {
    error: string;
    dataType?: keyof SyncState['dataTypeSyncStates'];
    operation?: string;
}

export interface ConflictResolvedPayload {
    dataType: keyof SyncState['dataTypeSyncStates'];
    count: number;
    timestamp: string;
}

// ==================== ASYNC THUNK PARAMS ====================

export interface InitializeSyncParams {
    enableBackgroundSync?: boolean;
    enableNetworkMonitoring?: boolean;
}

export interface ManualSyncParams {
    dataTypes?: Array<keyof SyncState['dataTypeSyncStates']>;
    forceSync?: boolean;
}

export interface BackgroundSyncParams {
    respectExpensiveConnection?: boolean;
    batchSize?: number;
}

// ==================== SYNC RESULT TYPES ====================

export interface SyncResult {
    success: boolean;
    dataType: string;
    operation: string;
    recordsProcessed: number;
    recordsSucceeded: number;
    recordsFailed: number;
    errors: string[];
    timestamp: string;
}

export interface BatchSyncResult {
    overallSuccess: boolean;
    results: SyncResult[];
    totalRecordsProcessed: number;
    totalRecordsSucceeded: number;
    totalRecordsFailed: number;
    duration: number;
    timestamp: string;
}

// ==================== SELECTOR HELPERS ====================

export interface SyncStatusSummary {
    isOnline: boolean;
    isProcessing: boolean;
    hasPendingItems: boolean;
    hasFailedItems: boolean;
    lastSuccessfulSync: string | null;
    errorMessage: string | null;
}

export interface DataTypeSyncSummary {
    dataType: keyof SyncState['dataTypeSyncStates'];
    isPending: boolean;
    hasFailed: boolean;
    pendingCount: number;
    failedCount: number;
    lastSync: string | null;
    errorMessage: string | null;
}

// ==================== SYNC CONFIGURATION ====================

export interface SyncConfiguration {
    enabledDataTypes: Array<keyof SyncState['dataTypeSyncStates']>;
    syncIntervals: {
        backgroundSync: number; // milliseconds
        retryFailedItems: number; // milliseconds
        networkStateRefresh: number; // milliseconds
    };
    retryPolicy: {
        maxRetries: number;
        baseDelayMs: number;
        maxDelayMs: number;
    };
    networkPolicy: {
        respectExpensiveConnection: boolean;
        maxBatchSizeOnCellular: number;
        maxBatchSizeOnWifi: number;
    };
}

// ==================== DEFAULT VALUES ====================

export const DEFAULT_DATA_TYPE_SYNC_STATE: DataTypeSyncState = {
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
    pendingCount: 0,
    failedCount: 0,
    syncState: REQUEST_STATE.IDLE,
    errorMessage: null,
};

export const DEFAULT_SYNC_CONFIGURATION: SyncConfiguration = {
    enabledDataTypes: ['weight_measurements', 'sleep_measurements', 'body_measurements', 'nutrition_logs'],
    syncIntervals: {
        backgroundSync: 5 * 60 * 1000, // 5 minutes
        retryFailedItems: 30 * 1000, // 30 seconds
        networkStateRefresh: 10 * 1000, // 10 seconds
    },
    retryPolicy: {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
    },
    networkPolicy: {
        respectExpensiveConnection: true,
        maxBatchSizeOnCellular: 5,
        maxBatchSizeOnWifi: 20,
    },
};

// ==================== ERROR TYPES ====================

export interface SyncError {
    code: string;
    message: string;
    dataType?: string;
    operation?: string;
    recordId?: string;
    timestamp: string;
    isRetryable: boolean;
}

export const SYNC_ERROR_CODES = {
    NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    SERVER_ERROR: 'SERVER_ERROR',
    DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
    CONFLICT_RESOLUTION_FAILED: 'CONFLICT_RESOLUTION_FAILED',
    STORAGE_ERROR: 'STORAGE_ERROR',
    INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
    QUEUE_PROCESSING_FAILED: 'QUEUE_PROCESSING_FAILED',
} as const;

export type SyncErrorCode = (typeof SYNC_ERROR_CODES)[keyof typeof SYNC_ERROR_CODES];

// ==================== UTILITY TYPES ====================

export type SyncDataType = keyof SyncState['dataTypeSyncStates'];

export interface SyncMetrics {
    totalSyncAttempts: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncDuration: number;
    conflictsResolved: number;
    dataTypesEnabled: number;
    lastMetricsReset: string;
}
