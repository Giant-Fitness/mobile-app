// store/exerciseProgress/exerciseProgressState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { ExerciseLog } from '@/types/exerciseProgressTypes';

export interface ExerciseProgressState {
    // Regular exercise logs (last 10-15 logs per exercise)
    recentLogs: {
        [exerciseId: string]: {
            [exerciseLogId: string]: ExerciseLog; // exerciseId#YYYY-MM-DD
        };
    };
    recentLogsState: REQUEST_STATE;
    // Complete history for major compound lifts
    liftHistory: {
        [exerciseId: string]: {
            [exerciseLogId: string]: ExerciseLog; // exerciseId#YYYY-MM-DD
        };
    };
    liftHistoryState: REQUEST_STATE;
    error: string | null;
}

export const initialState: ExerciseProgressState = {
    recentLogs: {},
    recentLogsState: REQUEST_STATE.IDLE,
    liftHistory: {},
    liftHistoryState: REQUEST_STATE.IDLE,
    error: null,
};
