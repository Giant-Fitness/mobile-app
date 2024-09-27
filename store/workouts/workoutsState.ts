// store/workouts/workoutsState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Workout, WorkoutRecommendations } from '@/types';

export interface WorkoutState {
    workouts: Record<string, Workout>;
    workoutStates: Record<string, REQUEST_STATE>;
    allWorkoutsState: REQUEST_STATE;
    spotlightWorkouts: WorkoutRecommendations | null;
    spotlightWorkoutsState: REQUEST_STATE;
    error: string | null;
}

export const initialState: WorkoutState = {
    workouts: {},
    workoutStates: {},
    allWorkoutsState: REQUEST_STATE.IDLE,
    spotlightWorkouts: null,
    spotlightWorkoutsState: REQUEST_STATE.IDLE,
    error: null,
};
