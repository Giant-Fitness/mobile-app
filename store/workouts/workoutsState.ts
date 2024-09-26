// store/workouts/workoutsState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Workout } from '@/types';

export interface WorkoutState {
    workouts: Record<string, Workout>;
    workoutsState: Record<string, REQUEST_STATE>;
    allWorkoutsState: REQUEST_STATE;
    error: string | null;
}

export const initialState: WorkoutState = {
    workouts: {},
    workoutsState: {},
    allWorkoutsState: REQUEST_STATE.IDLE,
    error: null,
};
