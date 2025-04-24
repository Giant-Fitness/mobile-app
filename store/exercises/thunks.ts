// store/exercises/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import ExercisesService from '@/store/exercises/service';
import { Exercise } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

/**
 * Fetch all exercises
 */
export const fetchAllExercisesAsync = createAsyncThunk<
    Record<string, Exercise>,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('exercises/fetchAllExercises', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();

        // Return cached exercises if available and not forcing refresh
        if (Object.keys(state.exercises.exercises).length > 0 && state.exercises.exercisesState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.exercises.exercises;
        }
        return await ExercisesService.getAllExercises();
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
    { exerciseId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('exercises/fetchExerciseById', async ({ exerciseId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();

        // Return cached exercise if available
        if (state.exercises.exercises[exerciseId]) {
            return state.exercises.exercises[exerciseId];
        }

        return await ExercisesService.getExerciseById(exerciseId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : `Failed to fetch exercise ${exerciseId}`,
        });
    }
});
