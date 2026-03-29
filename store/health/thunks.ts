// store/health/thunks.ts
// Health integration async thunks

import { createAsyncThunk } from '@reduxjs/toolkit';
import { subDays } from 'date-fns';
import { healthPlatformManager } from '../../services/health';
import { HealthPermissions } from '../../services/health/HealthPlatform';
import * as healthService from './service';
import { DataSource, UserHealthIntegrationSettings } from '../../types/userTypes';
import { RootState } from '../store';

/**
 * Check if health platform is available on this device
 */
export const checkHealthPlatformAvailability = createAsyncThunk(
    'health/checkAvailability',
    async (_, { rejectWithValue }) => {
        try {
            const isAvailable = await healthPlatformManager.isHealthPlatformAvailable();
            const platformName = healthPlatformManager.getPlatformName();

            return {
                isAvailable,
                platformName,
            };
        } catch (error: any) {
            console.error('Failed to check health platform availability:', error);
            return rejectWithValue(error.message || 'Failed to check platform availability');
        }
    }
);

/**
 * Request health permissions
 */
export const requestHealthPermissions = createAsyncThunk(
    'health/requestPermissions',
    async (permissions: HealthPermissions, { rejectWithValue }) => {
        try {
            const platform = healthPlatformManager.getPlatform();
            const granted = await platform.requestPermissions(permissions);

            if (!granted) {
                throw new Error('Health permissions denied');
            }

            return { granted, permissions };
        } catch (error: any) {
            console.error('Failed to request health permissions:', error);
            return rejectWithValue(error.message || 'Permission request failed');
        }
    }
);

/**
 * Fetch health integration settings
 */
export const fetchHealthSettings = createAsyncThunk(
    'health/fetchSettings',
    async (userId: string, { rejectWithValue }) => {
        try {
            const settings = await healthService.fetchHealthSettings(userId);
            return settings;
        } catch (error: any) {
            console.error('Failed to fetch health settings:', error);
            return rejectWithValue(error.message || 'Failed to fetch settings');
        }
    }
);

/**
 * Update health integration settings
 */
export const updateHealthSettings = createAsyncThunk(
    'health/updateSettings',
    async (
        {
            userId,
            settings,
        }: {
            userId: string;
            settings: Partial<UserHealthIntegrationSettings>;
        },
        { rejectWithValue }
    ) => {
        try {
            const updatedSettings = await healthService.updateHealthSettings(userId, settings);
            return updatedSettings;
        } catch (error: any) {
            console.error('Failed to update health settings:', error);
            return rejectWithValue(error.message || 'Failed to update settings');
        }
    }
);

/**
 * Enable health integration
 */
export const enableHealthIntegration = createAsyncThunk(
    'health/enable',
    async ({ userId }: { userId: string }, { dispatch, rejectWithValue }) => {
        try {
            // Check platform availability
            const availabilityResult = await dispatch(checkHealthPlatformAvailability()).unwrap();

            if (!availabilityResult.isAvailable) {
                throw new Error('Health platform not available on this device');
            }

            // Request permissions
            await dispatch(
                requestHealthPermissions({
                    weight: true,
                    sleep: true,
                    bodyMeasurements: true,
                })
            ).unwrap();

            // Update settings
            const platform = healthPlatformManager.getPlatform();
            const dataSource = platform.getDataSource();

            const settingsUpdate: Partial<UserHealthIntegrationSettings> = {
                AutoSyncEnabled: true,
                SyncHistoryDays: 30,
            };

            if (dataSource === DataSource.APPLE_HEALTH) {
                settingsUpdate.AppleHealthEnabled = true;
                settingsUpdate.AppleHealthConnectedAt = new Date().toISOString();
            } else if (dataSource === DataSource.HEALTH_CONNECT) {
                settingsUpdate.HealthConnectEnabled = true;
                settingsUpdate.HealthConnectConnectedAt = new Date().toISOString();
            }

            const updatedSettings = await dispatch(
                updateHealthSettings({ userId, settings: settingsUpdate })
            ).unwrap();

            // Trigger initial sync
            await dispatch(syncHealthData({ userId, force: true })).unwrap();

            return updatedSettings;
        } catch (error: any) {
            console.error('Failed to enable health integration:', error);
            return rejectWithValue(error.message || 'Failed to enable integration');
        }
    }
);

/**
 * Disable health integration
 */
export const disableHealthIntegration = createAsyncThunk(
    'health/disable',
    async ({ userId }: { userId: string }, { dispatch, rejectWithValue }) => {
        try {
            const platform = healthPlatformManager.getPlatform();
            const dataSource = platform.getDataSource();

            const settingsUpdate: Partial<UserHealthIntegrationSettings> = {};

            if (dataSource === DataSource.APPLE_HEALTH) {
                settingsUpdate.AppleHealthEnabled = false;
            } else if (dataSource === DataSource.HEALTH_CONNECT) {
                settingsUpdate.HealthConnectEnabled = false;
            }

            const updatedSettings = await dispatch(
                updateHealthSettings({ userId, settings: settingsUpdate })
            ).unwrap();

            return updatedSettings;
        } catch (error: any) {
            console.error('Failed to disable health integration:', error);
            return rejectWithValue(error.message || 'Failed to disable integration');
        }
    }
);

/**
 * Sync health data from platform
 */
export const syncHealthData = createAsyncThunk(
    'health/sync',
    async (
        {
            userId,
            force = false,
        }: {
            userId: string;
            force?: boolean;
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const settings = state.health.settings;

            if (!settings) {
                throw new Error('Health settings not loaded');
            }

            // Check if sync is enabled
            const platform = healthPlatformManager.getPlatform();
            const dataSource = platform.getDataSource();

            const isEnabled =
                (dataSource === DataSource.APPLE_HEALTH && settings.AppleHealthEnabled) ||
                (dataSource === DataSource.HEALTH_CONNECT && settings.HealthConnectEnabled);

            if (!isEnabled && !force) {
                throw new Error('Health integration not enabled');
            }

            // Check if we need to sync (based on last sync time)
            if (!force && settings.AutoSyncEnabled === false) {
                throw new Error('Auto-sync is disabled');
            }

            // Calculate date range
            const syncHistoryDays = settings.SyncHistoryDays || 30;
            const startDate = subDays(new Date(), syncHistoryDays);
            const endDate = new Date();

            // Sync weight data
            const weightSamples = await platform.syncWeightData({ startDate, endDate });

            // Sync sleep data
            const sleepSamples = await platform.syncSleepData({ startDate, endDate });

            // Sync body measurements
            const bodyMeasurementSamples = await platform.syncBodyMeasurements({
                startDate,
                endDate,
            });

            // Record sync event
            await healthService.recordSyncEvent(
                userId,
                dataSource === DataSource.APPLE_HEALTH ? 'apple_health' : 'health_connect',
                {
                    weightCount: weightSamples.length,
                    sleepCount: sleepSamples.length,
                    bodyMeasurementCount: bodyMeasurementSamples.length,
                    timestamp: new Date().toISOString(),
                }
            );

            return {
                weightSamples,
                sleepSamples,
                bodyMeasurementSamples,
                syncTimestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            console.error('Failed to sync health data:', error);
            return rejectWithValue(error.message || 'Sync failed');
        }
    }
);
