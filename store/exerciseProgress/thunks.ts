// store/exerciseProgress/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import ExerciseProgressService from '@/store/exerciseProgress/service';
import { ExerciseSet } from '@/types/exerciseProgressTypes';
import { isLongTermTrackedLift, LONG_TERM_TRACKED_LIFT_IDS } from '@/store/exerciseProgress/utils';
import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService, CacheTTL } from '@/utils/cache';

// Load only full history for tracked/compound lifts during initialization
export const initializeTrackedLiftsHistoryAsync = createAsyncThunk<any, { forceRefresh?: boolean; useCache?: boolean } | void>(
    'exerciseProgress/initializeTrackedLifts',
    async (args = {}, { getState, rejectWithValue }) => {
        try {
            const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
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

            // Try cache first if enabled and not forcing refresh
            if (useCache && !forceRefresh) {
                const cacheKey = `tracked_lifts_history`;
                const cached = await cacheService.get<any>(cacheKey);
                const isExpired = await cacheService.isExpired(cacheKey);

                if (cached && !isExpired) {
                    console.log('Loaded tracked lifts history from cache');
                    return { liftHistory: cached };
                }
            }

            // Load from API
            console.log('Loading tracked lifts history from API');
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

            // Cache the result if useCache is enabled
            if (useCache) {
                const cacheKey = `tracked_lifts_history`;
                await cacheService.set(cacheKey, liftHistory, CacheTTL.LONG);
            }

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
    async (
        {
            exerciseIds,
            forceRefresh = false,
            useCache = true,
        }: {
            exerciseIds: string[];
            forceRefresh?: boolean;
            useCache?: boolean;
        },
        { getState, rejectWithValue },
    ) => {
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

            // Check cache for missing exercises
            const cachedExercises: string[] = [];
            const apiExercises: string[] = [];
            let cachedRecentLogs: any = {};

            if (useCache && !forceRefresh) {
                for (const exerciseId of uncachedExercises) {
                    const cacheKey = `recent_logs_${exerciseId}`;
                    const cached = await cacheService.get<any>(cacheKey);
                    const isExpired = await cacheService.isExpired(cacheKey);

                    if (cached && !isExpired) {
                        cachedRecentLogs[exerciseId] = cached;
                        cachedExercises.push(exerciseId);
                        console.log(`Loaded recent logs for ${exerciseId} from cache`);
                    } else {
                        apiExercises.push(exerciseId);
                    }
                }
            } else {
                apiExercises.push(...uncachedExercises);
            }

            // Fetch uncached exercises from API
            let apiRecentLogs: any = {};
            if (apiExercises.length > 0) {
                console.log(`Loading recent logs from API for: ${apiExercises.join(', ')}`);
                const recentHistoryPromises = apiExercises.map((exerciseId) => ExerciseProgressService.getExerciseHistory(userId, exerciseId, { limit: 10 }));
                const recentHistories = await Promise.all(recentHistoryPromises);

                // Transform the response to object structure
                apiRecentLogs = apiExercises.reduce((acc, exerciseId, index) => {
                    const history = recentHistories[index];
                    // Handle if history is array or object
                    const logs = Array.isArray(history) ? history : Object.values(history);

                    const exerciseLogs = logs.reduce(
                        (logAcc, log) => ({
                            ...logAcc,
                            [log.ExerciseLogId]: log,
                        }),
                        {},
                    );

                    // Cache the result if useCache is enabled
                    if (useCache) {
                        const cacheKey = `recent_logs_${exerciseId}`;
                        cacheService.set(cacheKey, exerciseLogs, CacheTTL.LONG);
                    }

                    return {
                        ...acc,
                        [exerciseId]: exerciseLogs,
                    };
                }, {});
            }

            // Combine cached and API results
            const recentLogs = { ...cachedRecentLogs, ...apiRecentLogs };

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

            // Validate sets before sending to backend
            if (!sets || sets.length === 0) {
                return rejectWithValue({ errorMessage: 'At least one set is required' });
            }

            // Basic validation for sets
            for (let i = 0; i < sets.length; i++) {
                const set = sets[i];

                // At least one of Reps or Time must be provided
                if ((set.Reps === undefined || set.Reps === null) && (set.Time === undefined || set.Time === null)) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Either reps or time must be provided` });
                }

                // If Reps is provided, it must be > 0
                if (set.Reps !== undefined && set.Reps !== null && set.Reps <= 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Reps must be greater than 0` });
                }

                // If Time is provided, it must be > 0
                if (set.Time !== undefined && set.Time !== null && set.Time <= 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Time must be greater than 0 seconds` });
                }

                // If Weight is provided, it must be >= 0
                if (set.Weight !== undefined && set.Weight !== null && set.Weight < 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Weight must be greater than or equal to 0` });
                }
            }

            const log = await ExerciseProgressService.saveExerciseProgress(userId, exerciseId, date, sets);

            // Invalidate relevant caches after saving
            const isTracked = isLongTermTrackedLift(exerciseId);

            // Clear cache for this exercise's recent logs
            const recentLogsCacheKey = `recent_logs_${exerciseId}`;
            await cacheService.remove(recentLogsCacheKey);

            // If it's a tracked lift, also clear the tracked lifts history cache
            if (isTracked) {
                const trackedHistoryCacheKey = `tracked_lifts_history`;
                await cacheService.remove(trackedHistoryCacheKey);
            }

            return {
                exerciseId,
                date,
                log,
                isTrackedLift: isTracked,
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

            // Invalidate relevant caches after deletion
            const isTracked = isLongTermTrackedLift(exerciseId);

            // Clear cache for this exercise's recent logs
            const recentLogsCacheKey = `recent_logs_${exerciseId}`;
            await cacheService.remove(recentLogsCacheKey);

            // If it's a tracked lift, also clear the tracked lifts history cache
            if (isTracked) {
                const trackedHistoryCacheKey = `tracked_lifts_history`;
                await cacheService.remove(trackedHistoryCacheKey);
            }

            return {
                exerciseId,
                date,
                isTrackedLift: isTracked,
            };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise log',
            });
        }
    },
);
