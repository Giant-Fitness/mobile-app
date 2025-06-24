// store/quotes/thunks.ts

import { RootState } from '@/store/store';
import { Quote } from '@/types';
import { cacheService, CacheTTL } from '@/utils/cache';

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
            const isExpired = await cacheService.isExpired('workout_quote');

            if (cached && !isExpired) {
                console.log('Loaded workout quote from cache');
                return cached;
            }
        }

        // Load from service (note: quotes are in-memory randomized, so this is fast)
        console.log('Loading workout quote from service');
        const quote = await QuoteService.getWorkoutQuote();

        // Cache the result if useCache is enabled (short TTL since quotes change)
        if (useCache) {
            await cacheService.set('workout_quote', quote, CacheTTL.SHORT);
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
            const isExpired = await cacheService.isExpired('rest_day_quote');

            if (cached && !isExpired) {
                console.log('Loaded rest day quote from cache');
                return cached;
            }
        }

        // Load from service (note: quotes are in-memory randomized, so this is fast)
        console.log('Loading rest day quote from service');
        const quote = await QuoteService.getRestDayQuote();

        // Cache the result if useCache is enabled (short TTL since quotes change)
        if (useCache) {
            await cacheService.set('rest_day_quote', quote, CacheTTL.SHORT);
        }

        return quote;
    },
);
