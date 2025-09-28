// store/user/thunks.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService } from '@/lib/cache/cacheService';
import { appSettingsOfflineService } from '@/lib/storage/app-settings/AppSettingsOfflineService';
import { bodyMeasurementOfflineService } from '@/lib/storage/body-measurements/BodyMeasurementOfflineService';
import { fitnessProfileOfflineService } from '@/lib/storage/fitness-profile/FitnessProfileOfflineService';
import { nutritionProfileOfflineService } from '@/lib/storage/nutrition-profile/NutritionProfileOfflineService';
import { weightMeasurementOfflineService } from '@/lib/storage/weight-measurements/WeightMeasurementOfflineService';
import { networkStateManager } from '@/lib/sync/NetworkStateManager';
import { RootState } from '@/store/store';
import UserService from '@/store/user/service';
import {
    AddFoodEntryParams,
    AddFoodEntryResponse,
    CompleteProfileParams,
    CompleteProfileResponse,
    CreateSetModificationParams,
    CreateSubstitutionParams,
    GetSetModificationsParams,
    GetSubstitutionsParams,
    MealType,
    UpdateFoodEntryParams,
    UpdateFoodEntryResponse,
    UpdateSetModificationParams,
    UpdateSubstitutionParams,
    User,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSetModification,
    UserExerciseSubstitution,
    UserFitnessProfile,
    UserNutritionGoal,
    UserNutritionLog,
    UserNutritionProfile,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';

import { createAsyncThunk } from '@reduxjs/toolkit';

const TESTING = {
    SIMULATE_WEIGHT_FAILURE: __DEV__ && false,
    SIMULATE_SLEEP_FAILURE: __DEV__ && false,
    SIMULATE_BODY_FAILURE: __DEV__ && false,
    SIMULATE_DELAYS: __DEV__ && false,
    DELAY_MS: 3000,
};

export const getUserAsync = createAsyncThunk<User, { forceRefresh?: boolean; useCache?: boolean } | void>('user/getUser', async (args = {}, { getState }) => {
    const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.user.user && !forceRefresh) {
        return state.user.user;
    }

    // Try cache first if enabled and not forcing refresh
    if (useCache && !forceRefresh) {
        const cached = await cacheService.get<User>('user_data');

        if (cached) {
            console.log('Loaded user data from cache');
            return cached;
        }
    }

    // Load from API
    console.log('Loading user data from API');
    const user = await UserService.getUser();

    // Cache the result if useCache is enabled
    if (useCache) {
        await cacheService.set('user_data', user);
    }

    return user;
});

export const updateUserAsync = createAsyncThunk<
    User,
    Partial<User>,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateUser', async (updates, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        // Update the user
        const updatedUser = await UserService.updateUser(updates);

        // Invalidate user cache after update
        if (userId) {
            await cacheService.remove('user_data');
        }

        return updatedUser;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update user',
        });
    }
});

/**
 * Get user fitness profile (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getUserFitnessProfileAsync = createAsyncThunk<
    UserFitnessProfile,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserFitnessProfile', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading fitness profile from SQLite...');
        const localProfile = await fitnessProfileOfflineService.getProfileForUser(userId);

        if (localProfile) {
            console.log('Found fitness profile in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background fitness profile sync...');
                        const serverProfile = await UserService.getUserFitnessProfile(userId);
                        await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);
                    } catch (error) {
                        console.warn('Background fitness profile sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing fitness profile from server...');
                    const serverProfile = await UserService.getUserFitnessProfile(userId);
                    await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);

                    // Reload from SQLite to get merged data
                    const refreshedProfile = await fitnessProfileOfflineService.getProfileForUser(userId);
                    return refreshedProfile ? refreshedProfile.data : localProfile.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localProfile.data;
        }

        // No local profile found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local fitness profile found, fetching from server...');
            const serverProfile = await UserService.getUserFitnessProfile(userId);

            // Store in SQLite for future offline use
            await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);

            return serverProfile;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No fitness profile available offline' });
    } catch (error) {
        console.error('Failed to get fitness profile:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch fitness profile',
        });
    }
});

/**
 * Update user fitness profile (offline-first with optimistic update)
 */
export const updateUserFitnessProfileAsync = createAsyncThunk<
    { user: User; userRecommendations: UserRecommendations; userFitnessProfile: UserFitnessProfile },
    { userFitnessProfile: UserFitnessProfile },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateFitnessProfile', async ({ userFitnessProfile }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    if (!networkStateManager.isOnline()) {
        return rejectWithValue({
            errorMessage: 'Internet connection required to update fitness profile',
        });
    }

    try {
        const serverResult = await UserService.updateUserFitnessProfile(userId, userFitnessProfile);

        // Cache the fresh data we just received
        await Promise.all([cacheService.set('user_data', serverResult.user), cacheService.set('user_recommendations', serverResult.userRecommendations)]);

        return serverResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update fitness profile',
        });
    }
});

