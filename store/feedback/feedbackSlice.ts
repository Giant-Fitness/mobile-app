// store/feedback/feedbackSlice.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { initialState } from '@/store/feedback/feedbackState';
import { sendProgramAbandonFeedbackAsync } from '@/store/feedback/thunks';

import { createSlice } from '@reduxjs/toolkit';

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
            .addCase(sendProgramAbandonFeedbackAsync.fulfilled, (state) => {
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
