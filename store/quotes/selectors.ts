// store/quotes/selectors.ts

import { RootState } from '../store'; // Make sure this path is correct

export const selectWorkoutQuote = (state: RootState) => state.quotes.workoutQuote;
export const selectWorkoutQuoteState = (state: RootState) => state.quotes.workoutQuoteState;
export const selectRestDayQuote = (state: RootState) => state.quotes.restDayQuote;
export const selectRestDayQuoteState = (state: RootState) => state.quotes.restDayQuoteState;
export const selectQuoteError = (state: RootState) => state.quotes.error;
