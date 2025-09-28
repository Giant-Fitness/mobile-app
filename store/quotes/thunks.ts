// store/quotes/thunks.ts

import { cacheService } from '@/lib/cache/cacheService';
import { RootState } from '@/store/store';
import { Quote } from '@/types';

import { createAsyncThunk } from '@reduxjs/toolkit';

import QuoteService from './service';

export const getWorkoutQuoteAsync = createAsyncThunk<Quote, { forceRefresh?: boolean; useCache?: boolean } | void>(
    'quotes/getWorkoutQuote',
    async (args = {}, { getState }) => {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        if (state.quotes.workoutQuote && !forceRefresh) {
            return state.quotes.workoutQuote;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<Quote>('workout_quote');

            if (cached) {
                console.log('Loaded workout quote from cache');
                return cached;
            }
        }

        // Load from service (note: quotes are in-memory randomized, so this is fast)
        console.log('Loading workout quote from service');
        const quote = await QuoteService.getWorkoutQuote();

        if (useCache) {
            await cacheService.set('workout_quote', quote);
        }

        return quote;
    },
);

export const getRestDayQuoteAsync = createAsyncThunk<Quote, { forceRefresh?: boolean; useCache?: boolean } | void>(
    'quotes/getRestDayQuote',
    async (args = {}, { getState }) => {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        if (state.quotes.restDayQuote && !forceRefresh) {
            return state.quotes.restDayQuote;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<Quote>('rest_day_quote');

            if (cached) {
                console.log('Loaded rest day quote from cache');
                return cached;
            }
        }

        // Load from service (note: quotes are in-memory randomized, so this is fast)
        console.log('Loading rest day quote from service');
        const quote = await QuoteService.getRestDayQuote();

        if (useCache) {
            await cacheService.set('rest_day_quote', quote);
        }

        return quote;
    },
);
