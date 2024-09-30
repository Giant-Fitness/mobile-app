// store/user/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, initialState } from '@/store/user/userState';
import { getUserProgramProgressAsync, getUserAsync } from '@/store/user/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress, User } from '@/types';

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // User
            .addCase(getUserAsync.pending, (state) => {
                state.userState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
                state.userState = REQUEST_STATE.FULFILLED;
                state.user = action.payload;
            })
            .addCase(getUserAsync.rejected, (state, action) => {
                state.userState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch user';
            })

            // User Program Progress
            .addCase(getUserProgramProgressAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserProgramProgressAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(getUserProgramProgressAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch user program progress';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
