// store/quotes/service.ts

import { Quote } from '@/types';
import { mockWorkoutQuote, mockRestDayQuote } from '@/store/quotes/mockData';

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
