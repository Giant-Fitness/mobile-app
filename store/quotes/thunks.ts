// store/quotes/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { actionTypes } from '@/store/quotes/actionTypes';
import QuoteService from '@/store/quotes/service';
import { Quote } from '@/store/types';

export const getWorkoutQuoteAsync = createAsyncThunk<Quote, void>(actionTypes.GET_WORKOUT_QUOTE, async () => {
    return await QuoteService.getWorkoutQuote();
});

export const getRestDayQuoteAsync = createAsyncThunk<Quote, void>(actionTypes.GET_REST_DAY_QUOTE, async () => {
    return await QuoteService.getRestDayQuote();
});
