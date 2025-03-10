// store/exerciseProgress/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import ExerciseProgressService from '@/store/exerciseProgress/service';
import { ExerciseSet } from '@/types/exerciseProgressTypes';
import { isLongTermTrackedLift, LONG_TERM_TRACKED_LIFT_IDS } from '@/store/exerciseProgress/utils';
import { REQUEST_STATE } from '@/constants/requestStates';

// Load only full history for tracked/compound lifts during initialization
export const initializeTrackedLiftsHistoryAsync = createAsyncThunk<any, { forceRefresh?: boolean } | void>(
    'exerciseProgress/initializeTrackedLifts',
    async (args = {}, { getState, rejectWithValue }) => {
        try {
            const { forceRefresh = false } = typeof args === 'object' ? args : {};
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;
            if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

            // Check if we already have history loaded and not forcing refresh
            if (
                !forceRefresh &&
                state.exerciseProgress.liftHistoryState === REQUEST_STATE.FULFILLED &&
                Object.keys(state.exerciseProgress.liftHistory).length > 0
            ) {
                return { liftHistory: state.exerciseProgress.liftHistory };
            }

            // Get full history for tracked lifts only
            const trackedLiftsHistoryPromises = Object.keys(LONG_TERM_TRACKED_LIFT_IDS).map((exerciseId) =>
                ExerciseProgressService.getExerciseHistory(userId, exerciseId, {}),
            );
            const trackedLiftsHistories = await Promise.all(trackedLiftsHistoryPromises);

            // Create mapping of exercise IDs to their full histories
            const liftHistory = Object.keys(LONG_TERM_TRACKED_LIFT_IDS).reduce(
                (acc, exerciseId, index) => ({
                    ...acc,
                    [exerciseId]: trackedLiftsHistories[index],
                }),
                {},
            );
            return { liftHistory };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to initialize tracked lifts history',
            });
        }
    },
);

// Fetch recent history for specific exercises (when viewing a program day)
export const fetchExercisesRecentHistoryAsync = createAsyncThunk(
    'exerciseProgress/fetchExercisesRecentHistory',
    async ({ exerciseIds, forceRefresh = false }: { exerciseIds: string[]; forceRefresh?: boolean }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;
            if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

            const exercisesToFetch = exerciseIds.filter((id) => !isLongTermTrackedLift(id));

            // Check which exercises need to be fetched
            const uncachedExercises = exercisesToFetch.filter((exerciseId) => {
                return (
                    forceRefresh || !state.exerciseProgress.recentLogs[exerciseId] || Object.keys(state.exerciseProgress.recentLogs[exerciseId]).length === 0
                );
            });

            // If we have all exercises cached and they're not stale and not forcing refresh
            if (uncachedExercises.length === 0 && state.exerciseProgress.recentLogsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
                return {
                    recentLogs: exercisesToFetch.reduce(
                        (acc, exerciseId) => ({
                            ...acc,
                            [exerciseId]: state.exerciseProgress.recentLogs[exerciseId] || {},
                        }),
                        {},
                    ),
                };
            }

            const recentHistoryPromises = uncachedExercises.map((exerciseId) => ExerciseProgressService.getExerciseHistory(userId, exerciseId, { limit: 10 }));
            const recentHistories = await Promise.all(recentHistoryPromises);

            // Transform the response to object structure
            const recentLogs = uncachedExercises.reduce((acc, exerciseId, index) => {
                const history = recentHistories[index];
                // Handle if history is array or object
                const logs = Array.isArray(history) ? history : Object.values(history);

                return {
                    ...acc,
                    [exerciseId]: logs.reduce(
                        (logAcc, log) => ({
                            ...logAcc,
                            [log.ExerciseLogId]: log,
                        }),
                        {},
                    ),
                };
            }, {});

            return { recentLogs };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to fetch recent exercise history',
            });
        }
    },
);

export const saveExerciseProgressAsync = createAsyncThunk(
    'exerciseProgress/saveProgress',
    async (
        {
            exerciseId,
            date,
            sets,
        }: {
            exerciseId: string;
            date: string;
            sets: ExerciseSet[];
        },
        { getState, rejectWithValue },
    ) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;
            if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

            const log = await ExerciseProgressService.saveExerciseProgress(userId, exerciseId, date, sets);

            return {
                exerciseId,
                date,
                log,
                isTrackedLift: isLongTermTrackedLift(exerciseId),
            };
        } catch (error: any) {
            // Pass the specific error message up
            return rejectWithValue({
                errorMessage: error.message || 'Failed to save exercise progress',
            });
        }
    },
);

export const deleteExerciseLogAsync = createAsyncThunk(
    'exerciseProgress/deleteLog',
    async (
        {
            exerciseId,
            date,
        }: {
            exerciseId: string;
            date: string;
        },
        { getState, rejectWithValue },
    ) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;
            if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

            await ExerciseProgressService.deleteExerciseLog(userId, exerciseId, date);

            return {
                exerciseId,
                date,
                isTrackedLift: isLongTermTrackedLift(exerciseId),
            };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise log',
            });
        }
    },
);
