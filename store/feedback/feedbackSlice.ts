// store/feedback/feedbackSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from '@/store/feedback/feedbackState';
import { sendProgramAbandonFeedbackAsync } from '@/store/feedback/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Send Abandon Program Feedback
            .addCase(sendProgramAbandonFeedbackAsync.pending, (state) => {
                state.submitProgramFeedbackStatus = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(sendProgramAbandonFeedbackAsync.fulfilled, (state, action) => {
                state.submitProgramFeedbackStatus = REQUEST_STATE.FULFILLED;
            })
            .addCase(sendProgramAbandonFeedbackAsync.rejected, (state, action) => {
                state.submitProgramFeedbackStatus = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to send program feedback';
            });
    },
});

export const { clearError } = feedbackSlice.actions;
export default feedbackSlice.reducer;
