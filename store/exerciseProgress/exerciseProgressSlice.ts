// store/exerciseProgress/exerciseProgressSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { REQUEST_STATE } from '@/constants/requestStates';
import { initialState } from './exerciseProgressState';
import {
    initializeTrackedLiftsHistoryAsync,
    saveExerciseProgressAsync,
    deleteExerciseLogAsync,
    fetchExercisesRecentHistoryAsync,
} from '@/store/exerciseProgress/thunks';
import { generateExerciseLogId } from '@/store/exerciseProgress/utils';

const exerciseProgressSlice = createSlice({
    name: 'exerciseProgress',
    initialState,
    reducers: {
        clearExerciseProgress: (state) => {
            state.recentLogs = {};
            state.liftHistory = {};
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize Tracked Lifts History
            .addCase(initializeTrackedLiftsHistoryAsync.pending, (state) => {
                state.liftHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(initializeTrackedLiftsHistoryAsync.fulfilled, (state, action) => {
                state.liftHistoryState = REQUEST_STATE.FULFILLED;
                state.liftHistory = action.payload.liftHistory;
            })
            .addCase(initializeTrackedLiftsHistoryAsync.rejected, (state, action) => {
                state.liftHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to initialize tracked lifts history';
            })

            // Fetch Recent History for Specific Exercises
            .addCase(fetchExercisesRecentHistoryAsync.pending, (state) => {
                state.recentLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(fetchExercisesRecentHistoryAsync.fulfilled, (state, action) => {
                state.recentLogsState = REQUEST_STATE.FULFILLED;
                // Merge new recent logs with existing ones
                state.recentLogs = {
                    ...state.recentLogs,
                    ...action.payload.recentLogs,
                };
            })
            .addCase(fetchExercisesRecentHistoryAsync.rejected, (state, action) => {
                state.recentLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch recent exercise history';
            })

            // Save Exercise Progress
            .addCase(saveExerciseProgressAsync.fulfilled, (state, action) => {
                const exerciseLogId = generateExerciseLogId(action.payload.exerciseId, action.payload.date);

                if (action.payload.isTrackedLift) {
                    // Update lift history for tracked lifts
                    if (!state.liftHistory[action.payload.exerciseId]) {
                        state.liftHistory[action.payload.exerciseId] = {};
                    }
                    state.liftHistory[action.payload.exerciseId][exerciseLogId] = action.payload.log;
                }

                // Update recent logs for all exercises
                state.recentLogs[exerciseLogId] = action.payload.log;
            })
            .addCase(saveExerciseProgressAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to save exercise progress';
            })

            // Delete Exercise Log
            .addCase(deleteExerciseLogAsync.fulfilled, (state, action) => {
                const exerciseLogId = generateExerciseLogId(action.payload.exerciseId, action.payload.date);

                // Remove from recent logs
                delete state.recentLogs[exerciseLogId];

                // Remove from lift history if it's a tracked lift
                if (action.payload.isTrackedLift && state.liftHistory[action.payload.exerciseId]) {
                    delete state.liftHistory[action.payload.exerciseId][exerciseLogId];
                }
            })
            .addCase(deleteExerciseLogAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete exercise log';
            });
    },
});

export const { clearExerciseProgress } = exerciseProgressSlice.actions;
export default exerciseProgressSlice.reducer;
