// store/user/thunks.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { RootState } from '@/store/store';
import UserService from '@/store/user/service';
import {
    CreateSetModificationParams,
    CreateSubstitutionParams,
    GetSetModificationsParams,
    GetSubstitutionsParams,
    UpdateSetModificationParams,
    UpdateSubstitutionParams,
    User,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSetModification,
    UserExerciseSubstitution,
    UserFitnessProfile,
    UserNutritionPreferences,
    UserNutritionProfile,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';
import { cacheService, CacheTTL } from '@/utils/cache';

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
            const cacheKey = `user_fitness_profile`;
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
            const cacheKey = `user_fitness_profile`;
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
        await Promise.all([cacheService.remove(`user_fitness_profile`), cacheService.remove(`user_recommendations`), cacheService.remove('user_data')]);

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
            const cacheKey = `user_recommendations`;
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
            const cacheKey = `user_recommendations`;
            await cacheService.set(cacheKey, userRecommendations, CacheTTL.LONG);
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
            const isExpired = await cacheService.isExpired('user_program_progress');

            if (cached && !isExpired) {
                console.log('Loaded user program progress from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user program progress from API');
        const userProgramProgress = await UserService.getUserProgramProgress(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('user_program_progress', userProgramProgress, CacheTTL.SHORT);
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
    UserProgramProgress,
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
            const cacheKey = `user_app_settings`;
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
            const cacheKey = `user_app_settings`;
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
        const cacheKey = `user_app_settings`;
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
            const cacheKey = `exercise_substitutions`;
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
            const cacheKey = `exercise_substitutions`;
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

// READ - Get weight measurements (with caching)
export const getWeightMeasurementsAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getWeightMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        // 🧪 TESTING: Add delays/failures
        if (TESTING.SIMULATE_DELAYS) {
            await new Promise((resolve) => setTimeout(resolve, TESTING.DELAY_MS));
        }
        if (TESTING.SIMULATE_WEIGHT_FAILURE) {
            throw new Error('Simulated weight measurements failure');
        }

        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached measurements if available and not forcing refresh
        if (state.user.userWeightMeasurements.length > 0 && state.user.userWeightMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userWeightMeasurements;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<UserWeightMeasurement[]>('weight_measurements');
            const isExpired = await cacheService.isExpired('weight_measurements');

            if (cached && !isExpired) {
                console.log('Loaded weight measurements from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading weight measurements from API');
        const measurements = await UserService.getWeightMeasurements(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('weight_measurements', measurements, CacheTTL.LONG);
        }

        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch weight measurements',
        });
    }
});

// CREATE - Log weight measurement (invalidate cache)
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

        // Invalidate cache after creating new measurement
        await cacheService.remove('weight_measurements');

        // Refresh and return all measurements
        return await UserService.getWeightMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log weight measurement',
        });
    }
});

// UPDATE - Update weight measurement (invalidate cache)
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

        // Invalidate cache after updating measurement
        await cacheService.remove('weight_measurements');

        // Refresh and return all measurements
        return await UserService.getWeightMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update weight measurement',
        });
    }
});

// DELETE - Delete weight measurement (invalidate cache)
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

        // Invalidate cache after deleting measurement
        await cacheService.remove('weight_measurements');

        // Refresh and return all measurements
        return await UserService.getWeightMeasurements(userId);
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
            const isExpired = await cacheService.isExpired('sleep_measurements');

            if (cached && !isExpired) {
                console.log('Loaded sleep measurements from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading sleep measurements from API');
        const measurements = await UserService.getSleepMeasurements(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('sleep_measurements', measurements, CacheTTL.LONG);
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

// READ - Get body measurements (with caching)
export const getBodyMeasurementsAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getBodyMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        // 🧪 TESTING: Add delays/failures
        if (TESTING.SIMULATE_DELAYS) {
            await new Promise((resolve) => setTimeout(resolve, TESTING.DELAY_MS));
        }
        if (TESTING.SIMULATE_BODY_FAILURE) {
            throw new Error('Simulated body measurements failure');
        }
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached measurements if available and not forcing refresh
        if (state.user.userBodyMeasurements.length > 0 && state.user.userBodyMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userBodyMeasurements;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<UserBodyMeasurement[]>('body_measurements');
            const isExpired = await cacheService.isExpired('body_measurements');

            if (cached && !isExpired) {
                console.log('Loaded body measurements from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading body measurements from API');
        const measurements = await UserService.getBodyMeasurements(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('body_measurements', measurements, CacheTTL.LONG);
        }

        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch body measurements',
        });
    }
});

// CREATE - Log body measurement (invalidate cache)
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

        // Invalidate cache after creating new measurement
        await cacheService.remove('body_measurements');

        // Refresh and return all measurements
        return await UserService.getBodyMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log body measurement',
        });
    }
});

// UPDATE - Update body measurement (invalidate cache)
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

        // Invalidate cache after updating measurement
        await cacheService.remove('body_measurements');

        // Refresh and return all measurements
        return await UserService.getBodyMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update body measurement',
        });
    }
});

// DELETE - Delete body measurement (invalidate cache)
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

        // Invalidate cache after deleting measurement
        await cacheService.remove('body_measurements');

        // Refresh and return all measurements
        return await UserService.getBodyMeasurements(userId);
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
            const cacheKey = `exercise_set_modifications`;
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
export const getUserNutritionProfileAsync = createAsyncThunk<
    UserNutritionProfile,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserNutritionProfile', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached nutrition profile if available and not forcing refresh
        if (state.user.userNutritionProfile && !forceRefresh) {
            return state.user.userNutritionProfile;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_nutrition_profile`;
            const cached = await cacheService.get<UserNutritionProfile>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded user nutrition profile from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user nutrition profile from API');
        const profile = await UserService.getUserNutritionProfile(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_nutrition_profile`;
            await cacheService.set(cacheKey, profile, CacheTTL.LONG);
        }

        return profile;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition profile',
        });
    }
});

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
        const result = await UserService.updateUserNutritionProfile(userId, userNutritionProfile);

        // Invalidate related caches after update
        await Promise.all([cacheService.remove(`user_nutrition_profile`), cacheService.remove('user_data')]);

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update nutrition profile' });
    }
});

// Nutrition Preferences Thunks
export const getUserNutritionPreferencesAsync = createAsyncThunk<
    UserNutritionPreferences,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserNutritionPreferences', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached nutrition preferences if available and not forcing refresh
        if (state.user.userNutritionPreferences && !forceRefresh) {
            return state.user.userNutritionPreferences;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_nutrition_preferences`;
            const cached = await cacheService.get<UserNutritionPreferences>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log('Loaded user nutrition preferences from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user nutrition preferences from API');
        const preferences = await UserService.getUserNutritionPreferences(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_nutrition_preferences`;
            await cacheService.set(cacheKey, preferences, CacheTTL.LONG);
        }

        return preferences;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition preferences',
        });
    }
});

export const updateUserNutritionPreferencesAsync = createAsyncThunk<
    { user: User; userNutritionPreferences: UserNutritionPreferences },
    { userNutritionPreferences: UserNutritionPreferences },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateNutritionPreferences', async ({ userNutritionPreferences }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        const result = await UserService.updateUserNutritionPreferences(userId, userNutritionPreferences);

        // Invalidate related caches after update
        await Promise.all([cacheService.remove(`user_nutrition_preferences`), cacheService.remove('user_data')]);

        return result;
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update nutrition preferences' });
    }
});
