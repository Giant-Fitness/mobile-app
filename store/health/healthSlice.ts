// store/health/healthSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialHealthState, HealthState } from './healthState';
import * as thunks from './thunks';
import { UserHealthIntegrationSettings } from '../../types/userTypes';

const healthSlice = createSlice({
    name: 'health',
    initialState: initialHealthState,
    reducers: {
        // Reset health state
        resetHealthState: () => initialHealthState,

        // Clear error
        clearError: (state) => {
            state.error = null;
            state.syncError = null;
        },

        // Update sync status
        setSyncing: (state, action: PayloadAction<boolean>) => {
            state.isSyncing = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Check platform availability
        builder
            .addCase(thunks.checkHealthPlatformAvailability.pending, (state) => {
                state.error = null;
            })
            .addCase(thunks.checkHealthPlatformAvailability.fulfilled, (state, action) => {
                state.isPlatformAvailable = action.payload.isAvailable;
                state.platformName = action.payload.platformName;
            })
            .addCase(thunks.checkHealthPlatformAvailability.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isPlatformAvailable = false;
            });

        // Request permissions
        builder
            .addCase(thunks.requestHealthPermissions.pending, (state) => {
                state.permissionLoadingState = 'PENDING';
                state.error = null;
            })
            .addCase(thunks.requestHealthPermissions.fulfilled, (state) => {
                state.permissionLoadingState = 'FULFILLED';
            })
            .addCase(thunks.requestHealthPermissions.rejected, (state, action) => {
                state.permissionLoadingState = 'REJECTED';
                state.error = action.payload as string;
            });

        // Fetch settings
        builder
            .addCase(thunks.fetchHealthSettings.pending, (state) => {
                state.settingsLoadingState = 'PENDING';
                state.error = null;
            })
            .addCase(thunks.fetchHealthSettings.fulfilled, (state, action) => {
                state.settingsLoadingState = 'FULFILLED';
                state.settings = action.payload;
            })
            .addCase(thunks.fetchHealthSettings.rejected, (state, action) => {
                state.settingsLoadingState = 'REJECTED';
                state.error = action.payload as string;
            });

        // Update settings
        builder
            .addCase(thunks.updateHealthSettings.pending, (state) => {
                state.settingsLoadingState = 'PENDING';
                state.error = null;
            })
            .addCase(thunks.updateHealthSettings.fulfilled, (state, action) => {
                state.settingsLoadingState = 'FULFILLED';
                state.settings = action.payload;
            })
            .addCase(thunks.updateHealthSettings.rejected, (state, action) => {
                state.settingsLoadingState = 'REJECTED';
                state.error = action.payload as string;
            });

        // Enable integration
        builder
            .addCase(thunks.enableHealthIntegration.pending, (state) => {
                state.settingsLoadingState = 'PENDING';
                state.error = null;
            })
            .addCase(thunks.enableHealthIntegration.fulfilled, (state, action) => {
                state.settingsLoadingState = 'FULFILLED';
                state.settings = action.payload;
            })
            .addCase(thunks.enableHealthIntegration.rejected, (state, action) => {
                state.settingsLoadingState = 'REJECTED';
                state.error = action.payload as string;
            });

        // Disable integration
        builder
            .addCase(thunks.disableHealthIntegration.pending, (state) => {
                state.settingsLoadingState = 'PENDING';
                state.error = null;
            })
            .addCase(thunks.disableHealthIntegration.fulfilled, (state, action) => {
                state.settingsLoadingState = 'FULFILLED';
                state.settings = action.payload;
            })
            .addCase(thunks.disableHealthIntegration.rejected, (state, action) => {
                state.settingsLoadingState = 'REJECTED';
                state.error = action.payload as string;
            });

        // Sync health data
        builder
            .addCase(thunks.syncHealthData.pending, (state) => {
                state.syncLoadingState = 'PENDING';
                state.isSyncing = true;
                state.syncError = null;
            })
            .addCase(thunks.syncHealthData.fulfilled, (state, action) => {
                state.syncLoadingState = 'FULFILLED';
                state.isSyncing = false;
                state.lastSyncTimestamp = action.payload.syncTimestamp;

                // Update last sync time in settings
                if (state.settings) {
                    const platform = action.meta.arg; // Get platform from thunk args
                    if (state.settings.AppleHealthEnabled) {
                        state.settings.AppleHealthLastSyncAt = action.payload.syncTimestamp;
                    }
                    if (state.settings.HealthConnectEnabled) {
                        state.settings.HealthConnectLastSyncAt = action.payload.syncTimestamp;
                    }
                }
            })
            .addCase(thunks.syncHealthData.rejected, (state, action) => {
                state.syncLoadingState = 'REJECTED';
                state.isSyncing = false;
                state.syncError = action.payload as string;
            });
    },
});

export const { resetHealthState, clearError, setSyncing } = healthSlice.actions;
export default healthSlice.reducer;
