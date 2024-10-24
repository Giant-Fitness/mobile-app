// store/user/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, initialState } from '@/store/user/userState';
import {
    getUserAsync,
    getUserFitnessProfileAsync,
    updateUserFitnessProfileAsync,
    getUserRecommendationsAsync,
    getUserProgramProgressAsync,
    completeDayAsync,
    uncompleteDayAsync,
    endProgramAsync,
    startProgramAsync,
    resetProgramAsync,
} from '@/store/user/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress, User, UserRecommendations } from '@/types';

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

            // Get User Fitness Profile
            .addCase(getUserFitnessProfileAsync.pending, (state) => {
                state.userFitnessProfileState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserFitnessProfileAsync.fulfilled, (state, action) => {
                state.userFitnessProfileState = REQUEST_STATE.FULFILLED;
                state.userFitnessProfile = action.payload.userFitnessProfile;
            })
            .addCase(getUserFitnessProfileAsync.rejected, (state, action) => {
                state.userFitnessProfileState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to get user fitness profile';
            })

            // Update User Fitness Profile
            .addCase(updateUserFitnessProfileAsync.pending, (state) => {
                state.userState = REQUEST_STATE.PENDING;
                state.userRecommendationsState = REQUEST_STATE.PENDING;
                state.userFitnessProfileState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateUserFitnessProfileAsync.fulfilled, (state, action) => {
                state.userState = REQUEST_STATE.FULFILLED;
                state.userRecommendationsState = REQUEST_STATE.FULFILLED;
                state.userFitnessProfileState = REQUEST_STATE.PENDING;
                state.user = action.payload.user;
                state.userFitnessProfile = action.payload.userFitnessProfile;
                state.userRecommendations = action.payload.userRecommendations;
            })
            .addCase(updateUserFitnessProfileAsync.rejected, (state, action) => {
                state.userState = REQUEST_STATE.REJECTED;
                state.userRecommendationsState = REQUEST_STATE.REJECTED;
                state.userFitnessProfileState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update user fitness profile';
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
            })
            // User Recommendations
            .addCase(getUserRecommendationsAsync.pending, (state) => {
                state.userRecommendationsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserRecommendationsAsync.fulfilled, (state, action: PayloadAction<UserRecommendations>) => {
                state.userRecommendationsState = REQUEST_STATE.FULFILLED;
                state.userRecommendations = action.payload;
            })
            .addCase(getUserRecommendationsAsync.rejected, (state, action) => {
                state.userRecommendationsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch user recommendationns';
            })

            // Complete Day
            .addCase(completeDayAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(completeDayAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(completeDayAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to complete day';
            })

            // Uncomplete Day
            .addCase(uncompleteDayAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(uncompleteDayAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(uncompleteDayAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to uncomplete day';
            })

            // End Program
            .addCase(endProgramAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(endProgramAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(endProgramAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to end program';
            })

            // Start Program
            .addCase(startProgramAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(startProgramAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(startProgramAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to end program';
            })

            // Reset Program
            .addCase(resetProgramAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(resetProgramAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(resetProgramAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to end program';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
