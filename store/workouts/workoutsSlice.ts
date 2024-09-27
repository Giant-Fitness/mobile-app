// store/workouts/workoutsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, initialState } from '@/store/workouts/workoutsState';
import { getAllWorkoutsAsync, getMultipleWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Workout, WorkoutRecommendations } from '@/types';

const workoutSlice = createSlice({
    name: 'workouts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // All Workouts
            .addCase(getAllWorkoutsAsync.pending, (state) => {
                state.allWorkoutsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllWorkoutsAsync.fulfilled, (state, action: PayloadAction<Workout[]>) => {
                state.allWorkoutsState = REQUEST_STATE.FULFILLED;
                action.payload.forEach((workout) => {
                    state.workouts[workout.WorkoutId] = workout;
                    state.workoutStates[workout.WorkoutId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getAllWorkoutsAsync.rejected, (state, action) => {
                state.allWorkoutsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch all workouts';
            })

            // Multiple Workouts
            .addCase(getMultipleWorkoutsAsync.pending, (state, action) => {
                const { workoutIds } = action.meta.arg;
                workoutIds.forEach((workoutId) => {
                    state.workoutStates[workoutId] = REQUEST_STATE.PENDING;
                });
                state.error = null;
            })
            .addCase(getMultipleWorkoutsAsync.fulfilled, (state, action: PayloadAction<Workout[]>) => {
                action.payload.forEach((workout) => {
                    state.workouts[workout.WorkoutId] = workout;
                    state.workoutStates[workout.WorkoutId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getMultipleWorkoutsAsync.rejected, (state, action) => {
                const { workoutIds } = action.meta.arg;
                workoutIds.forEach((workoutId) => {
                    state.workoutStates[workoutId] = REQUEST_STATE.REJECTED;
                });
                state.error = action.error.message || 'Failed to fetch multiple workouts';
            })

            // All Workouts
            .addCase(getSpotlightWorkoutsAsync.pending, (state) => {
                state.spotlightWorkoutsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getSpotlightWorkoutsAsync.fulfilled, (state, action: PayloadAction<WorkoutRecommendations>) => {
                state.spotlightWorkoutsState = REQUEST_STATE.FULFILLED;
                state.spotlightWorkouts = action.payload;
            })
            .addCase(getSpotlightWorkoutsAsync.rejected, (state, action) => {
                state.spotlightWorkoutsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch all workouts';
            });
    },
});

export const { clearError } = workoutSlice.actions;
export default workoutSlice.reducer;