export const getUserRecommendationsAsync = createAsyncThunk<
    UserRecommendations,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserRecommendations', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached recommendations if available and not forcing refresh
        if (state.user.userRecommendations && !forceRefresh) {
            return state.user.userRecommendations;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_recommendations`;
            const cached = await cacheService.get<UserRecommendations>(cacheKey);

            if (cached) {
                console.log('Loaded user recommendations from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user recommendations from API');
        const userRecommendations = await UserService.getUserRecommendations(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_recommendations`;
            await cacheService.set(cacheKey, userRecommendations);
        }

        return userRecommendations;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch user recommendations',
        });
    }
});

export const getUserProgramProgressAsync = createAsyncThunk<
    UserProgramProgress,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserProgramProgress', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached progress if available and not forcing refresh
        if (state.user.userProgramProgress && !forceRefresh) {
            return state.user.userProgramProgress;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<UserProgramProgress>('user_program_progress');

            if (cached) {
                console.log('Loaded user program progress from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user program progress from API');
        const userProgramProgress = await UserService.getUserProgramProgress(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('user_program_progress', userProgramProgress);
        }

        return userProgramProgress;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch program progress',
        });
    }
});

// CREATE - Start program (invalidate cache)
export const startProgramAsync = createAsyncThunk<
    UserProgramProgress,
    { programId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/startProgram', async ({ programId }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.startProgram(userId, programId);

        // Invalidate cache after starting program
        await cacheService.remove('user_program_progress');

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to start program' });
    }
});

// UPDATE - Complete day (invalidate cache)
export const completeDayAsync = createAsyncThunk<
    UserProgramProgress | null,
    { dayId: string; isAutoComplete?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeDay', async ({ dayId, isAutoComplete = false }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.completeDay(userId, dayId, isAutoComplete);

        // Invalidate cache after completing day
        await cacheService.remove('user_program_progress');

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to complete day' });
    }
});

// UPDATE - Uncomplete day (invalidate cache)
export const uncompleteDayAsync = createAsyncThunk<
    UserProgramProgress,
    { dayId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/uncompleteDay', async ({ dayId }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.uncompleteDay(userId, dayId);

        // Invalidate cache after uncompleting day
        await cacheService.remove('user_program_progress');

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to uncomplete day' });
    }
});

// DELETE - End program (invalidate cache)
export const endProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/endProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.endProgram(userId);

        // Invalidate cache after ending program
        await cacheService.remove('user_program_progress');

        return result as UserProgramProgress;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to end program' });
    }
});

// DELETE - Reset program (invalidate cache)
export const resetProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/resetProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.resetProgram(userId);

        // Invalidate cache after resetting program
        await cacheService.remove('user_program_progress');

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to reset program' });
    }
});

/**
 * Get user app settings (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getUserAppSettingsAsync = createAsyncThunk<
    UserAppSettings,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserAppSettings', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading app settings from SQLite...');
        const localSettings = await appSettingsOfflineService.getSettingsForUser(userId);

        if (localSettings) {
            console.log('Found app settings in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background app settings sync...');
                        const serverSettings = await UserService.getUserAppSettings(userId);
                        await appSettingsOfflineService.mergeServerData(userId, serverSettings);
                    } catch (error) {
                        console.warn('Background app settings sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing app settings from server...');
                    const serverSettings = await UserService.getUserAppSettings(userId);
                    await appSettingsOfflineService.mergeServerData(userId, serverSettings);

                    // Reload from SQLite to get merged data
                    const refreshedSettings = await appSettingsOfflineService.getSettingsForUser(userId);
                    return refreshedSettings ? refreshedSettings.data : localSettings.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localSettings.data;
        }

        // No local settings found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local app settings found, fetching from server...');
            const serverSettings = await UserService.getUserAppSettings(userId);

            // Store in SQLite for future offline use
            await appSettingsOfflineService.mergeServerData(userId, serverSettings);

            return serverSettings;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No app settings available offline' });
    } catch (error) {
        console.error('Failed to get app settings:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch app settings',
        });
    }
});

/**
 * Update user app settings (offline-first with optimistic update)
 */
export const updateUserAppSettingsAsync = createAsyncThunk<
    { userAppSettings: UserAppSettings },
    { userAppSettings: UserAppSettings },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateUserAppSettings', async ({ userAppSettings }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Optimistically update local SQLite immediately
        console.log('Updating app settings locally...');
        const updatedSettings = await appSettingsOfflineService.upsertSettings({
            userId,
            data: {
                UnitsOfMeasurement: userAppSettings.UnitsOfMeasurement,
            },
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing app settings to server...');
                const serverResult = await UserService.updateUserAppSettings(userId, userAppSettings);

                // Update local record as synced
                await appSettingsOfflineService.updateSyncStatus(updatedSettings.localId, 'synced', {
                    serverTimestamp: new Date().toISOString(),
                });

                console.log('App settings successfully synced to server');
                const normalizedResult: { userAppSettings: UserAppSettings } = (serverResult as any)?.userAppSettings
                    ? (serverResult as any)
                    : { userAppSettings: serverResult as UserAppSettings };
                return normalizedResult;
            } catch (syncError) {
                console.warn('Failed to sync app settings to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await appSettingsOfflineService.updateSyncStatus(updatedSettings.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('App settings updated offline (will sync when online)');
        return {
            userAppSettings: updatedSettings.data,
        };
    } catch (error) {
        console.error('Failed to update app settings:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update app settings',
        });
    }
});

export const getUserExerciseSubstitutionsAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { params?: GetSubstitutionsParams; forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserExerciseSubstitutions', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { params, forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached substitutions if available and not forcing refresh (only if no params)
        if (
            state.user.userExerciseSubstitutions.length > 0 &&
            state.user.userExerciseSubstitutionsState === REQUEST_STATE.FULFILLED &&
            !forceRefresh &&
            !params // Only use cache if not filtering
        ) {
            return state.user.userExerciseSubstitutions;
        }

        // Try cache first if enabled and not forcing refresh and no params
        if (useCache && !forceRefresh && !params) {
            const cacheKey = `exercise_substitutions`;
            const cached = await cacheService.get<UserExerciseSubstitution[]>(cacheKey);

            if (cached) {
                console.log('Loaded exercise substitutions from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading exercise substitutions from API');
        const substitutions = await UserService.getUserExerciseSubstitutions(userId, params);

        // Cache the result if useCache is enabled and no params (full list)
        if (useCache && !params) {
            const cacheKey = `exercise_substitutions`;
            await cacheService.set(cacheKey, substitutions);
        }

        return substitutions;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise substitutions',
        });
    }
});

// Helper function to refresh exercise substitutions
const refreshExerciseSubstitutions = async (userId: string, params?: GetSubstitutionsParams) => {
    return await UserService.getUserExerciseSubstitutions(userId, params);
};

// Create a new exercise substitution
export const createExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    CreateSubstitutionParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createExerciseSubstitution', async (substitutionData, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create the substitution
        await UserService.createExerciseSubstitution(userId, substitutionData);

        // Invalidate cache after creation
        const cacheKey = `exercise_substitutions`;
        await cacheService.remove(cacheKey);

        // Refresh and return all substitutions
        return await refreshExerciseSubstitutions(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create exercise substitution',
        });
    }
});

// Update an existing exercise substitution
export const updateExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { substitutionId: string; updates: UpdateSubstitutionParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateExerciseSubstitution', async ({ substitutionId, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Update the substitution
        await UserService.updateExerciseSubstitution(userId, substitutionId, updates);

        // Invalidate cache after update
        const cacheKey = `exercise_substitutions`;
        await cacheService.remove(cacheKey);

        // Refresh and return all substitutions
        return await refreshExerciseSubstitutions(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update exercise substitution',
        });
    }
});

// Delete an exercise substitution
export const deleteExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { substitutionId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteExerciseSubstitution', async ({ substitutionId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the substitution
        await UserService.deleteExerciseSubstitution(userId, substitutionId);

        // Invalidate cache after deletion
        const cacheKey = `exercise_substitutions_${userId}`;
        await cacheService.remove(cacheKey);

        // Refresh and return all substitutions
        return await refreshExerciseSubstitutions(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise substitution',
        });
    }
});

// store/user/thunks.ts - Simplified Offline-First Weight Measurement Thunks

/**
 * Get weight measurements (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getWeightMeasurementsAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getWeightMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading weight measurements from SQLite...');
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        // Convert to API format
        const measurements: UserWeightMeasurement[] = localMeasurements.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background weight measurements sync...');
                    const serverMeasurements = await UserService.getWeightMeasurements(userId);
                    await weightMeasurementOfflineService.mergeServerData(userId, serverMeasurements);
                } catch (error) {
                    console.warn('Background weight measurements sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing weight measurements from server...');
                const serverMeasurements = await UserService.getWeightMeasurements(userId);
                await weightMeasurementOfflineService.mergeServerData(userId, serverMeasurements);

                // Reload from SQLite to get merged data
                const refreshedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    orderBy: 'DESC',
                });

                return refreshedMeasurements.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${measurements.length} weight measurements from offline storage`);
        return measurements;
    } catch (error) {
        console.log(error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to load weight measurements',
        });
    }
});

/**
 * Log weight measurement (offline-first with smart duplicate handling)
 * Automatically switches to update mode if entry already exists for the date
 */
