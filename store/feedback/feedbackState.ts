// store/feedback/feedbackState.ts

import { REQUEST_STATE } from '@/constants/requestStates';

export interface FeedbackState {
    submitProgramFeedbackStatus: string;
    error: string | null;
}

export const initialState: FeedbackState = {
    submitProgramFeedbackStatus: REQUEST_STATE.IDLE,
    error: null,
};
