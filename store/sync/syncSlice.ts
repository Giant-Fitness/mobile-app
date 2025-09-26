// store/sync/syncSlice.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { NetworkState, networkStateManager } from '@/lib/sync/NetworkStateManager';
import { syncQueueManager } from '@/lib/sync/SyncQueueManager';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    BackgroundSyncParams,
    BatchSyncResult,
    ConflictResolvedPayload,
    DEFAULT_DATA_TYPE_SYNC_STATE,
    InitializeSyncParams,
    ManualSyncParams,
    SyncErrorPayload,
    SyncState,
    UpdateDataTypeSyncStatePayload,
    UpdateNetworkStatePayload,
    UpdateQueueStatusPayload,
} from './syncTypes';

// ==================== INITIAL STATE ====================

const initialState: SyncState = {
    // Overall sync status
    syncState: REQUEST_STATE.IDLE,
    isInitialized: false,
    lastError: null,

    // Network status
    networkState: null,
    isOnline: false,

    // Queue status
    queueStatus: null,
    queueState: REQUEST_STATE.IDLE,

    // Data type specific sync states
    dataTypeSyncStates: {
        weight_measurements: { ...DEFAULT_DATA_TYPE_SYNC_STATE },
        sleep_measurements: { ...DEFAULT_DATA_TYPE_SYNC_STATE },
        body_measurements: { ...DEFAULT_DATA_TYPE_SYNC_STATE },
        nutrition_logs: { ...DEFAULT_DATA_TYPE_SYNC_STATE },
    },

    // Manual sync controls
    manualSyncState: REQUEST_STATE.IDLE,
    lastManualSync: null,

    // Background sync tracking
    backgroundSyncState: REQUEST_STATE.IDLE,
    lastBackgroundSync: null,

    // Conflict resolution tracking
    conflictsResolved: 0,
    lastConflictResolution: null,
};

// ==================== ASYNC THUNKS ====================

// store/sync/syncSlice.ts (updated thunk)