export const logWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { weight: number; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logWeightMeasurement', async ({ weight, measurementTimestamp }, { getState, rejectWithValue, dispatch }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const timestamp = measurementTimestamp ?? new Date().toISOString();

        // Check if there's already an entry for this date
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);

        // Look for existing entry using date comparison
        const dateToCheck = new Date(timestamp);
        const dateString = dateToCheck.toISOString().split('T')[0]; // YYYY-MM-DD format

        const existingEntry = localMeasurements.find((m) => {
            // Method 1: Check if timestamps start with same date
            if (m.data.MeasurementTimestamp.startsWith(dateString)) return true;

            // Method 2: Compare normalized dates (start of day)
            const existingDate = new Date(m.data.MeasurementTimestamp);
            existingDate.setHours(0, 0, 0, 0);
            dateToCheck.setHours(0, 0, 0, 0);

            return existingDate.getTime() === dateToCheck.getTime();
        });

        if (existingEntry) {
            // Entry already exists - automatically switch to update mode
            console.log(`Weight entry already exists for ${dateString}, updating instead`);
            const measurements = dispatch(
                updateWeightMeasurementAsync({
                    timestamp: existingEntry.data.MeasurementTimestamp,
                    weight,
                }),
            ).unwrap();
            return measurements;
        }

        // No existing entry found - proceed with create
        console.log('Creating new weight measurement...');
        await weightMeasurementOfflineService.create({
            userId,
            data: {
                weight,
                measurementTimestamp: timestamp,
            },
            timestamp,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Weight measurement logged offline (${measurements.length} total measurements)`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log weight measurement',
        });
    }
});

/**
 * Update weight measurement (offline-first with optimistic update)
 */
export const updateWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { timestamp: string; weight: number },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateWeightMeasurement', async ({ timestamp, weight }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Weight measurement not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating weight measurement locally...');
        await weightMeasurementOfflineService.update(localRecord.localId, {
            weight,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log('Weight measurement updated offline');
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update weight measurement',
        });
    }
});

/**
 * Delete weight measurement (offline-first with optimistic update)
 */
export const deleteWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteWeightMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Weight measurement not found' });
        }

        // Delete from local storage (optimistic update)
        // The service handles queueing for server deletion if needed
        console.log('Deleting weight measurement from local storage...');
        await weightMeasurementOfflineService.delete(localRecord.localId);

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Weight measurement deleted offline (${measurements.length} remaining)`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete weight measurement',
        });
    }
});

// READ - Get sleep measurements (with caching)
export const getSleepMeasurementsAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getSleepMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        // 🧪 TESTING: Add delays/failures
        if (TESTING.SIMULATE_DELAYS) {
            await new Promise((resolve) => setTimeout(resolve, TESTING.DELAY_MS));
        }
        if (TESTING.SIMULATE_SLEEP_FAILURE) {
            throw new Error('Simulated sleep measurements failure');
        }
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        if (state.user.userSleepMeasurements.length > 0 && state.user.userSleepMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userSleepMeasurements;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<UserSleepMeasurement[]>('sleep_measurements');

            if (cached) {
                console.log('Loaded sleep measurements from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading sleep measurements from API');
        const measurements = await UserService.getSleepMeasurements(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('sleep_measurements', measurements);
        }

        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch sleep measurements',
        });
    }
});

// CREATE - Log sleep measurement (invalidate cache)
export const logSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    {
        durationInMinutes?: number;
        sleepTime?: string;
        wakeTime?: string;
        measurementTimestamp?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logSleepMeasurement', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const { measurementTimestamp, ...sleepParams } = params;
        const timestamp = measurementTimestamp ?? new Date().toISOString();
        await UserService.logSleepMeasurement(userId, sleepParams, timestamp);

        // Invalidate cache after creating new measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log sleep measurement',
        });
    }
});

// UPDATE - Update sleep measurement (invalidate cache)
export const updateSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    {
        timestamp: string;
        durationInMinutes?: number;
        sleepTime?: string;
        wakeTime?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateSleepMeasurement', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const { timestamp, ...sleepParams } = params;
        await UserService.updateSleepMeasurement(userId, timestamp, sleepParams);

        // Invalidate cache after updating measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update sleep measurement',
        });
    }
});

// DELETE - Delete sleep measurement (invalidate cache)
export const deleteSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteSleepMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        await UserService.deleteSleepMeasurement(userId, timestamp);

        // Invalidate cache after deleting measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete sleep measurement',
        });
    }
});

/**
 * Get body measurements (offline-first)
 * Loads immediately from SQLite, triggers background server sync if online
 */
