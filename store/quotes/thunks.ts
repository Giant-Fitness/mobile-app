// store/quotes/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import QuoteService from './service';
import { Quote } from '@/types';

export const getWorkoutQuoteAsync = createAsyncThunk<Quote, void>('quotes/getWorkoutQuote', async () => {
    return await QuoteService.getWorkoutQuote();
});

export const getRestDayQuoteAsync = createAsyncThunk<Quote, void>('quotes/getRestDayQuote', async () => {
    return await QuoteService.getRestDayQuote();
});
