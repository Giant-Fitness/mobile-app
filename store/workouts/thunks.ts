// store/workouts/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import WorkoutService from '@/store/workouts/service';
import { Workout, WorkoutRecommendations } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getAllWorkoutsAsync = createAsyncThunk<Workout[], void>('workouts/getAllWorkouts', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    // If workouts are already loaded, return them
    if (state.workouts.allWorkoutsState === REQUEST_STATE.FULFILLED) {
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

export const getMultipleWorkoutsAsync = createAsyncThunk<Workout[], { workoutIds: string[] }, { state: RootState }>(
    'workouts/getMultipleWorkouts',
    async ({ workoutIds }, { getState, rejectWithValue }) => {
        const state = getState();

        const existingWorkouts = workoutIds.map((workoutId) => state.workouts.workouts[workoutId]).filter((workout) => workout !== undefined);
        if (existingWorkouts.length === workoutIds.length) {
            // If all workouts already exists, return them
            return existingWorkouts;
        }

        const missingWorkoutIds = workoutIds.filter((workoutId) => !state.workouts.workouts[workoutId]);
        try {
            const fetchedWorkouts = await WorkoutService.getWorkouts(missingWorkoutIds);
            if (!fetchedWorkouts || fetchedWorkouts.length === 0) {
                return rejectWithValue('Workouts not found.');
            }
            return [...existingWorkouts, ...fetchedWorkouts];
        } catch (error) {
            console.log(error);
            return rejectWithValue('Error fetching workouts.');
        }
    },
);

export const getSpotlightWorkoutsAsync = createAsyncThunk<WorkoutRecommendations, void>(
    'workouts/getSpotlightWorkouts',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        // If workouts are already loaded, return them
        if (state.workouts.spotlightWorkoutsState === REQUEST_STATE.FULFILLED) {
            return Object.values(state.workouts.spotlightWorkouts);
        }
        return await WorkoutService.getSpotlightWorkouts();
    },
);
