// store/workouts/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import WorkoutService from '@/store/workouts/service';
import { Workout } from '@/types';
import { RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getAllWorkoutsAsync = createAsyncThunk<Workout[], void>('workouts/getAllWorkouts', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    // If workouts are already loaded, return them
    if (state.workouts.allProgramsState === REQUEST_STATE.FULFILLED) {
        return Object.values(state.workouts.workouts);
    }
    return await WorkoutService.getAllWorkouts();
});

export const getWorkoutAsync = createAsyncThunk<Workout | undefined, { workoutId: string }, { state: RootState }>(
    'workouts/getWorkout',
    async ({ workoutId }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingWorkout = state.workouts.workouts[workoutId];
        if (existingWorkout) {
            // If already exists, return it
            return existingWorkout;
        }

        const workout = await WorkoutService.getWorkout(workoutId);
        if (!workout) {
            return rejectWithValue('Workout not found.');
        }
        return workout;
    },
);
