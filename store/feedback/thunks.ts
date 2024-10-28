// store/feedback/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import FeedbackService from '@/store/feedback/service';
import { ProgramAbandonData, ProgramCompleteData } from '@/types/feedbackTypes';

export const sendProgramAbandonFeedbackAsync = createAsyncThunk<void, { userId: string; programId: string; feedback: ProgramAbandonData }>(
    'feedback/sendProgramFeedback',
    async ({ userId, programId, feedback }) => {
        return await FeedbackService.sendProgramFeedback(userId, programId, feedback, 'PROGRAM_TERMINATION');
    },
);

export const sendProgramCompleteFeedbackAsync = createAsyncThunk<void, { userId: string; programId: string; feedback: ProgramCompleteData }>(
    'feedback/sendProgramFeedback',
    async ({ userId, programId, feedback }) => {
        return await FeedbackService.sendProgramFeedback(userId, programId, feedback, 'PROGRAM_COMPLETION');
    },
);
