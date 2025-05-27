// store/exercises/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import ExercisesService from '@/store/exercises/service';
import { Exercise } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService, CacheTTL } from '@/utils/cache';

/**
 * Fetch all exercises
 */
export const fetchAllExercisesAsync = createAsyncThunk<
    Record<string, Exercise>,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('exercises/fetchAllExercises', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();

        // Return cached exercises if available and not forcing refresh
        if (Object.keys(state.exercises.exercises).length > 0 && state.exercises.exercisesState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.exercises.exercises;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<Record<string, Exercise>>('all_exercises');
            const isExpired = await cacheService.isExpired('all_exercises');

            if (cached && !isExpired) {
                console.log('Loaded exercises from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading exercises from API');
        const exercises = await ExercisesService.getAllExercises();

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('all_exercises', exercises, CacheTTL.VERY_LONG);
        }

        return exercises;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercises',
        });
    }
});

/**
 * Fetch a specific exercise by ID
 */
export const fetchExerciseByIdAsync = createAsyncThunk<
    Exercise,
    { exerciseId: string; useCache?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('exercises/fetchExerciseById', async ({ exerciseId, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();

        // Return cached exercise if available
        if (state.exercises.exercises[exerciseId]) {
            return state.exercises.exercises[exerciseId];
        }

        // Try cache first if enabled
        if (useCache) {
            const cacheKey = `exercise_${exerciseId}`;
            const cached = await cacheService.get<Exercise>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log(`Loaded exercise ${exerciseId} from cache`);
                return cached;
            }
        }

        // Load from API
        console.log(`Loading exercise ${exerciseId} from API`);
        const exercise = await ExercisesService.getExerciseById(exerciseId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `exercise_${exerciseId}`;
            await cacheService.set(cacheKey, exercise, CacheTTL.VERY_LONG);
        }

        return exercise;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : `Failed to fetch exercise ${exerciseId}`,
        });
    }
});
