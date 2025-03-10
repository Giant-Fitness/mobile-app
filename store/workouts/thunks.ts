// store/workouts/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import WorkoutService from '@/store/workouts/service';
import { Workout, WorkoutRecommendations } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getAllWorkoutsAsync = createAsyncThunk<Workout[], { forceRefresh?: boolean } | void>(
    'workouts/getAllWorkouts',
    async (args = {}, { getState }) => {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        // If workouts are already loaded and not forcing refresh, return them
        if (state.workouts.allWorkoutsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return Object.values(state.workouts.workouts);
        }

        return await WorkoutService.getAllWorkouts();
    },
);

export const getWorkoutAsync = createAsyncThunk<Workout | undefined, { workoutId: string; forceRefresh?: boolean }, { state: RootState }>(
    'workouts/getWorkout',
    async ({ workoutId, forceRefresh = false }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingWorkout = state.workouts.workouts[workoutId];

        // Skip cache if forceRefresh is true
        if (existingWorkout && !forceRefresh) {
            // If already exists and not forcing refresh, return it
            return existingWorkout;
        }

        const workout = await WorkoutService.getWorkout(workoutId);
        if (!workout) {
            return rejectWithValue('Workout not found.');
        }
        return workout;
    },
);

export const getMultipleWorkoutsAsync = createAsyncThunk<Workout[], { workoutIds: string[]; forceRefresh?: boolean }, { state: RootState }>(
    'workouts/getMultipleWorkouts',
    async ({ workoutIds, forceRefresh = false }, { getState, rejectWithValue }) => {
        const state = getState();

        // If not forcing refresh, use cached workouts when available
        if (!forceRefresh) {
            const existingWorkouts = workoutIds.map((workoutId) => state.workouts.workouts[workoutId]).filter((workout) => workout !== undefined);

            if (existingWorkouts.length === workoutIds.length) {
                // If all workouts already exist, return them
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
        } else {
            // Force refresh - fetch all requested workouts regardless of cache
            try {
                const fetchedWorkouts = await WorkoutService.getWorkouts(workoutIds);
                if (!fetchedWorkouts || fetchedWorkouts.length === 0) {
                    return rejectWithValue('Workouts not found.');
                }
                return fetchedWorkouts;
            } catch (error) {
                console.log(error);
                return rejectWithValue('Error fetching workouts.');
            }
        }
    },
);

export const getSpotlightWorkoutsAsync = createAsyncThunk<WorkoutRecommendations, { forceRefresh?: boolean } | void>(
    'workouts/getSpotlightWorkouts',
    async (args = {}, { getState }) => {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        // If workout recommendations are already loaded and not forcing refresh, return them
        if (state.workouts.spotlightWorkoutsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.workouts.spotlightWorkouts;
        }

        return await WorkoutService.getSpotlightWorkouts();
    },
);
