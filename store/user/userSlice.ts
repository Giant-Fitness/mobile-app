// store/user/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, initialState } from '@/store/user/userState';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress } from '@/types';

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
