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
} from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getUserAsync = createAsyncThunk<User, { forceRefresh?: boolean } | void>('user/getUser', async (args = {}, { getState }) => {
    const { forceRefresh = false } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.user.user && !forceRefresh) {
        return state.user.user;
    }
    return await UserService.getUser();
});

export const updateUserAsync = createAsyncThunk<
    User,
    Partial<User>,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateUser', async (updates, { rejectWithValue }) => {
    try {
        // Update the user
        const updatedUser = await UserService.updateUser(updates);
        return updatedUser;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update user',
        });
    }
});

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

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached fitness profile if available and not forcing refresh
        if (state.user.userFitnessProfile && !forceRefresh) {
            return state.user.userFitnessProfile;
        }

        // Fetch and return fitness profile
        const profile = await UserService.getUserFitnessProfile(userId);
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
        return await UserService.updateUserFitnessProfile(userId, userFitnessProfile);
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update fitness profile' });
    }
});

export const getUserRecommendationsAsync = createAsyncThunk<
    UserRecommendations,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserRecommendations', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
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

        // Fetch and return recommendations
        const userRecommendations = await UserService.getUserRecommendations(userId);
        return userRecommendations;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch user recommendations',
        });
    }
});

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

        // Fetch and return progress
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
    { dayId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeDay', async ({ dayId }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        return await UserService.completeDay(userId, dayId);
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
        return await UserService.uncompleteDay(userId, dayId);
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
        return await UserService.startProgram(userId, programId);
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
        return UserService.resetProgram(userId);
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to reset program' });
    }
});

// Get all weight measurements
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

        const measurements = await UserService.getWeightMeasurements(userId);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch weight measurements',
        });
    }
});

// Helper function to refresh weight measurements
const refreshWeightMeasurements = async (userId: string) => {
    return await UserService.getWeightMeasurements(userId);
};

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
    { durationInMinutes: number; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logSleepMeasurement', async ({ durationInMinutes, measurementTimestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const timestamp = measurementTimestamp ?? new Date().toISOString();
        await UserService.logSleepMeasurement(userId, durationInMinutes, timestamp);
        return await refreshSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log sleep measurement',
        });
    }
});

export const updateSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { timestamp: string; durationInMinutes: number },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateSleepMeasurement', async ({ timestamp, durationInMinutes }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        await UserService.updateSleepMeasurement(userId, timestamp, durationInMinutes);
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

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached app settings if available and not forcing refresh
        if (state.user.userAppSettings && !forceRefresh) {
            return state.user.userAppSettings;
        }

        // Fetch and return app settings
        const profile = await UserService.getUserAppSettings(userId);
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
        return { userAppSettings: result };
    } catch (error) {
        console.log(error);
        return rejectWithValue({ errorMessage: 'Failed to update app settings' });
    }
});

const refreshBodyMeasurements = async (userId: string) => {
    return await UserService.getBodyMeasurements(userId);
};

// Get all body measurements
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

// Helper function to refresh exercise substitutions
const refreshExerciseSubstitutions = async (userId: string, params?: GetSubstitutionsParams) => {
    return await UserService.getUserExerciseSubstitutions(userId, params);
};

// Get all exercise substitutions for a user
export const getUserExerciseSubstitutionsAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { params?: GetSubstitutionsParams; forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserExerciseSubstitutions', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { params, forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached substitutions if available and not forcing refresh
        if (
            state.user.userExerciseSubstitutions.length > 0 &&
            state.user.userExerciseSubstitutionsState === REQUEST_STATE.FULFILLED &&
            !forceRefresh &&
            !params // Only use cache if not filtering
        ) {
            return state.user.userExerciseSubstitutions;
        }

        const substitutions = await UserService.getUserExerciseSubstitutions(userId, params);
        return substitutions;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise substitutions',
        });
    }
});

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

        // Refresh and return all substitutions
        return await refreshExerciseSubstitutions(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise substitution',
        });
    }
});
