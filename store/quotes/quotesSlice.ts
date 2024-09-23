// store/quotes/quotesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Quote } from '@/types';

interface QuoteState {
    workoutQuote: Quote | null;
    workoutQuoteState: REQUEST_STATE;
    restDayQuote: Quote | null;
    restDayQuoteState: REQUEST_STATE;
    error: string | null;
}

const initialState: QuoteState = {
    workoutQuote: null,
    workoutQuoteState: REQUEST_STATE.IDLE,
    restDayQuote: null,
    restDayQuoteState: REQUEST_STATE.IDLE,
    error: null,
};

const quoteSlice = createSlice({
    name: 'quotes',
    initialState,
    reducers: {
        resetQuotes: (state) => {
            state.workoutQuote = null;
            state.workoutQuoteState = REQUEST_STATE.IDLE;
            state.restDayQuote = null;
            state.restDayQuoteState = REQUEST_STATE.IDLE;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWorkoutQuoteAsync.pending, (state) => {
                state.workoutQuoteState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getWorkoutQuoteAsync.fulfilled, (state, action: PayloadAction<Quote>) => {
                state.workoutQuoteState = REQUEST_STATE.FULFILLED;
                state.workoutQuote = action.payload;
            })
            .addCase(getWorkoutQuoteAsync.rejected, (state, action) => {
                state.workoutQuoteState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getRestDayQuoteAsync.pending, (state) => {
                state.restDayQuoteState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getRestDayQuoteAsync.fulfilled, (state, action: PayloadAction<Quote>) => {
                state.restDayQuoteState = REQUEST_STATE.FULFILLED;
                state.restDayQuote = action.payload;
            })
            .addCase(getRestDayQuoteAsync.rejected, (state, action) => {
                state.restDayQuoteState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export const { resetQuotes } = quoteSlice.actions;

export default quoteSlice.reducer;
