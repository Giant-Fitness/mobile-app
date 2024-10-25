// store/quotes/service.ts

import { Quote } from '@/types';
import { mockWorkoutQuote, mockRestDayQuote } from '@/store/quotes/mockData';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getWorkoutQuote = async (): Promise<Quote> => {
    console.log('service: getWorkoutQuote');
    // await simulateNetworkDelay();
    return mockWorkoutQuote;
};

const getRestDayQuote = async (): Promise<Quote> => {
    console.log('service: getRestDayQuote');
    // await simulateNetworkDelay();
    return mockRestDayQuote;
};

export default {
    getWorkoutQuote,
    getRestDayQuote,
};
