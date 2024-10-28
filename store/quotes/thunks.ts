// store/quotes/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import QuoteService from './service';
import { Quote } from '@/types';
import { RootState } from '@/store/store';

export const getWorkoutQuoteAsync = createAsyncThunk<Quote, void>('quotes/getWorkoutQuote', async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.quotes.workoutQuote) {
        return state.quotes.workoutQuote;
    }
    return await QuoteService.getWorkoutQuote();
});

export const getRestDayQuoteAsync = createAsyncThunk<Quote, void>('quotes/getRestDayQuote', async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.quotes.restDayQuote) {
        return state.quotes.restDayQuote;
    }
    return await QuoteService.getRestDayQuote();
});