export const initializeSyncAsync = createAsyncThunk<boolean, InitializeSyncParams | undefined, { rejectValue: string }>(
    'sync/initializeSync',
    async (params, { dispatch, rejectWithValue }) => {
        try {
            console.log('Initializing Redux sync coordination...');

            // NOTE: The actual offline services should already be initialized
            // by initializeOfflineServices() before this thunk is called

            // This thunk just coordinates the Redux state with the already-initialized services
            const { enableBackgroundSync = true, enableNetworkMonitoring = true } = params ?? {};

            // Set up network state monitoring (if network manager is already initialized)
            if (enableNetworkMonitoring && networkStateManager.getCurrentState()) {
                networkStateManager.onStateChange((networkState: NetworkState) => {
                    dispatch(
                        updateNetworkState({
                            networkState,
                            isOnline: networkStateManager.isOnline(),
                        }),
                    );
                });
            }

            // Set up queue status monitoring (if sync queue manager is already initialized)
            try {
                syncQueueManager.onStatusChange((queueStatus) => {
                    dispatch(updateQueueStatus({ queueStatus }));
                });

                // Get initial states
                const currentNetworkState = networkStateManager.getCurrentState();
                if (currentNetworkState) {
                    dispatch(
                        updateNetworkState({
                            networkState: currentNetworkState,
                            isOnline: networkStateManager.isOnline(),
                        }),
                    );
                }

                const currentQueueStatus = await syncQueueManager.getSyncStatus();
                dispatch(updateQueueStatus({ queueStatus: currentQueueStatus }));
            } catch (error) {
                console.warn('Could not set up sync queue monitoring:', error);
            }

            // Start background sync if enabled and online
            if (enableBackgroundSync && networkStateManager.isOnline()) {
                setTimeout(() => {
                    dispatch(performBackgroundSyncAsync());
                }, 2000);
            }

            console.log('Redux sync coordination initialized successfully');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            console.error('Failed to initialize Redux sync coordination:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);

export const performManualSyncAsync = createAsyncThunk<BatchSyncResult, ManualSyncParams | void, { rejectValue: string }>(
    'sync/performManualSync',
    async ({}, { rejectWithValue }) => {
        try {
            const startTime = Date.now();

            if (!networkStateManager.isOnline()) {
                throw new Error('Cannot sync while offline');
            }

            console.log('Starting manual sync...');

            // Force sync all pending items
            const syncResults = await syncQueueManager.forceSyncAll();

            const duration = Date.now() - startTime;
            const timestamp = new Date().toISOString();

            const totalRecordsProcessed = syncResults.length;
            const totalRecordsSucceeded = syncResults.filter((r) => r.success).length;
            const totalRecordsFailed = syncResults.filter((r) => !r.success).length;

            const result: BatchSyncResult = {
                overallSuccess: totalRecordsFailed === 0,
                results: syncResults.map((sr) => ({
                    success: sr.success,
                    dataType: sr.operation.split(':')[0] || 'unknown',
                    operation: sr.operation,
                    recordsProcessed: 1,
                    recordsSucceeded: sr.success ? 1 : 0,
                    recordsFailed: sr.success ? 0 : 1,
                    errors: sr.error ? [sr.error] : [],
                    timestamp,
                })),
                totalRecordsProcessed,
                totalRecordsSucceeded,
                totalRecordsFailed,
                duration,
                timestamp,
            };

            console.log(`Manual sync completed: ${totalRecordsSucceeded}/${totalRecordsProcessed} succeeded`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Manual sync failed';
            console.error('Manual sync failed:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);

export const performBackgroundSyncAsync = createAsyncThunk<BatchSyncResult, BackgroundSyncParams | void, { rejectValue: string }>(
    'sync/performBackgroundSync',
    async ({}, { rejectWithValue }) => {
        try {
            const startTime = Date.now();

            if (!networkStateManager.isOnline()) {
                // Silent fail for background sync
                return {
                    overallSuccess: false,
                    results: [],
                    totalRecordsProcessed: 0,
                    totalRecordsSucceeded: 0,
                    totalRecordsFailed: 0,
                    duration: 0,
                    timestamp: new Date().toISOString(),
                };
            }

            console.log('Starting background sync...');

            // Process sync queue
            const syncResults = await syncQueueManager.processQueue();

            const duration = Date.now() - startTime;
            const timestamp = new Date().toISOString();

            const totalRecordsProcessed = syncResults.length;
            const totalRecordsSucceeded = syncResults.filter((r) => r.success).length;
            const totalRecordsFailed = syncResults.filter((r) => !r.success).length;

            const result: BatchSyncResult = {
                overallSuccess: totalRecordsFailed === 0 || totalRecordsProcessed === 0,
                results: syncResults.map((sr) => ({
                    success: sr.success,
                    dataType: sr.operation.split(':')[0] || 'unknown',
                    operation: sr.operation,
                    recordsProcessed: 1,
                    recordsSucceeded: sr.success ? 1 : 0,
                    recordsFailed: sr.success ? 0 : 1,
                    errors: sr.error ? [sr.error] : [],
                    timestamp,
                })),
                totalRecordsProcessed,
                totalRecordsSucceeded,
                totalRecordsFailed,
                duration,
                timestamp,
            };

            if (totalRecordsProcessed > 0) {
                console.log(`Background sync completed: ${totalRecordsSucceeded}/${totalRecordsProcessed} succeeded`);
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Background sync failed';
            console.error('Background sync failed:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);

export const clearFailedSyncItemsAsync = createAsyncThunk<number, void, { rejectValue: string }>(
    'sync/clearFailedSyncItems',
    async (_, { rejectWithValue }) => {
        try {
            const clearedCount = await syncQueueManager.clearFailedItems();
            console.log(`Cleared ${clearedCount} failed sync items`);
            return clearedCount;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear failed items';
            console.error('Failed to clear failed sync items:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);

// ==================== SLICE ====================

const syncSlice = createSlice({
    name: 'sync',
    initialState,
    reducers: {
        // Network state updates
        updateNetworkState: (state, action: PayloadAction<UpdateNetworkStatePayload>) => {
            state.networkState = action.payload.networkState;
            state.isOnline = action.payload.isOnline;
        },

        // Queue status updates
        updateQueueStatus: (state, action: PayloadAction<UpdateQueueStatusPayload>) => {
            state.queueStatus = action.payload.queueStatus;

            // Update overall queue state based on status
            if (action.payload.queueStatus.isProcessing) {
                state.queueState = REQUEST_STATE.PENDING;
            } else if (action.payload.queueStatus.failedCount > 0) {
                state.queueState = REQUEST_STATE.REJECTED;
            } else {
                state.queueState = REQUEST_STATE.FULFILLED;
            }
        },

        // Data type sync state updates
        updateDataTypeSyncState: (state, action: PayloadAction<UpdateDataTypeSyncStatePayload>) => {
            const { dataType, syncState: updates } = action.payload;
            state.dataTypeSyncStates[dataType] = {
                ...state.dataTypeSyncStates[dataType],
                ...updates,
            };
        },

        // Error handling
        setSyncError: (state, action: PayloadAction<SyncErrorPayload>) => {
            state.lastError = action.payload.error;

            if (action.payload.dataType) {
                state.dataTypeSyncStates[action.payload.dataType].errorMessage = action.payload.error;
                state.dataTypeSyncStates[action.payload.dataType].syncState = REQUEST_STATE.REJECTED;
            }
        },

        clearSyncError: (state) => {
            state.lastError = null;
        },

        // Conflict resolution tracking
        recordConflictResolved: (state, action: PayloadAction<ConflictResolvedPayload>) => {
            state.conflictsResolved += action.payload.count;
            state.lastConflictResolution = action.payload.timestamp;
        },

        // Reset sync state
        resetSyncState: () => {
            return { ...initialState };
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize sync
            .addCase(initializeSyncAsync.pending, (state) => {
                state.syncState = REQUEST_STATE.PENDING;
                state.lastError = null;
            })
            .addCase(initializeSyncAsync.fulfilled, (state) => {
                state.syncState = REQUEST_STATE.FULFILLED;
                state.isInitialized = true;
            })
            .addCase(initializeSyncAsync.rejected, (state, action) => {
                state.syncState = REQUEST_STATE.REJECTED;
                state.lastError = action.payload || 'Sync initialization failed';
            })

            // Manual sync
            .addCase(performManualSyncAsync.pending, (state) => {
                state.manualSyncState = REQUEST_STATE.PENDING;
                state.lastError = null;
            })
            .addCase(performManualSyncAsync.fulfilled, (state, action) => {
                state.manualSyncState = REQUEST_STATE.FULFILLED;
                state.lastManualSync = action.payload.timestamp;

                // Update data type sync states based on results
                action.payload.results.forEach((result) => {
                    const dataType = result.dataType as keyof typeof state.dataTypeSyncStates;
                    if (state.dataTypeSyncStates[dataType]) {
                        state.dataTypeSyncStates[dataType].lastSyncAttempt = result.timestamp;
                        if (result.success) {
                            state.dataTypeSyncStates[dataType].lastSuccessfulSync = result.timestamp;
                            state.dataTypeSyncStates[dataType].syncState = REQUEST_STATE.FULFILLED;
                            state.dataTypeSyncStates[dataType].errorMessage = null;
                        } else {
                            state.dataTypeSyncStates[dataType].syncState = REQUEST_STATE.REJECTED;
                            state.dataTypeSyncStates[dataType].errorMessage = result.errors.join(', ') || 'Sync failed';
                        }
                    }
                });
            })
            .addCase(performManualSyncAsync.rejected, (state, action) => {
                state.manualSyncState = REQUEST_STATE.REJECTED;
                state.lastError = action.payload || 'Manual sync failed';
            })

            // Background sync
            .addCase(performBackgroundSyncAsync.pending, (state) => {
                state.backgroundSyncState = REQUEST_STATE.PENDING;
            })
            .addCase(performBackgroundSyncAsync.fulfilled, (state, action) => {
                state.backgroundSyncState = REQUEST_STATE.FULFILLED;
                state.lastBackgroundSync = action.payload.timestamp;

                // Update data type sync states for background sync results
                action.payload.results.forEach((result) => {
                    const dataType = result.dataType as keyof typeof state.dataTypeSyncStates;
                    if (state.dataTypeSyncStates[dataType]) {
                        state.dataTypeSyncStates[dataType].lastSyncAttempt = result.timestamp;
                        if (result.success) {
                            state.dataTypeSyncStates[dataType].lastSuccessfulSync = result.timestamp;
                        }
                    }
                });
            })
            .addCase(performBackgroundSyncAsync.rejected, (state) => {
                state.backgroundSyncState = REQUEST_STATE.REJECTED;
                // Don't set lastError for background sync failures (silent)
            })

            // Clear failed items
            .addCase(clearFailedSyncItemsAsync.pending, () => {
                // Don't change overall sync state for this operation
            })
            .addCase(clearFailedSyncItemsAsync.fulfilled, (state, action) => {
                // Reset failed counts for all data types if items were cleared
                if (action.payload > 0) {
                    Object.values(state.dataTypeSyncStates).forEach((dataTypeState) => {
                        dataTypeState.failedCount = 0;
                        if (dataTypeState.syncState === REQUEST_STATE.REJECTED) {
                            dataTypeState.syncState = REQUEST_STATE.IDLE;
                            dataTypeState.errorMessage = null;
                        }
                    });
                }
            })
            .addCase(clearFailedSyncItemsAsync.rejected, (state, action) => {
                state.lastError = action.payload || 'Failed to clear failed items';
            });
    },
});

export const { updateNetworkState, updateQueueStatus, updateDataTypeSyncState, setSyncError, clearSyncError, recordConflictResolved, resetSyncState } =
    syncSlice.actions;

export default syncSlice.reducer;
