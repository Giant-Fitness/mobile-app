// store/exerciseProgress/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import ExerciseProgressService from '@/store/exerciseProgress/service';
import { ExerciseSet } from '@/types/exerciseProgressTypes';
import { isLongTermTrackedLift, LONG_TERM_TRACKED_LIFT_IDS } from '@/store/exerciseProgress/utils';

// Load only full history for tracked/compound lifts during initialization
export const initializeTrackedLiftsHistoryAsync = createAsyncThunk('exerciseProgress/initializeTrackedLifts', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;
        if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

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
});

// Fetch recent history for specific exercises (when viewing a program day)
export const fetchExercisesRecentHistoryAsync = createAsyncThunk(
    'exerciseProgress/fetchExercisesRecentHistory',
    async (exerciseIds: string[], { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.UserId;
            if (!userId) return rejectWithValue({ errorMessage: 'User ID not available' });

            // Filter out tracked lifts as we already have their history
            const exercisesToFetch = exerciseIds.filter((id) => !isLongTermTrackedLift(id));

            // Get recent history (last 10 logs) for each exercise
            const recentHistoryPromises = exercisesToFetch.map((exerciseId) => ExerciseProgressService.getExerciseHistory(userId, exerciseId, { limit: 10 }));
            const recentHistories = await Promise.all(recentHistoryPromises);

            // Create mapping of exercise IDs to their recent histories
            const recentLogs = exercisesToFetch.reduce(
                (acc, exerciseId, index) => ({
                    ...acc,
                    ...recentHistories[index],
                }),
                {},
            );

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
        } catch (error) {
            return rejectWithValue({
                errorMessage: error instanceof Error ? error.message : 'Failed to save exercise progress',
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