export const getBodyMeasurementsAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getBodyMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        console.log('Loading body measurements from SQLite...');

        // Always load from SQLite first (offline-first approach)
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        // Convert to API format
        const measurements: UserBodyMeasurement[] = localMeasurements.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background body measurements sync...');
                    const serverMeasurements = await UserService.getBodyMeasurements(userId);
                    await bodyMeasurementOfflineService.mergeServerData(userId, serverMeasurements);
                } catch (error) {
                    console.warn('Background body measurements sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing body measurements from server...');
                const serverMeasurements = await UserService.getBodyMeasurements(userId);
                await bodyMeasurementOfflineService.mergeServerData(userId, serverMeasurements);

                // Reload from SQLite to get merged data
                const refreshedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    orderBy: 'DESC',
                });

                return refreshedMeasurements.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${measurements.length} body measurements from offline storage`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to load body measurements',
        });
    }
});

/**
 * Log body measurement (offline-first with smart duplicate handling)
 * Automatically switches to update mode if entry already exists for the date
 */
export const logBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { measurements: Record<string, number>; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logBodyMeasurement', async ({ measurements, measurementTimestamp }, { getState, rejectWithValue, dispatch }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const timestamp = measurementTimestamp ?? new Date().toISOString();

        // Check if there's already an entry for this date
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);

        // Look for existing entry using date comparison
        const dateToCheck = new Date(timestamp);
        const dateString = dateToCheck.toISOString().split('T')[0]; // YYYY-MM-DD format

        const existingEntry = localMeasurements.find((m) => {
            // Method 1: Check if timestamps start with same date
            if (m.data.MeasurementTimestamp.startsWith(dateString)) return true;

            // Method 2: Compare normalized dates (start of day)
            const existingDate = new Date(m.data.MeasurementTimestamp);
            existingDate.setHours(0, 0, 0, 0);
            dateToCheck.setHours(0, 0, 0, 0);

            return existingDate.getTime() === dateToCheck.getTime();
        });

        if (existingEntry) {
            // Entry already exists - automatically switch to update mode
            console.log(`Body measurement entry already exists for ${dateString}, updating instead`);
            return await dispatch(
                updateBodyMeasurementAsync({
                    timestamp: existingEntry.data.MeasurementTimestamp,
                    measurements,
                }),
            ).unwrap();
        }

        // No existing entry found - proceed with create
        console.log('Creating new body measurement...');
        await bodyMeasurementOfflineService.create({
            userId,
            data: {
                measurements,
                measurementTimestamp: timestamp,
            },
            timestamp,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Body measurement logged offline (${measurementsResult.length} total measurements)`);
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log body measurement',
        });
    }
});

/**
 * Update body measurement (offline-first with optimistic update)
 */
export const updateBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { timestamp: string; measurements: Record<string, number> },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateBodyMeasurement', async ({ timestamp, measurements }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Body measurement not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating body measurement locally...');
        await bodyMeasurementOfflineService.update(localRecord.localId, {
            measurements,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log('Body measurement updated offline');
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update body measurement',
        });
    }
});

/**
 * Delete body measurement (offline-first with optimistic update)
 */
