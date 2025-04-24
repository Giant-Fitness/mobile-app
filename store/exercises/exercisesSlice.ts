// store/exercises/exercisesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from '@/store/exercises/exercisesState';
import { fetchAllExercisesAsync, fetchExerciseByIdAsync } from '@/store/exercises/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Exercise } from '@/types';

const exercisesSlice = createSlice({
    name: 'exercises',
    initialState,
    reducers: {
        clearExercisesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Exercises
            .addCase(fetchAllExercisesAsync.pending, (state) => {
                state.exercisesState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(fetchAllExercisesAsync.fulfilled, (state, action: PayloadAction<Record<string, Exercise>>) => {
                state.exercisesState = REQUEST_STATE.FULFILLED;
                state.exercises = action.payload;
            })
            .addCase(fetchAllExercisesAsync.rejected, (state, action) => {
                state.exercisesState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch exercises';
            })

            // Fetch Single Exercise
            .addCase(fetchExerciseByIdAsync.fulfilled, (state, action: PayloadAction<Exercise>) => {
                // Add or update the exercise in the cache
                state.exercises[action.payload.ExerciseId] = action.payload;
            });
    },
});

export const { clearExercisesError } = exercisesSlice.actions;
export default exercisesSlice.reducer;
