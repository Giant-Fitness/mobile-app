// store/user/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '@/store/user/service';
import {
    UserProgramProgress,
    User,
    UserRecommendations,
    UserFitnessProfile,
    UserWeightMeasurement,
    UserSleepMeasurement,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSubstitution,
    CreateSubstitutionParams,
    UpdateSubstitutionParams,
    GetSubstitutionsParams,
    UserExerciseSetModification,
    CreateSetModificationParams,
    UpdateSetModificationParams,
    GetSetModificationsParams,
} from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService, CacheTTL } from '@/utils/cache';

export const getUserAsync = createAsyncThunk<User, { forceRefresh?: boolean; useCache?: boolean } | void>('user/getUser', async (args = {}, { getState }) => {
    const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.user.user && !forceRefresh) {
        return state.user.user;
    }

    // Try cache first if enabled and not forcing refresh
    if (useCache && !forceRefresh) {
        const cached = await cacheService.get<User>('user_data');
        const isExpired = await cacheService.isExpired('user_data');

        if (cached && !isExpired) {
            console.log('Loaded user data from cache');
            return cached;
        }
    }

    // Load from API
    console.log('Loading user data from API');
    const user = await UserService.getUser();

    // Cache the result if useCache is enabled
    if (useCache) {
        await cacheService.set('user_data', user, CacheTTL.LONG);
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

export const getUserFitnessProfileAsync = createAsyncThunk<
    UserFitnessProfile,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserFitnessProfile', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached fitness profile if available and not forcing refresh
        if (state.user.userFitnessProfile && !forceRefresh) {
            return state.user.userFitnessProfile;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_fitness_profile_${userId}`;
            const cached = await cacheService.get<UserFitnessProfile>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded user fitness profile from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user fitness profile from API');
        const profile = await UserService.getUserFitnessProfile(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_fitness_profile_${userId}`;
            await cacheService.set(cacheKey, profile, CacheTTL.LONG);
        }

        return profile;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch fitness profile',
        });
    }
});

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

    try {
        const result = await UserService.updateUserFitnessProfile(userId, userFitnessProfile);

        // Invalidate related caches after update
        await Promise.all([
            cacheService.remove(`user_fitness_profile_${userId}`),
            cacheService.remove(`user_recommendations_${userId}`),
            cacheService.remove('user_data'),
        ]);

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update fitness profile' });
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
            const cacheKey = `user_recommendations_${userId}`;
            const cached = await cacheService.get<UserRecommendations>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded user recommendations from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user recommendations from API');
        const userRecommendations = await UserService.getUserRecommendations(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_recommendations_${userId}`;
            await cacheService.set(cacheKey, userRecommendations, CacheTTL.LONG);
        }

        return userRecommendations;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch user recommendations',
        });
    }
});

// Program progress is always fresh - never cached
export const getUserProgramProgressAsync = createAsyncThunk<
    UserProgramProgress,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserProgramProgress', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached progress if available and not forcing refresh
        if (state.user.userProgramProgress && !forceRefresh) {
            return state.user.userProgramProgress;
        }

        // Always fetch fresh program progress (too critical to cache)
        console.log('Loading user program progress from API (always fresh)');
        const userProgramProgress = await UserService.getUserProgramProgress(userId);
        return userProgramProgress;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch program progress',
        });
    }
});

export const completeDayAsync = createAsyncThunk<
    UserProgramProgress,
    { dayId: string; isAutoComplete?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeDay', async ({ dayId, isAutoComplete = false }: { dayId: string; isAutoComplete?: boolean }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.completeDay(userId, dayId, isAutoComplete);
        // No cache invalidation needed since program progress is never cached
        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to complete day' });
    }
});

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
        // No cache invalidation needed since program progress is never cached
        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to uncomplete day' });
    }
});

export const endProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/endProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.endProgram(userId);
        // No cache invalidation needed since program progress is never cached
        return result as UserProgramProgress;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to end program' });
    }
});

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
        // No cache invalidation needed since program progress is never cached
        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to start program' });
    }
});

export const resetProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/resetProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        const result = await UserService.resetProgram(userId);
        // No cache invalidation needed since program progress is never cached
        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to reset program' });
    }
});

export const getUserAppSettingsAsync = createAsyncThunk<
    UserAppSettings,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserAppSettings', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached app settings if available and not forcing refresh
        if (state.user.userAppSettings && !forceRefresh) {
            return state.user.userAppSettings;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_app_settings_${userId}`;
            const cached = await cacheService.get<UserAppSettings>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded user app settings from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user app settings from API');
        const profile = await UserService.getUserAppSettings(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_app_settings_${userId}`;
            await cacheService.set(cacheKey, profile, CacheTTL.LONG);
        }

        return profile;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch app settings',
        });
    }
});

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
        const result = await UserService.updateUserAppSettings(userId, userAppSettings);

        // Invalidate app settings cache after update
        const cacheKey = `user_app_settings_${userId}`;
        await cacheService.remove(cacheKey);

        return { userAppSettings: result };
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update app settings' });
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
            const cacheKey = `exercise_substitutions_${userId}`;
            const cached = await cacheService.get<UserExerciseSubstitution[]>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded exercise substitutions from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading exercise substitutions from API');
        const substitutions = await UserService.getUserExerciseSubstitutions(userId, params);

        // Cache the result if useCache is enabled and no params (full list)
        if (useCache && !params) {
            const cacheKey = `exercise_substitutions_${userId}`;
            await cacheService.set(cacheKey, substitutions, CacheTTL.VERY_LONG);
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
        const cacheKey = `exercise_substitutions_${userId}`;
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
        const cacheKey = `exercise_substitutions_${userId}`;
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

// MEASUREMENT THUNKS - These are always fresh due to their real-time nature

// Helper function to refresh weight measurements
const refreshWeightMeasurements = async (userId: string) => {
    return await UserService.getWeightMeasurements(userId);
};

// Get all weight measurements - Always fresh, no caching
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

        // Return cached measurements if available and not forcing refresh
        if (state.user.userWeightMeasurements.length > 0 && state.user.userWeightMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userWeightMeasurements;
        }

        // Always fetch fresh measurements (too dynamic to cache effectively)
        console.log('Loading weight measurements from API (always fresh)');
        const measurements = await UserService.getWeightMeasurements(userId);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch weight measurements',
        });
    }
});

// Log new weight measurement
export const logWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { weight: number; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logWeightMeasurement', async ({ weight, measurementTimestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Log the new measurement
        const timestamp = measurementTimestamp ?? new Date().toISOString();
        await UserService.logWeightMeasurement(userId, weight, timestamp);

        // Refresh and return all measurements
        return await refreshWeightMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log weight measurement',
        });
    }
});

// Update weight measurement
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

        // Update the measurement
        await UserService.updateWeightMeasurement(userId, timestamp, weight);

        // Refresh and return all measurements
        return await refreshWeightMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update weight measurement',
        });
    }
});

// Delete weight measurement
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

        // Delete the measurement
        await UserService.deleteWeightMeasurement(userId, timestamp);

        // Refresh and return all measurements
        return await refreshWeightMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete weight measurement',
        });
    }
});

// Helper function to refresh sleep measurements
const refreshSleepMeasurements = async (userId: string) => {
    return await UserService.getSleepMeasurements(userId);
};

export const getSleepMeasurementsAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getSleepMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        if (state.user.userSleepMeasurements.length > 0 && state.user.userSleepMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userSleepMeasurements;
        }

        // Always fetch fresh sleep measurements (too dynamic to cache effectively)
        console.log('Loading sleep measurements from API (always fresh)');
        const measurements = await UserService.getSleepMeasurements(userId);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch sleep measurements',
        });
    }
});

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
        return await refreshSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log sleep measurement',
        });
    }
});

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

        // Extract timestamp and sleep parameters
        const { timestamp, ...sleepParams } = params;

        // Update the measurement with the new service method
        await UserService.updateSleepMeasurement(userId, timestamp, sleepParams);

        // Refresh and return all measurements
        return await refreshSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update sleep measurement',
        });
    }
});

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
        return await refreshSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete sleep measurement',
        });
    }
});

const refreshBodyMeasurements = async (userId: string) => {
    return await UserService.getBodyMeasurements(userId);
};

// Get all body measurements - Always fresh, no caching
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

        // Return cached measurements if available and not forcing refresh
        if (state.user.userBodyMeasurements.length > 0 && state.user.userBodyMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userBodyMeasurements;
        }

        // Always fetch fresh body measurements (too dynamic to cache effectively)
        console.log('Loading body measurements from API (always fresh)');
        const measurements = await UserService.getBodyMeasurements(userId);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch body measurements',
        });
    }
});

// Log new body measurement
export const logBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { measurements: Record<string, number>; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logBodyMeasurement', async ({ measurements, measurementTimestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Log the new measurement
        const timestamp = measurementTimestamp ?? new Date().toISOString();
        await UserService.logBodyMeasurement(userId, measurements, timestamp);

        // Refresh and return all measurements
        return await refreshBodyMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log body measurement',
        });
    }
});

// Update body measurement
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

        // Update the measurement
        await UserService.updateBodyMeasurement(userId, timestamp, measurements);

        // Refresh and return all measurements
        return await refreshBodyMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update body measurement',
        });
    }
});

// Delete body measurement
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

        // Delete the measurement
        await UserService.deleteBodyMeasurement(userId, timestamp);

        // Refresh and return all measurements
        return await refreshBodyMeasurements(userId);
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
            const cacheKey = `exercise_set_modifications_${userId}`;
            const cached = await cacheService.get<UserExerciseSetModification[]>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded exercise set modifications from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading exercise set modifications from API');
        const modifications = await UserService.getUserExerciseSetModifications(userId, params);

        // Cache the result if useCache is enabled and no params (full list)
        if (useCache && !params) {
            const cacheKey = `exercise_set_modifications_${userId}`;
            await cacheService.set(cacheKey, modifications, CacheTTL.LONG);
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
        const cacheKey = `exercise_set_modifications_${userId}`;
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
        const cacheKey = `exercise_set_modifications_${userId}`;
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
        const cacheKey = `exercise_set_modifications_${userId}`;
        await cacheService.remove(cacheKey);

        // Refresh and return all modifications
        return await refreshExerciseSetModifications(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise set modification',
        });
    }
});
