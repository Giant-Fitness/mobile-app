// store/user/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '@/store/user/service';
import { UserProgramProgress, User } from '@/types';
import { RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getUserProgramProgressAsync = createAsyncThunk<
    UserProgramProgress,
    string | undefined,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserProgramProgress', async (userId: string | undefined, { getState, rejectWithValue }) => {
    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    const state = getState();
    if (state.user.userProgramProgress) {
        return state.user.userProgramProgress;
    }
    return await UserService.getUserProgramProgress(userId);
});

export const getUserAsync = createAsyncThunk<User, void>('user/getUser', async (_, { getState, rejectWithValue }) => {
    const state = getState();
    if (state.user.user) {
        return state.user.user;
    }
    return await UserService.getUser();
});

export const completeDayAsync = createAsyncThunk<
    UserProgramProgress,
    { programId: string; dayId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeDay', async ({ programId, dayId }, { getState, rejectWithValue }) => {
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
