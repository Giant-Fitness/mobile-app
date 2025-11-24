// store/exerciseProgress/thunks.ts

import { exerciseHistoryOfflineService } from '@/lib/storage/exercise-history/ExerciseHistoryOfflineService';
import { networkStateManager } from '@/lib/sync/NetworkStateManager';
import ExerciseProgressService from '@/store/exerciseProgress/service';
import { RootState } from '@/store/store';
import { ExerciseLog, ExerciseSet } from '@/types/exerciseProgressTypes';

import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Get ALL exercise history for the user
 * - Loads from SQLite immediately (offline-first)
 * - Background syncs from server if forceRefresh=true or SQLite is empty
 */
export const getAllExerciseHistoryAsync = createAsyncThunk<
    any,
    {
        forceRefresh?: boolean;
    } | void
>('exerciseProgress/getAllHistory', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        console.log('Loading exercise history from SQLite...');

        // ================================================================
        // Load from SQLite immediately (offline-first)
        // ================================================================
        const allRecords = await exerciseHistoryOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        // Transform to Redux structure
        const allHistory: Record<string, Record<string, ExerciseLog>> = {};

        for (const record of allRecords) {
            const exerciseId = record.data.ExerciseId;
            const exerciseLogId = record.data.ExerciseLogId;

            if (!allHistory[exerciseId]) {
                allHistory[exerciseId] = {};
            }

            allHistory[exerciseId][exerciseLogId] = record.data;
        }

        const hasLocalData = allRecords.length > 0;
        console.log(`Loaded ${allRecords.length} exercise logs from SQLite`);

        // ================================================================
        // Background sync from server (if needed)
        // ================================================================
        const shouldSyncFromServer = forceRefresh || !hasLocalData;

        if (shouldSyncFromServer && networkStateManager.isOnline()) {
            console.log('Background syncing from server...');

            // Background sync - don't await
            setTimeout(async () => {
                try {
                    // Fetch last year of logs
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                    const serverLogs = await ExerciseProgressService.getAllExerciseLogs(userId, {
                        startDate: oneYearAgo.toISOString().split('T')[0],
                        limit: 1000,
                    });

                    if (serverLogs.length > 0) {
                        await exerciseHistoryOfflineService.mergeServerData(userId, serverLogs);
                        console.log(`Background sync: merged ${serverLogs.length} logs`);
                    }
                } catch (error) {
                    console.warn('Background sync failed:', error);
                }
            }, 100);
        }

        return { allHistory };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to get exercise history',
        });
    }
});

/**
 * Get history for specific exercises (used when viewing a program day)
 * Loads from SQLite immediately, background syncs if needed
 */
export const fetchExercisesHistoryAsync = createAsyncThunk(
    'exerciseProgress/fetchExercisesHistory',
    async (
        {
            exerciseIds,
            limit = 10,
            forceRefresh = false,
        }: {
            exerciseIds: string[];
            limit?: number;
            forceRefresh?: boolean;
        },
        { getState, rejectWithValue },
    ) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;

            if (!userId) {
                return rejectWithValue({ errorMessage: 'User ID not available' });
            }

            console.log(`Loading history for ${exerciseIds.length} exercises from SQLite...`);

            // Load from SQLite (offline-first)
            const historyByExercise = await exerciseHistoryOfflineService.getHistoryForExercises(userId, exerciseIds, limit);

            // Transform to Redux structure
            const exerciseHistory: Record<string, Record<string, ExerciseLog>> = {};

            for (const [exerciseId, records] of Object.entries(historyByExercise)) {
                exerciseHistory[exerciseId] = {};
                for (const record of records) {
                    exerciseHistory[exerciseId][record.ExerciseLogId] = record;
                }
            }

            // Background sync if requested
            if (forceRefresh && networkStateManager.isOnline()) {
                setTimeout(async () => {
                    try {
                        for (const exerciseId of exerciseIds) {
                            const serverHistory = await ExerciseProgressService.getExerciseHistory(userId, exerciseId, { limit });

                            if (serverHistory.length > 0) {
                                await exerciseHistoryOfflineService.mergeServerData(userId, serverHistory);
                            }
                        }
                        console.log('Background sync completed for exercises');
                    } catch (error) {
                        console.warn('Background sync failed:', error);
                    }
                }, 100);
            }

            return { exerciseHistory };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise history',
            });
        }
    },
);

/**
 * Save exercise progress - Optimistic update to SQLite
 * Syncs to server in background via SyncQueueManager
 */
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

            if (!userId) {
                return rejectWithValue({ errorMessage: 'User ID not available' });
            }

            // Validate sets
            if (!sets || sets.length === 0) {
                return rejectWithValue({ errorMessage: 'At least one set is required' });
            }

            for (let i = 0; i < sets.length; i++) {
                const set = sets[i];

                if ((set.Reps === undefined || set.Reps === null) && (set.Time === undefined || set.Time === null)) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Either reps or time must be provided` });
                }

                if (set.Reps !== undefined && set.Reps !== null && set.Reps <= 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Reps must be greater than 0` });
                }

                if (set.Time !== undefined && set.Time !== null && set.Time <= 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Time must be greater than 0 seconds` });
                }

                if (set.Weight !== undefined && set.Weight !== null && set.Weight < 0) {
                    return rejectWithValue({ errorMessage: `Set ${i + 1}: Weight must be greater than or equal to 0` });
                }
            }

            console.log(`Saving exercise progress to SQLite: ${exerciseId} on ${date}`);

            // Check if log already exists
            const existingLog = await exerciseHistoryOfflineService.getExerciseLog(userId, exerciseId, date);

            let localId: string;

            if (existingLog) {
                // Update existing log
                localId = existingLog.localId;
                await exerciseHistoryOfflineService.update(localId, { sets });
                console.log(`Updated existing exercise log: ${localId}`);
            } else {
                // Create new log
                localId = await exerciseHistoryOfflineService.create({
                    userId,
                    data: { exerciseId, date, sets },
                    timestamp: date,
                });
                console.log(`Created new exercise log: ${localId}`);
            }

            // Get the updated/created log
            const updatedLog = await exerciseHistoryOfflineService.getById(localId);

            if (!updatedLog) {
                throw new Error('Failed to retrieve saved exercise log');
            }

            // SyncQueueManager will automatically sync to server in background
            console.log('Exercise progress saved locally, will sync to server in background');

            return {
                exerciseId,
                date,
                log: updatedLog.data,
            };
        } catch (error: any) {
            return rejectWithValue({
                errorMessage: error.message || 'Failed to save exercise progress',
            });
        }
    },
);

/**
 * Delete exercise log - Optimistic delete from SQLite
 * Syncs deletion to server in background via SyncQueueManager
 */
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

            if (!userId) {
                return rejectWithValue({ errorMessage: 'User ID not available' });
            }

            console.log(`Deleting exercise log from SQLite: ${exerciseId} on ${date}`);

            // Delete from SQLite (optimistic)
            await exerciseHistoryOfflineService.deleteExerciseLog(userId, exerciseId, date);

            // SyncQueueManager will automatically sync deletion to server in background
            console.log('Exercise log deleted locally, will sync to server in background');

            return {
                exerciseId,
                date,
            };
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise log',
            });
        }
    },
);
