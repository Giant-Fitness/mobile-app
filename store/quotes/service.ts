// store/quotes/service.ts

import { mockRestDayQuote, mockWorkoutQuote } from '@/store/quotes/mockData';
import { Quote } from '@/types';

const getWorkoutQuote = async (): Promise<Quote> => {
    console.log('service: getWorkoutQuote');
    return mockWorkoutQuote;
};

const getRestDayQuote = async (): Promise<Quote> => {
    console.log('service: getRestDayQuote');
    return mockRestDayQuote;
};

export default {
    getWorkoutQuote,
    getRestDayQuote,
};
