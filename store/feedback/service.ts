// store/feedback/service.ts

import { authApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';

// Define proper types for feedback payload
interface ProgramFeedback {
    TerminationReason?: string;
    reasonDetails?: string;
    DifficultyRating?: number;
    Improvements?: string[];
    additionalFeedback?: string;
    WouldRecommend?: boolean;
    AchievedGoals?: boolean;
    OverallRating: number;
    FavoriteAspects?: string[];
}

interface ProgramFeedbackPayload extends ProgramFeedback {
    UserId: string;
    ProgramId: string;
    FeedbackType: string;
}

const sendProgramFeedback = async (userId: string, programId: string, feedback: ProgramFeedback, feedbackType: string): Promise<void> => {
    console.log('service: sendProgramFeedback');
    try {
        const payload: ProgramFeedbackPayload = {
            UserId: userId,
            ProgramId: programId,
            FeedbackType: feedbackType,
            ...feedback,
        };

        await authApiClient.post('/feedback/programs', payload);
    } catch (error) {
        throw handleApiError(error, 'SendProgramFeedback');
    }
};

export default {
    sendProgramFeedback,
};

// Re-export types for use in components
export type { ProgramFeedback, ProgramFeedbackPayload };
