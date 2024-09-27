// store/workouts/workoutsState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Workout } from '@/types';

export interface WorkoutState {
    workouts: Record<string, Workout>;
    workoutStates: Record<string, REQUEST_STATE>;
    allWorkoutsState: REQUEST_STATE;
    error: string | null;
}

export const initialState: WorkoutState = {
    workouts: {},
    workoutStates: {},
    allWorkoutsState: REQUEST_STATE.IDLE,
    error: null,
};
