// store/user/service.ts

import { ProgramAbandonData } from '@/types';
import axios from 'axios';

const API_BASE_URL = 'https://r5oibllip9.execute-api.ap-south-1.amazonaws.com/prod';

const sendProgramFeedback = async (userId: string, programId: string, feedback: ProgramAbandonData, feedbackType: string): Promise<void> => {
    console.log('service: sendProgramFeedback');
    try {
        const payload = {
            UserId: userId,
            ProgramId: programId,
            TerminationReason: feedback.TerminationReason,
            ReasonDetails: feedback.reasonDetails,
            DifficultyRating: feedback.DifficultyRating,
            Improvements: feedback.Improvements,
            AdditionalFeedback: feedback.additionalFeedback,
            FeedbackType: feedbackType,
        };
        await axios.post(`${API_BASE_URL}/feedback/programs`, payload, {
            timeout: 10000, // 10 seconds timeout
            timeoutErrorMessage: 'Request timed out after 10 seconds',
        });
        return;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timed out:', error.message);
            } else {
                console.error('Axios error:', error.message);
                console.error('Response:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No response');
            }
        } else {
            console.error('Unknown error:', error);
        }
        throw error;
    }
};

export default {
    sendProgramFeedback,
};
