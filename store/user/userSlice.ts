// store/user/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from '@/store/user/userState';
import {
    getUserAsync,
    updateUserAsync,
    getUserFitnessProfileAsync,
    updateUserFitnessProfileAsync,
    getUserRecommendationsAsync,
    getUserProgramProgressAsync,
    completeDayAsync,
    uncompleteDayAsync,
    endProgramAsync,
    startProgramAsync,
    resetProgramAsync,
    getWeightMeasurementsAsync,
    logWeightMeasurementAsync,
    updateWeightMeasurementAsync,
    deleteWeightMeasurementAsync,
    deleteSleepMeasurementAsync,
    updateSleepMeasurementAsync,
    logSleepMeasurementAsync,
    getSleepMeasurementsAsync,
    getUserAppSettingsAsync,
    updateUserAppSettingsAsync,
} from '@/store/user/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile, UserWeightMeasurement, UserSleepMeasurement, UserAppSettings } from '@/types';

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

            .addCase(updateUserAsync.pending, (state) => {
                state.userState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
                state.userState = REQUEST_STATE.FULFILLED;
                state.user = action.payload;
            })
            .addCase(updateUserAsync.rejected, (state, action) => {
                state.userState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update user';
            })

            // Get User Fitness Profile
            .addCase(getUserFitnessProfileAsync.pending, (state) => {
                state.userFitnessProfileState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserFitnessProfileAsync.fulfilled, (state, action: PayloadAction<UserFitnessProfile>) => {
                state.userFitnessProfileState = REQUEST_STATE.FULFILLED;
                state.userFitnessProfile = action.payload;
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
                state.userProgramProgress = action.payload;
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
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
            })
            // Get Weight Measurements
            .addCase(getWeightMeasurementsAsync.pending, (state) => {
                state.userWeightMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getWeightMeasurementsAsync.fulfilled, (state, action: PayloadAction<UserWeightMeasurement[]>) => {
                state.userWeightMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userWeightMeasurements = action.payload;
            })
            .addCase(getWeightMeasurementsAsync.rejected, (state, action) => {
                state.userWeightMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch weight measurements';
            })

            // Log New Weight Measurement
            .addCase(logWeightMeasurementAsync.pending, (state) => {
                state.userWeightMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(logWeightMeasurementAsync.fulfilled, (state, action: PayloadAction<UserWeightMeasurement[]>) => {
                state.userWeightMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userWeightMeasurements = action.payload;
            })
            .addCase(logWeightMeasurementAsync.rejected, (state, action) => {
                state.userWeightMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to log weight measurement';
            })

            // Update Weight Measurement
            .addCase(updateWeightMeasurementAsync.pending, (state) => {
                state.userWeightMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateWeightMeasurementAsync.fulfilled, (state, action: PayloadAction<UserWeightMeasurement[]>) => {
                state.userWeightMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userWeightMeasurements = action.payload;
            })
            .addCase(updateWeightMeasurementAsync.rejected, (state, action) => {
                state.userWeightMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update weight measurement';
            })

            // Delete Weight Measurement
            .addCase(deleteWeightMeasurementAsync.pending, (state) => {
                state.userWeightMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteWeightMeasurementAsync.fulfilled, (state, action: PayloadAction<UserWeightMeasurement[]>) => {
                state.userWeightMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userWeightMeasurements = action.payload;
            })
            .addCase(deleteWeightMeasurementAsync.rejected, (state, action) => {
                state.userWeightMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete weight measurement';
            })

            // Get Sleep Measurements
            .addCase(getSleepMeasurementsAsync.pending, (state) => {
                state.userSleepMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getSleepMeasurementsAsync.fulfilled, (state, action: PayloadAction<UserSleepMeasurement[]>) => {
                state.userSleepMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userSleepMeasurements = action.payload;
            })
            .addCase(getSleepMeasurementsAsync.rejected, (state, action) => {
                state.userSleepMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch sleep measurements';
            })

            // Log Sleep Measurement
            .addCase(logSleepMeasurementAsync.pending, (state) => {
                state.userSleepMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(logSleepMeasurementAsync.fulfilled, (state, action: PayloadAction<UserSleepMeasurement[]>) => {
                state.userSleepMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userSleepMeasurements = action.payload;
            })
            .addCase(logSleepMeasurementAsync.rejected, (state, action) => {
                state.userSleepMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to log sleep measurement';
            })

            // Update Sleep Measurement
            .addCase(updateSleepMeasurementAsync.pending, (state) => {
                state.userSleepMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateSleepMeasurementAsync.fulfilled, (state, action: PayloadAction<UserSleepMeasurement[]>) => {
                state.userSleepMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userSleepMeasurements = action.payload;
            })
            .addCase(updateSleepMeasurementAsync.rejected, (state, action) => {
                state.userSleepMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update sleep measurement';
            })

            // Delete Sleep Measurement
            .addCase(deleteSleepMeasurementAsync.pending, (state) => {
                state.userSleepMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteSleepMeasurementAsync.fulfilled, (state, action: PayloadAction<UserSleepMeasurement[]>) => {
                state.userSleepMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userSleepMeasurements = action.payload;
            })
            .addCase(deleteSleepMeasurementAsync.rejected, (state, action) => {
                state.userSleepMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete sleep measurement';
            })

            // Get User App Settings
            .addCase(getUserAppSettingsAsync.pending, (state) => {
                state.userAppSettingsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserAppSettingsAsync.fulfilled, (state, action: PayloadAction<UserAppSettings>) => {
                state.userAppSettingsState = REQUEST_STATE.FULFILLED;
                state.userAppSettings = action.payload;
            })
            .addCase(getUserAppSettingsAsync.rejected, (state, action) => {
                state.userAppSettingsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to get user app settings';
            })

            // Update User App Settings
            .addCase(updateUserAppSettingsAsync.pending, (state) => {
                state.userAppSettingsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateUserAppSettingsAsync.fulfilled, (state, action) => {
                state.userAppSettingsState = REQUEST_STATE.FULFILLED;
                state.userAppSettings = action.payload.userAppSettings;
            })
            .addCase(updateUserAppSettingsAsync.rejected, (state, action) => {
                state.userAppSettingsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update user app settings';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
