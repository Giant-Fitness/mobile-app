// store/feedback/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import FeedbackService from '@/store/feedback/service';
import { ProgramAbandonData } from '@/types/feedbackTypes';

export const sendProgramAbandonFeedbackAsync = createAsyncThunk<void, { userId: string; programId: string; feedback: ProgramAbandonData }>(
    'feedback/sendProgramFeedback',
    async ({ userId, programId, feedback }) => {
        return await FeedbackService.sendProgramFeedback(userId, programId, feedback, 'PROGRAM_TERMINATION');
    },
);
