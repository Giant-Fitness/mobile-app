// store/feedback/thunks.ts

import FeedbackService from '@/store/feedback/service';
import { ProgramAbandonData, ProgramCompleteData } from '@/types/feedbackTypes';

import { createAsyncThunk } from '@reduxjs/toolkit';

export const sendProgramAbandonFeedbackAsync = createAsyncThunk<
    void,
    { userId: string; programId: string; feedback: ProgramAbandonData },
    { rejectValue: { errorMessage: string } }
>('feedback/sendProgramAbandonFeedback', async ({ userId, programId, feedback }, { rejectWithValue }) => {
    try {
        return await FeedbackService.sendProgramFeedback(userId, programId, feedback, 'PROGRAM_TERMINATION');
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to send program abandon feedback',
        });
    }
});

export const sendProgramCompleteFeedbackAsync = createAsyncThunk<
    void,
    { userId: string; programId: string; feedback: ProgramCompleteData },
    { rejectValue: { errorMessage: string } }
>('feedback/sendProgramCompleteFeedback', async ({ userId, programId, feedback }, { rejectWithValue }) => {
    try {
        return await FeedbackService.sendProgramFeedback(userId, programId, feedback, 'PROGRAM_COMPLETION');
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to send program complete feedback',
        });
    }
});