export const deleteBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteBodyMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Body measurement not found' });
        }

        // Delete from local storage (optimistic update)
        // The service handles queueing for server deletion if needed
        console.log('Deleting body measurement from local storage...');
        await bodyMeasurementOfflineService.delete(localRecord.localId);

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Body measurement deleted offline (${measurementsResult.length} remaining)`);
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete body measurement',
        });
    }
});

export const getUserExerciseSetModificationsAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { params?: GetSetModificationsParams; forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserExerciseSetModifications', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { params, forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached modifications if available and not forcing refresh (only if no params)
        if (
            state.user.userExerciseSetModifications.length > 0 &&
            state.user.userExerciseSetModificationsState === REQUEST_STATE.FULFILLED &&
            !forceRefresh &&
            !params // Only use cache if not filtering
        ) {
            return state.user.userExerciseSetModifications;
        }

        // Try cache first if enabled and not forcing refresh and no params
        if (useCache && !forceRefresh && !params) {
            const cacheKey = `exercise_set_modifications`;
            const cached = await cacheService.get<UserExerciseSetModification[]>(cacheKey);

            if (cached) {
                console.log('Loaded exercise set modifications from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading exercise set modifications from API');
        const modifications = await UserService.getUserExerciseSetModifications(userId, params);

        // Cache the result if useCache is enabled and no params (full list)
        if (useCache && !params) {
            const cacheKey = `exercise_set_modifications`;
            await cacheService.set(cacheKey, modifications);
        }

        return modifications;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise set modifications',
        });
    }
});

// Helper function to refresh exercise set modifications
const refreshExerciseSetModifications = async (userId: string, params?: GetSetModificationsParams) => {
    return await UserService.getUserExerciseSetModifications(userId, params);
};

// Create a new exercise set modification
export const createExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    CreateSetModificationParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createExerciseSetModification', async (modificationData, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create the modification
        await UserService.createExerciseSetModification(userId, modificationData);

        // Invalidate cache after creation
        const cacheKey = `exercise_set_modifications`;
        await cacheService.remove(cacheKey);

        // Refresh and return all modifications
        return await refreshExerciseSetModifications(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create exercise set modification',
        });
    }
});

// Update an existing exercise set modification
export const updateExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { modificationId: string; updates: UpdateSetModificationParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateExerciseSetModification', async ({ modificationId, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Update the modification
        await UserService.updateExerciseSetModification(userId, modificationId, updates);

        // Invalidate cache after update
        const cacheKey = `exercise_set_modifications`;
        await cacheService.remove(cacheKey);

        // Refresh and return all modifications
        return await refreshExerciseSetModifications(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update exercise set modification',
        });
    }
});

// Delete an exercise set modification
export const deleteExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { modificationId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteExerciseSetModification', async ({ modificationId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the modification
        await UserService.deleteExerciseSetModification(userId, modificationId);

        // Invalidate cache after deletion
        const cacheKey = `exercise_set_modifications`;
        await cacheService.remove(cacheKey);

        // Refresh and return all modifications
        return await refreshExerciseSetModifications(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise set modification',
        });
    }
});

// Nutrition Profile Thunks
/**
 * Get user nutrition profile (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getUserNutritionProfileAsync = createAsyncThunk<
    UserNutritionProfile,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserNutritionProfile', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading nutrition profile from SQLite...');
        const localProfile = await nutritionProfileOfflineService.getProfileForUser(userId);

        if (localProfile) {
            console.log('Found nutrition profile in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background nutrition profile sync...');
                        const serverProfile = await UserService.getUserNutritionProfile(userId);
                        await nutritionProfileOfflineService.mergeServerData(userId, serverProfile);
                    } catch (error) {
                        console.warn('Background nutrition profile sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing nutrition profile from server...');
                    const serverProfile = await UserService.getUserNutritionProfile(userId);
                    await nutritionProfileOfflineService.mergeServerData(userId, serverProfile);

                    // Reload from SQLite to get merged data
                    const refreshedProfile = await nutritionProfileOfflineService.getProfileForUser(userId);
                    return refreshedProfile ? refreshedProfile.data : localProfile.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localProfile.data;
        }

        // No local profile found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local nutrition profile found, fetching from server...');
            const serverProfile = await UserService.getUserNutritionProfile(userId);

            // Store in SQLite for future offline use
            await nutritionProfileOfflineService.mergeServerData(userId, serverProfile);

            return serverProfile;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No nutrition profile available offline' });
    } catch (error) {
        console.error('Failed to get nutrition profile:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition profile',
        });
    }
});

/**
 * Update user nutrition profile (offline-first with optimistic update)
 */
export const updateUserNutritionProfileAsync = createAsyncThunk<
    { user: User; userNutritionProfile: UserNutritionProfile },
    { userNutritionProfile: UserNutritionProfile },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateNutritionProfile', async ({ userNutritionProfile }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Optimistically update local SQLite immediately
        console.log('Updating nutrition profile locally...');
        const updatedProfile = await nutritionProfileOfflineService.upsertProfile({
            userId,
            data: {
                PrimaryNutritionGoal: userNutritionProfile.PrimaryNutritionGoal,
                ActivityLevel: userNutritionProfile.ActivityLevel,
            },
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing nutrition profile to server...');
                const serverResult = await UserService.updateUserNutritionProfile(userId, userNutritionProfile);

                // Update local record as synced
                await nutritionProfileOfflineService.updateSyncStatus(updatedProfile.localId, 'synced', {
                    serverTimestamp: serverResult.userNutritionProfile.UpdatedAt,
                });

                console.log('Nutrition profile successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync nutrition profile to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await nutritionProfileOfflineService.updateSyncStatus(updatedProfile.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        // Note: We don't have user from local storage,
        // so we'll need to get it from Redux state or make this return type more flexible
        const currentUser = state.user.user;

        if (!currentUser) {
            // If we don't have the required data in state, we need to handle this case
            console.warn('Missing user data in state for optimistic update');
            return rejectWithValue({ errorMessage: 'Insufficient data for offline update' });
        }

        console.log('Nutrition profile updated offline (will sync when online)');
        return {
            user: currentUser,
            userNutritionProfile: updatedProfile.data,
        };
    } catch (error) {
        console.error('Failed to update nutrition profile:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update nutrition profile',
        });
    }
});

export const completeUserProfileAsync = createAsyncThunk<
    CompleteProfileResponse,
    CompleteProfileParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeProfile', async (profileData, { rejectWithValue }) => {
    try {
        const result = await UserService.completeUserProfile(profileData);

        // Clear cache
        await Promise.all([cacheService.remove('user_recommendations')]);

        return result;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to complete user profile',
        });
    }
});

export const getUserNutritionGoalHistoryAsync = createAsyncThunk<
    UserNutritionGoal[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserNutritionGoalHistory', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached goal history if available and not forcing refresh
        if (state.user.userNutritionGoalHistory.length > 0 && state.user.userNutritionGoalHistoryState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userNutritionGoalHistory;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_nutrition_goal_history`;
            const cached = await cacheService.get<UserNutritionGoal[]>(cacheKey);

            if (cached) {
                console.log('Loaded nutrition goal history from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading nutrition goal history from API');
        const goalHistory = await UserService.getUserNutritionGoalHistory(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_nutrition_goal_history`;
            await cacheService.set(cacheKey, goalHistory);
        }

        return goalHistory;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition goal history',
        });
    }
});

export const createNutritionGoalEntryAsync = createAsyncThunk<
    UserNutritionGoal[],
    {
        goalData: {
            goalCalories: number;
            goalMacros: { Protein: number; Carbs: number; Fat: number };
            tdee: number;
            weightGoal: number;
        };
        adjustmentReason?: string;
        adjustmentNotes?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createNutritionGoalEntry', async ({ goalData, adjustmentReason, adjustmentNotes }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create the new goal entry
        await UserService.createNutritionGoalEntry(userId, goalData, adjustmentReason, adjustmentNotes);

        // Invalidate cache after creation
        const cacheKey = `user_nutrition_goal_history`;
        await cacheService.remove(cacheKey);

        // Refresh and return all goal history
        return await UserService.getUserNutritionGoalHistory(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create nutrition goal entry',
        });
    }
});

// Nutrition Logs Thunks

// 1. Get ALL nutrition logs for a user (no date filter)
export const getAllNutritionLogsAsync = createAsyncThunk<
    UserNutritionLog[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getAllNutritionLogs', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Check if we have a comprehensive set of logs and not forcing refresh
        if (!forceRefresh && Object.keys(state.user.userNutritionLogs).length > 0) {
            console.log('Using existing nutrition logs from Redux state');
            return Object.values(state.user.userNutritionLogs).filter(Boolean) as UserNutritionLog[];
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `all_nutrition_logs`;
            const cached = await cacheService.get<UserNutritionLog[]>(cacheKey);

            if (cached) {
                console.log('Loaded all nutrition logs from cache');
                return cached;
            }
        }
        console.log('Loading all nutrition logs from API');
        const nutritionLogs = await UserService.getAllNutritionLogs(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `all_nutrition_logs`;
            await cacheService.set(cacheKey, nutritionLogs);
        }

        return nutritionLogs;
    } catch (error) {
        console.log(error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch all nutrition logs',
        });
    }
});

// 2. Get nutrition logs with filters (date range, limit, etc.)
export const getNutritionLogsWithFiltersAsync = createAsyncThunk<
    { nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any },
    {
        filters?: { startDate?: string; endDate?: string; limit?: number };
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogsWithFilters', async ({ filters, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create cache key based on filters
        const cacheKey = `nutrition_logs_filtered_${JSON.stringify(filters || {})}`;

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<{ nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any }>(cacheKey);

            if (cached) {
                console.log('Loaded filtered nutrition logs from cache');
                return cached;
            }
        }

        console.log('Loading filtered nutrition logs from API');
        const result = await UserService.getNutritionLogsWithFilters(userId, filters);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set(cacheKey, result);
        }

        return result;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch filtered nutrition logs',
        });
    }
});

// 3. Get nutrition logs for multiple specific dates (optimized for your swipe feature)
export const getNutritionLogsForDatesAsync = createAsyncThunk<
    { [date: string]: UserNutritionLog | null },
    {
        dates: string[];
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogsForDates', async ({ dates, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Filter out dates that are already loaded unless forcing refresh
        const datesToLoad = forceRefresh ? dates : dates.filter((date) => !(date in state.user.userNutritionLogs));

        if (datesToLoad.length === 0 && !forceRefresh) {
            const result: { [date: string]: UserNutritionLog | null } = {};
            dates.forEach((date) => {
                result[date] = state.user.userNutritionLogs[date] || null;
            });
            return result;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cachedResults: { [date: string]: UserNutritionLog | null } = {};
            const uncachedDates: string[] = [];

            for (const date of datesToLoad) {
                const cacheKey = `nutrition_logs_${date}`;
                const cached = await cacheService.get<UserNutritionLog>(cacheKey);

                if (cached !== null) {
                    cachedResults[date] = cached;
                } else {
                    uncachedDates.push(date);
                }
            }

            // If we have some cached data, include it in the final result
            if (Object.keys(cachedResults).length > 0) {
                console.log(`Loaded ${Object.keys(cachedResults).length} nutrition logs from cache`);
            }

            // Only fetch uncached dates
            if (uncachedDates.length > 0) {
                console.log(`Loading ${uncachedDates.length} nutrition logs from API`);

                // Use the new bulk API for efficiency
                const apiResults = await UserService.getBulkNutritionLogs(userId, uncachedDates);

                // Cache the API results if useCache is enabled
                if (useCache) {
                    for (const [date, nutritionLog] of Object.entries(apiResults)) {
                        const cacheKey = `nutrition_logs_${date}`;
                        await cacheService.set(cacheKey, nutritionLog);
                    }
                }

                // Merge cached and API results
                const mergedResults = { ...cachedResults, ...apiResults };

                // If we had some dates already loaded in Redux, merge them too
                if (!forceRefresh) {
                    const fullResults: { [date: string]: UserNutritionLog | null } = {};
                    dates.forEach((date) => {
                        fullResults[date] = mergedResults[date] !== undefined ? mergedResults[date] : state.user.userNutritionLogs[date] || null;
                    });
                    return fullResults;
                }

                return mergedResults;
            }

            // Only cached results, merge with any existing Redux data
            if (!forceRefresh) {
                const fullResults: { [date: string]: UserNutritionLog | null } = {};
                dates.forEach((date) => {
                    fullResults[date] = cachedResults[date] !== undefined ? cachedResults[date] : state.user.userNutritionLogs[date] || null;
                });
                return fullResults;
            }

            return cachedResults;
        }

        console.log(`Loading ${datesToLoad.length} nutrition logs from API`);

        // Use the new bulk API instead of the old individual method
        const results = await UserService.getBulkNutritionLogs(userId, datesToLoad);

        // Cache the results if useCache is enabled
        if (useCache) {
            for (const [date, nutritionLog] of Object.entries(results)) {
                const cacheKey = `nutrition_logs_${date}`;
                await cacheService.set(cacheKey, nutritionLog);
            }
        }

        // If we had some dates already loaded, merge them
        if (!forceRefresh) {
            const fullResults: { [date: string]: UserNutritionLog | null } = {};
            dates.forEach((date) => {
                fullResults[date] = results[date] !== undefined ? results[date] : state.user.userNutritionLogs[date] || null;
            });
            return fullResults;
        }

        return results;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition logs for dates',
        });
    }
});

// 4. Updated single date thunk (keeping backward compatibility)
export const getNutritionLogForDateAsync = createAsyncThunk<
    { date: string; nutritionLog: UserNutritionLog | null },
    { date: string; forceRefresh?: boolean; useCache?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogForDate', async ({ date, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Check Redux state first (unless forcing refresh)
        if (!forceRefresh && state.user.userNutritionLogs[date] !== undefined) {
            console.log(`Loaded nutrition log for ${date} from Redux state`);
            return { date, nutritionLog: state.user.userNutritionLogs[date] };
        }

        // Check cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `nutrition_logs_${date}`;
            const cached = await cacheService.get<UserNutritionLog>(cacheKey);

            if (cached !== null) {
                console.log(`Loaded nutrition log for ${date} from cache`);
                return { date, nutritionLog: cached };
            }
        }

        console.log(`Loading nutrition log for ${date} from API`);
        const nutritionLog = await UserService.getNutritionLogForDate(userId, date);

        // Cache the result if useCache is enabled (cache null values too!)
        if (useCache) {
            const cacheKey = `nutrition_logs_${date}`;
            await cacheService.set(cacheKey, nutritionLog);
        }

        return { date, nutritionLog };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition log for date',
        });
    }
});

// 5. Helper thunk for your food log screen (optimized for swipe navigation)
export const loadNutritionLogsForSwipeNavigationAsync = createAsyncThunk<
    { [date: string]: UserNutritionLog | null },
    {
        centerDate: Date;
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/loadNutritionLogsForSwipeNavigation', async ({ centerDate, forceRefresh = false, useCache = true }, { dispatch }) => {
    // Format dates for the sliding window (previous, current, next)
    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const dates = [
        formatDateForAPI(addDays(centerDate, -1)), // previous
        formatDateForAPI(centerDate), // current
        formatDateForAPI(addDays(centerDate, 1)), // next
    ];

    // Reuse the existing getNutritionLogsForDatesAsync thunk
    const result = await dispatch(
        getNutritionLogsForDatesAsync({
            dates,
            forceRefresh,
            useCache,
        }),
    ).unwrap();

    return result;
});

export const addFoodEntryAsync = createAsyncThunk<
    AddFoodEntryResponse & { date: string },
    { date: string; entryData: AddFoodEntryParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/addFoodEntry', async ({ date, entryData }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Add the food entry
        const result = await UserService.addFoodEntry(userId, date, entryData);

        // Invalidate cache after adding entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { ...result, date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to add food entry',
        });
    }
});

export const updateFoodEntryAsync = createAsyncThunk<
    UpdateFoodEntryResponse & { date: string },
    { date: string; mealType: MealType; entryKey: string; updates: UpdateFoodEntryParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateFoodEntry', async ({ date, mealType, entryKey, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Update the food entry
        const result = await UserService.updateFoodEntry(userId, date, mealType, entryKey, updates);

        // Invalidate cache after updating entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { ...result, date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update food entry',
        });
    }
});

export const deleteFoodEntryAsync = createAsyncThunk<
    { date: string; nutritionLog: UserNutritionLog },
    { date: string; mealType: MealType; entryKey: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteFoodEntry', async ({ date, mealType, entryKey }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the food entry
        const nutritionLog = await UserService.deleteFoodEntry(userId, date, mealType, entryKey);

        // Invalidate cache after deleting entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { date, nutritionLog };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete food entry',
        });
    }
});

export const deleteSpecificDayLogAsync = createAsyncThunk<
    { date: string },
    { date: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteSpecificDayLog', async ({ date }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the entire day's log
        await UserService.deleteSpecificDayLog(userId, date);

        // Invalidate cache after deleting day log
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete day log',
        });
    }
});
