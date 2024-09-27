// store/workouts/workoutsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, initialState } from '@/store/workouts/workoutsState';
import { getAllWorkoutsAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Workout } from '@/types';

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
            .addCase(getAllWorkoutsAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.allWorkoutsState = REQUEST_STATE.FULFILLED;
                action.payload.forEach((workout) => {
                    state.workouts[workout.WorkoutId] = workout;
                    state.workoutStates[workout.WorkoutId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getAllWorkoutsAsync.rejected, (state, action) => {
                state.allWorkoutsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch all workouts';
            });
    },
});

export const { clearError } = workoutSlice.actions;
export default workoutSlice.reducer;
