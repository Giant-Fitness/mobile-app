// store/user/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '@/store/user/service';
import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile, UserWeightMeasurement, UserSleepMeasurement, UserAppSettings } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getUserAsync = createAsyncThunk<User, void>('user/getUser', async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.user.user) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserFitnessProfile', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached fitness profile if available
        if (state.user.userFitnessProfile) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserRecommendations', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached recommendations if available
        if (state.user.userRecommendations) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserProgramProgress', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached progress if available
        if (state.user.userProgramProgress) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getWeightMeasurements', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached measurements if available
        if (state.user.userWeightMeasurements.length > 0 && state.user.userWeightMeasurementsState === REQUEST_STATE.FULFILLED) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getSleepMeasurements', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        if (state.user.userSleepMeasurements.length > 0 && state.user.userSleepMeasurementsState === REQUEST_STATE.FULFILLED) {
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
    void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserAppSettings', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached app settings if available
        if (state.user.userAppSettings) {
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
