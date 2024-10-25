// store/user/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '@/store/user/service';
import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile } from '@/types';
import { RootState } from '@/store/store';

export const getUserAsync = createAsyncThunk<User, void>('user/getUser', async (_, { getState, rejectWithValue }) => {
    const state = getState();
    if (state.user.user) {
        return state.user.user;
    }
    return await UserService.getUser();
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
        const state = getState();
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
        const state = getState();
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
    const state = getState();
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        return await UserService.completeDay(userId, dayId);
    } catch (error) {
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
    const state = getState();
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        return await UserService.uncompleteDay(userId, dayId);
    } catch (error) {
        return rejectWithValue({ errorMessage: 'Failed to uncomplete day' });
    }
});

export const endProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/endProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        await UserService.endProgram(userId);
        return {};
    } catch (error) {
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
    const state = getState();
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        return await UserService.startProgram(userId, programId);
    } catch (error) {
        return rejectWithValue({ errorMessage: 'Failed to start program' });
    }
});

export const resetProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/resetProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }
    try {
        return UserService.resetProgram(userId);
    } catch (error) {
        return rejectWithValue({ errorMessage: 'Failed to reset program' });
    }
});
