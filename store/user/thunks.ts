// store/user/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '@/store/user/service';
import { UserProgramProgress } from '@/types';
import { RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getUserProgramProgressAsync = createAsyncThunk<UserProgramProgress, void>(
    'user/getUserProgramProgress',
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        if (state.user.userProgramProgress) {
            return state.user.userProgramProgress;
        }
        return await UserService.getUserProgramProgress();
    },
);
