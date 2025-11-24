// store/exerciseProgress/exerciseProgressState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { ExerciseLog } from '@/types/exerciseProgressTypes';

export interface ExerciseProgressState {
    // UNIFIED: All exercise history in one place (replaces recentLogs + liftHistory)
    allHistory: {
        [exerciseId: string]: {
            [exerciseLogId: string]: ExerciseLog; // exerciseId#YYYY-MM-DD
        };
    };
    allHistoryState: REQUEST_STATE;

    // Loading states for specific operations
    saveState: REQUEST_STATE;
    deleteState: REQUEST_STATE;

    // Error handling
    error: string | null;
}

export const initialState: ExerciseProgressState = {
    allHistory: {},
    allHistoryState: REQUEST_STATE.IDLE,
    saveState: REQUEST_STATE.IDLE,
    deleteState: REQUEST_STATE.IDLE,
    error: null,
};
