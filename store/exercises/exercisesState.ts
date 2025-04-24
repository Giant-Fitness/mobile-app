// store/exercises/exercisesState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Exercise } from '@/types';

export interface ExercisesState {
    exercises: Record<string, Exercise>;
    exercisesState: REQUEST_STATE;
    error: string | null;
}

export const initialState: ExercisesState = {
    exercises: {},
    exercisesState: REQUEST_STATE.IDLE,
    error: null,
};
