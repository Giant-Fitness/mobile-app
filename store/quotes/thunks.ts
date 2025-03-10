// store/quotes/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import QuoteService from './service';
import { Quote } from '@/types';
import { RootState } from '@/store/store';

export const getWorkoutQuoteAsync = createAsyncThunk<Quote, { forceRefresh?: boolean } | void>('quotes/getWorkoutQuote', async (args = {}, { getState }) => {
    const { forceRefresh = false } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.quotes.workoutQuote && !forceRefresh) {
        return state.quotes.workoutQuote;
    }

    return await QuoteService.getWorkoutQuote();
});

export const getRestDayQuoteAsync = createAsyncThunk<Quote, { forceRefresh?: boolean } | void>('quotes/getRestDayQuote', async (args = {}, { getState }) => {
    const { forceRefresh = false } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.quotes.restDayQuote && !forceRefresh) {
        return state.quotes.restDayQuote;
    }

    return await QuoteService.getRestDayQuote();
});
