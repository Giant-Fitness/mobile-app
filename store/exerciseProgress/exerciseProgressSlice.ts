// store/exerciseProgress/exerciseProgressSlice.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { deleteExerciseLogAsync, fetchExercisesHistoryAsync, getAllExerciseHistoryAsync, saveExerciseProgressAsync } from '@/store/exerciseProgress/thunks';
import { ExerciseLog } from '@/types/exerciseProgressTypes';

import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './exerciseProgressState';

const exerciseProgressSlice = createSlice({
    name: 'exerciseProgress',
    initialState,
    reducers: {
        clearExerciseProgress: (state) => {
            state.allHistory = {};
            state.error = null;
        },
        clearExerciseProgressError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ================================================================
            // Get ALL Exercise History
            // ================================================================
            .addCase(getAllExerciseHistoryAsync.pending, (state) => {
                state.allHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllExerciseHistoryAsync.fulfilled, (state, action) => {
                state.allHistoryState = REQUEST_STATE.FULFILLED;
                state.allHistory = action.payload.allHistory;
            })
            .addCase(getAllExerciseHistoryAsync.rejected, (state, action) => {
                state.allHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to get exercise history';
            })

            // ================================================================
            // Fetch Exercises History (Load specific exercises)
            // ================================================================
            .addCase(fetchExercisesHistoryAsync.pending, (state) => {
                state.allHistoryState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(fetchExercisesHistoryAsync.fulfilled, (state, action) => {
                state.allHistoryState = REQUEST_STATE.FULFILLED;

                // Merge new history with existing (for program day loads)
                Object.entries(action.payload.exerciseHistory).forEach(([exerciseId, logs]) => {
                    if (!state.allHistory[exerciseId]) {
                        state.allHistory[exerciseId] = {};
                    }
                    // Merge logs for this exercise
                    state.allHistory[exerciseId] = {
                        ...state.allHistory[exerciseId],
                        ...(logs as Record<string, ExerciseLog>),
                    };
                });
            })
            .addCase(fetchExercisesHistoryAsync.rejected, (state, action) => {
                state.allHistoryState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch exercise history';
            })

            // ================================================================
            // Save Exercise Progress (Optimistic Update)
            // ================================================================
            .addCase(saveExerciseProgressAsync.pending, (state) => {
                state.saveState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(saveExerciseProgressAsync.fulfilled, (state, action) => {
                state.saveState = REQUEST_STATE.FULFILLED;

                const { exerciseId, log } = action.payload;
                const exerciseLogId = log.ExerciseLogId;

                // Update unified history - SIMPLE!
                if (!state.allHistory[exerciseId]) {
                    state.allHistory[exerciseId] = {};
                }
                state.allHistory[exerciseId][exerciseLogId] = log;
            })
            .addCase(saveExerciseProgressAsync.rejected, (state, action) => {
                state.saveState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to save exercise progress';
            })

            // ================================================================
            // Delete Exercise Log (Optimistic Delete)
            // ================================================================
            .addCase(deleteExerciseLogAsync.pending, (state) => {
                state.deleteState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(deleteExerciseLogAsync.fulfilled, (state, action) => {
                state.deleteState = REQUEST_STATE.FULFILLED;

                const { exerciseId, date } = action.payload;
                const exerciseLogId = `${exerciseId}#${date}`;

                // Remove from unified history - SIMPLE!
                if (state.allHistory[exerciseId]) {
                    delete state.allHistory[exerciseId][exerciseLogId];
                }
            })
            .addCase(deleteExerciseLogAsync.rejected, (state, action) => {
                state.deleteState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to delete exercise log';
            });
    },
});

export const { clearExerciseProgress, clearExerciseProgressError } = exerciseProgressSlice.actions;
export default exerciseProgressSlice.reducer;
