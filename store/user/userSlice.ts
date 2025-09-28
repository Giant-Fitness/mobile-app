// store/user/userSlice.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import {
    addFoodEntryAsync,
    completeDayAsync,
    completeUserProfileAsync,
    createExerciseSetModificationAsync,
    createExerciseSubstitutionAsync,
    createNutritionGoalEntryAsync,
    deleteBodyMeasurementAsync,
    deleteExerciseSetModificationAsync,
    deleteExerciseSubstitutionAsync,
    deleteFoodEntryAsync,
    deleteSleepMeasurementAsync,
    deleteSpecificDayLogAsync,
    deleteWeightMeasurementAsync,
    endProgramAsync,
    getAllNutritionLogsAsync,
    getBodyMeasurementsAsync,
    getNutritionLogForDateAsync,
    getNutritionLogsForDatesAsync,
    getNutritionLogsWithFiltersAsync,
    getSleepMeasurementsAsync,
    getUserAppSettingsAsync,
    getUserAsync,
    getUserExerciseSetModificationsAsync,
    getUserExerciseSubstitutionsAsync,
    getUserFitnessProfileAsync,
    getUserNutritionGoalHistoryAsync,
    getUserNutritionProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
    loadNutritionLogsForSwipeNavigationAsync,
    logBodyMeasurementAsync,
    logSleepMeasurementAsync,
    logWeightMeasurementAsync,
    resetProgramAsync,
    startProgramAsync,
    uncompleteDayAsync,
    updateBodyMeasurementAsync,
    updateExerciseSetModificationAsync,
    updateExerciseSubstitutionAsync,
    updateFoodEntryAsync,
    updateSleepMeasurementAsync,
    updateUserAppSettingsAsync,
    updateUserAsync,
    updateUserFitnessProfileAsync,
    updateUserNutritionProfileAsync,
    updateWeightMeasurementAsync,
} from '@/store/user/thunks';
import { initialState } from '@/store/user/userState';
import {
    AddFoodEntryResponse,
    CompleteProfileResponse,
    UpdateFoodEntryResponse,
    User,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSetModification,
    UserExerciseSubstitution,
    UserFitnessProfile,
    UserNutritionGoal,
    UserNutritionLog,
    UserNutritionProfile,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

            // Complete User Profile (onboarding)
            .addCase(completeUserProfileAsync.pending, (state) => {
                // Set multiple states to pending since we're updating several entities
                state.userState = REQUEST_STATE.PENDING;
                state.userFitnessProfileState = REQUEST_STATE.PENDING;
                state.userRecommendationsState = REQUEST_STATE.PENDING;
                state.userAppSettingsState = REQUEST_STATE.PENDING;
                state.userNutritionGoalHistoryState = REQUEST_STATE.PENDING;
                // Only set nutrition states to pending if they will be created
                // (we'll handle this in fulfilled based on response)
                state.error = null;
            })
            .addCase(completeUserProfileAsync.fulfilled, (state, action: PayloadAction<CompleteProfileResponse>) => {
                // Update all related state
                state.userState = REQUEST_STATE.FULFILLED;
                state.userFitnessProfileState = REQUEST_STATE.FULFILLED;
                state.userRecommendationsState = REQUEST_STATE.FULFILLED;
                state.userAppSettingsState = REQUEST_STATE.FULFILLED;
                state.userNutritionGoalHistoryState = REQUEST_STATE.FULFILLED;

                // Set the data
                state.user = action.payload.user;
                state.userFitnessProfile = action.payload.userFitnessProfile;
                state.userRecommendations = action.payload.userRecommendations;

                state.userNutritionGoalHistory = [action.payload.userNutritionGoal];

                // Handle userAppSettings
                if (action.payload.userAppSettings) {
                    state.userAppSettings = action.payload.userAppSettings;
                }

                // Handle optional nutrition data
                if (action.payload.userNutritionProfile) {
                    state.userNutritionProfileState = REQUEST_STATE.FULFILLED;
                    state.userNutritionProfile = action.payload.userNutritionProfile;
                }

                // Clear error
                state.error = null;
            })
            .addCase(completeUserProfileAsync.rejected, (state, action) => {
                // Set all attempted states to rejected
                state.userState = REQUEST_STATE.REJECTED;
                state.userFitnessProfileState = REQUEST_STATE.REJECTED;
                state.userRecommendationsState = REQUEST_STATE.REJECTED;
                state.userNutritionProfileState = REQUEST_STATE.REJECTED;
                state.userAppSettingsState = REQUEST_STATE.REJECTED;
                state.userNutritionGoalHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to complete user profile';
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
                state.userFitnessProfileState = REQUEST_STATE.FULFILLED;
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
            .addCase(completeDayAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress | null>) => {
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
            })

            // Get Body Measurements
            .addCase(getBodyMeasurementsAsync.pending, (state) => {
                state.userBodyMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getBodyMeasurementsAsync.fulfilled, (state, action: PayloadAction<UserBodyMeasurement[]>) => {
                state.userBodyMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userBodyMeasurements = action.payload;
            })
            .addCase(getBodyMeasurementsAsync.rejected, (state, action) => {
                state.userBodyMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch body measurements';
            })

            // Log Body Measurement
            .addCase(logBodyMeasurementAsync.pending, (state) => {
                state.userBodyMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(logBodyMeasurementAsync.fulfilled, (state, action: PayloadAction<UserBodyMeasurement[]>) => {
                state.userBodyMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userBodyMeasurements = action.payload;
            })
            .addCase(logBodyMeasurementAsync.rejected, (state, action) => {
                state.userBodyMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to log body measurement';
            })

            // Update Body Measurement
            .addCase(updateBodyMeasurementAsync.pending, (state) => {
                state.userBodyMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateBodyMeasurementAsync.fulfilled, (state, action: PayloadAction<UserBodyMeasurement[]>) => {
                state.userBodyMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userBodyMeasurements = action.payload;
            })
            .addCase(updateBodyMeasurementAsync.rejected, (state, action) => {
                state.userBodyMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update body measurement';
            })

            // Delete Body Measurement
            .addCase(deleteBodyMeasurementAsync.pending, (state) => {
                state.userBodyMeasurementsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteBodyMeasurementAsync.fulfilled, (state, action: PayloadAction<UserBodyMeasurement[]>) => {
                state.userBodyMeasurementsState = REQUEST_STATE.FULFILLED;
                state.userBodyMeasurements = action.payload;
            })
            .addCase(deleteBodyMeasurementAsync.rejected, (state, action) => {
                state.userBodyMeasurementsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete body measurement';
            })
            .addCase(getUserExerciseSubstitutionsAsync.pending, (state) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserExerciseSubstitutionsAsync.fulfilled, (state, action: PayloadAction<UserExerciseSubstitution[]>) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSubstitutions = action.payload;
            })
            .addCase(getUserExerciseSubstitutionsAsync.rejected, (state, action) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch exercise substitutions';
            })

            .addCase(createExerciseSubstitutionAsync.pending, (state) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(createExerciseSubstitutionAsync.fulfilled, (state, action: PayloadAction<UserExerciseSubstitution[]>) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSubstitutions = action.payload;
            })
            .addCase(createExerciseSubstitutionAsync.rejected, (state, action) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to create exercise substitution';
            })

            .addCase(updateExerciseSubstitutionAsync.pending, (state) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateExerciseSubstitutionAsync.fulfilled, (state, action: PayloadAction<UserExerciseSubstitution[]>) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSubstitutions = action.payload;
            })
            .addCase(updateExerciseSubstitutionAsync.rejected, (state, action) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update exercise substitution';
            })

            .addCase(deleteExerciseSubstitutionAsync.pending, (state) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteExerciseSubstitutionAsync.fulfilled, (state, action: PayloadAction<UserExerciseSubstitution[]>) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSubstitutions = action.payload;
            })
            .addCase(deleteExerciseSubstitutionAsync.rejected, (state, action) => {
                state.userExerciseSubstitutionsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete exercise substitution';
            })

            // Get Exercise Set Modifications
            .addCase(getUserExerciseSetModificationsAsync.pending, (state) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserExerciseSetModificationsAsync.fulfilled, (state, action: PayloadAction<UserExerciseSetModification[]>) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSetModifications = action.payload;
            })
            .addCase(getUserExerciseSetModificationsAsync.rejected, (state, action) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch exercise set modifications';
            })

            // Create Exercise Set Modification
            .addCase(createExerciseSetModificationAsync.pending, (state) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(createExerciseSetModificationAsync.fulfilled, (state, action: PayloadAction<UserExerciseSetModification[]>) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSetModifications = action.payload;
            })
            .addCase(createExerciseSetModificationAsync.rejected, (state, action) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to create exercise set modification';
            })

            // Update Exercise Set Modification
            .addCase(updateExerciseSetModificationAsync.pending, (state) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateExerciseSetModificationAsync.fulfilled, (state, action: PayloadAction<UserExerciseSetModification[]>) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSetModifications = action.payload;
            })
            .addCase(updateExerciseSetModificationAsync.rejected, (state, action) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update exercise set modification';
            })

            // Delete Exercise Set Modification
            .addCase(deleteExerciseSetModificationAsync.pending, (state) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteExerciseSetModificationAsync.fulfilled, (state, action: PayloadAction<UserExerciseSetModification[]>) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.FULFILLED;
                state.userExerciseSetModifications = action.payload;
            })
            .addCase(deleteExerciseSetModificationAsync.rejected, (state, action) => {
                state.userExerciseSetModificationsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete exercise set modification';
            })
            // Get User Nutrition Profile
            .addCase(getUserNutritionProfileAsync.pending, (state) => {
                state.userNutritionProfileState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserNutritionProfileAsync.fulfilled, (state, action: PayloadAction<UserNutritionProfile>) => {
                state.userNutritionProfileState = REQUEST_STATE.FULFILLED;
                state.userNutritionProfile = action.payload;
            })
            .addCase(getUserNutritionProfileAsync.rejected, (state, action) => {
                state.userNutritionProfileState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to get user nutrition profile';
            })

            // Update User Nutrition Profile
            .addCase(updateUserNutritionProfileAsync.pending, (state) => {
                state.userState = REQUEST_STATE.PENDING;
                state.userNutritionProfileState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateUserNutritionProfileAsync.fulfilled, (state, action) => {
                state.userState = REQUEST_STATE.FULFILLED;
                state.userNutritionProfileState = REQUEST_STATE.FULFILLED;
                state.user = action.payload.user;
                state.userNutritionProfile = action.payload.userNutritionProfile;
            })
            .addCase(updateUserNutritionProfileAsync.rejected, (state, action) => {
                state.userState = REQUEST_STATE.REJECTED;
                state.userNutritionProfileState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update user nutrition profile';
            })

            // Get User Nutrition Goal History
            .addCase(getUserNutritionGoalHistoryAsync.pending, (state) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserNutritionGoalHistoryAsync.fulfilled, (state, action: PayloadAction<UserNutritionGoal[]>) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.FULFILLED;
                state.userNutritionGoalHistory = action.payload;
            })
            .addCase(getUserNutritionGoalHistoryAsync.rejected, (state, action) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to get nutrition goal history';
            })

            // Create Nutrition Goal Entry
            .addCase(createNutritionGoalEntryAsync.pending, (state) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(createNutritionGoalEntryAsync.fulfilled, (state, action: PayloadAction<UserNutritionGoal[]>) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.FULFILLED;
                state.userNutritionGoalHistory = action.payload;
            })
            .addCase(createNutritionGoalEntryAsync.rejected, (state, action) => {
                state.userNutritionGoalHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to create nutrition goal entry';
            })

            // Get All Nutrition Logs
            .addCase(getAllNutritionLogsAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllNutritionLogsAsync.fulfilled, (state, action: PayloadAction<UserNutritionLog[]>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Convert array to date-indexed object
                const logsObj: { [date: string]: UserNutritionLog | null } = {};
                action.payload.forEach((log) => {
                    if (log?.DateString) {
                        logsObj[log.DateString] = log;
                    }
                });
                state.userNutritionLogs = { ...state.userNutritionLogs, ...logsObj };
            })
            .addCase(getAllNutritionLogsAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch all nutrition logs';
            })

            // Get Nutrition Logs with Filters
            .addCase(getNutritionLogsWithFiltersAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(
                getNutritionLogsWithFiltersAsync.fulfilled,
                (state, action: PayloadAction<{ nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any }>) => {
                    state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                    // Convert array to date-indexed object and merge with existing
                    const logsObj: { [date: string]: UserNutritionLog | null } = {};
                    action.payload.nutritionLogs.forEach((log) => {
                        if (log?.DateString) {
                            logsObj[log.DateString] = log;
                        }
                    });
                    state.userNutritionLogs = { ...state.userNutritionLogs, ...logsObj };
                },
            )
            .addCase(getNutritionLogsWithFiltersAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch filtered nutrition logs';
            })

            // Get Nutrition Logs for Multiple Dates
            .addCase(getNutritionLogsForDatesAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getNutritionLogsForDatesAsync.fulfilled, (state, action: PayloadAction<{ [date: string]: UserNutritionLog | null }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Merge the results with existing logs
                state.userNutritionLogs = { ...state.userNutritionLogs, ...action.payload };
            })
            .addCase(getNutritionLogsForDatesAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch nutrition logs for dates';
            })

            // Get Single Nutrition Log for Date
            .addCase(getNutritionLogForDateAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getNutritionLogForDateAsync.fulfilled, (state, action: PayloadAction<{ date: string; nutritionLog: UserNutritionLog | null }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                state.userNutritionLogs[action.payload.date] = action.payload.nutritionLog;
            })
            .addCase(getNutritionLogForDateAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch nutrition log for date';
            })

            // Load Nutrition Logs for Swipe Navigation
            .addCase(loadNutritionLogsForSwipeNavigationAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(loadNutritionLogsForSwipeNavigationAsync.fulfilled, (state, action: PayloadAction<{ [date: string]: UserNutritionLog | null }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Merge the results with existing logs
                state.userNutritionLogs = { ...state.userNutritionLogs, ...action.payload };
            })
            .addCase(loadNutritionLogsForSwipeNavigationAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to load nutrition logs for swipe navigation';
            })

            // Add Food Entry
            .addCase(addFoodEntryAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(addFoodEntryAsync.fulfilled, (state, action: PayloadAction<AddFoodEntryResponse & { date: string }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Update the specific date's nutrition log with the new entry
                state.userNutritionLogs[action.payload.date] = action.payload.nutritionLog;
            })
            .addCase(addFoodEntryAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to add food entry';
            })

            // Update Food Entry
            .addCase(updateFoodEntryAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(updateFoodEntryAsync.fulfilled, (state, action: PayloadAction<UpdateFoodEntryResponse & { date: string }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Update the specific date's nutrition log with the updated entry
                state.userNutritionLogs[action.payload.date] = action.payload.nutritionLog;
            })
            .addCase(updateFoodEntryAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to update food entry';
            })

            // Delete Food Entry
            .addCase(deleteFoodEntryAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteFoodEntryAsync.fulfilled, (state, action: PayloadAction<{ date: string; nutritionLog: UserNutritionLog }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Update the specific date's nutrition log after deletion
                state.userNutritionLogs[action.payload.date] = action.payload.nutritionLog;
            })
            .addCase(deleteFoodEntryAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete food entry';
            })

            // Delete Specific Day Log
            .addCase(deleteSpecificDayLogAsync.pending, (state) => {
                state.userNutritionLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteSpecificDayLogAsync.fulfilled, (state, action: PayloadAction<{ date: string }>) => {
                state.userNutritionLogsState = REQUEST_STATE.FULFILLED;
                // Remove the specific date's nutrition log from state
                delete state.userNutritionLogs[action.payload.date];
            })
            .addCase(deleteSpecificDayLogAsync.rejected, (state, action) => {
                state.userNutritionLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete day log';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
