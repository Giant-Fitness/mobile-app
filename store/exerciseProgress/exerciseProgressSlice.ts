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
import { generateExerciseLogId, isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { ExerciseLog } from '@/types/exerciseProgressTypes';

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
            // Initialize Tracked Lifts History (no changes needed here as it only deals with tracked lifts)
            .addCase(initializeTrackedLiftsHistoryAsync.pending, (state) => {
                state.liftHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(initializeTrackedLiftsHistoryAsync.fulfilled, (state, action) => {
                state.liftHistoryState = REQUEST_STATE.FULFILLED;
                // Convert arrays to objects keyed by exerciseLogId
                const normalizedHistory = Object.fromEntries(
                    Object.entries(action.payload.liftHistory).map(([exerciseId, logs]) => [
                        exerciseId,
                        Object.fromEntries((logs as ExerciseLog[]).map((log) => [log.ExerciseLogId, log])),
                    ]),
                );
                state.liftHistory = normalizedHistory;
            })
            .addCase(initializeTrackedLiftsHistoryAsync.rejected, (state, action) => {
                state.liftHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to initialize tracked lifts history';
            })
            // Fetch Recent History (will only contain non-tracked lifts now)
            .addCase(fetchExercisesRecentHistoryAsync.pending, (state) => {
                state.recentLogsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(fetchExercisesRecentHistoryAsync.fulfilled, (state, action) => {
                state.recentLogsState = REQUEST_STATE.FULFILLED;
                // Merge new logs with existing ones
                Object.entries(action.payload.recentLogs).forEach(([exerciseId, logs]) => {
                    if (!state.recentLogs[exerciseId]) {
                        state.recentLogs[exerciseId] = {};
                    }
                    // Ensure logs is treated as an object with ExerciseLogId keys
                    state.recentLogs[exerciseId] = {
                        ...state.recentLogs[exerciseId],
                        ...(logs as { [exerciseLogId: string]: ExerciseLog }),
                    };
                });
            })
            .addCase(fetchExercisesRecentHistoryAsync.rejected, (state, action) => {
                state.recentLogsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch recent exercise history';
            })

            // Save Exercise Progress
            .addCase(saveExerciseProgressAsync.fulfilled, (state, action) => {
                const exerciseLogId = generateExerciseLogId(action.payload.exerciseId, action.payload.date);
                const isTrackedLift = isLongTermTrackedLift(action.payload.exerciseId);

                if (isTrackedLift) {
                    if (!state.liftHistory[action.payload.exerciseId]) {
                        state.liftHistory[action.payload.exerciseId] = {};
                    }
                    state.liftHistory[action.payload.exerciseId][exerciseLogId] = action.payload.log;
                } else {
                    if (!state.recentLogs[action.payload.exerciseId]) {
                        state.recentLogs[action.payload.exerciseId] = {};
                    }
                    state.recentLogs[action.payload.exerciseId][exerciseLogId] = action.payload.log;
                }
            })

            // Delete Exercise Log
            .addCase(deleteExerciseLogAsync.fulfilled, (state, action) => {
                const exerciseLogId = generateExerciseLogId(action.payload.exerciseId, action.payload.date);
                const isTrackedLift = isLongTermTrackedLift(action.payload.exerciseId);

                if (isTrackedLift) {
                    if (state.liftHistory[action.payload.exerciseId]) {
                        delete state.liftHistory[action.payload.exerciseId][exerciseLogId];
                    }
                } else {
                    if (state.recentLogs[action.payload.exerciseId]) {
                        delete state.recentLogs[action.payload.exerciseId][exerciseLogId];
                    }
                }
            })
            .addCase(deleteExerciseLogAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete exercise log';
            });
    },
});

export const { clearExerciseProgress } = exerciseProgressSlice.actions;
export default exerciseProgressSlice.reducer;
