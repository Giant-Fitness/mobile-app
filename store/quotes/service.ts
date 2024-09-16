// store/quotes/service.ts

import { Quote } from '@/type/types';
import { mockWorkoutQuote, mockRestDayQuote } from '@/store/quotes/mockData';

const getWorkoutQuote = async (): Promise<Quote> => {
    return mockWorkoutQuote;
};

const getRestDayQuote = async (): Promise<Quote> => {
    return mockRestDayQuote;
};

export default {
    getWorkoutQuote,
    getRestDayQuote,
};
