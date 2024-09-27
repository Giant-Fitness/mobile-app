// store/quotes/mockData.ts

import { Quote } from '@/types';

const mockWorkoutQuote: Quote = {
    QuoteType: 'Motivation',
    QuoteId: 'quote001',
    QuoteText: '"The only bad workout is the one that didn\'t happen"',
    Author: '',
    Context: 'Workout',
    Active: true,
    CreatedAt: '2024-08-01',
    UpdatedAt: '2024-08-05',
};

const mockRestDayQuote: Quote = {
    QuoteType: 'Recovery',
    QuoteId: 'quote002',
    QuoteText: 'Take a break; your gains will wait',
    Author: '',
    Context: 'Rest',
    Active: true,
    CreatedAt: '2024-08-01',
    UpdatedAt: '2024-08-05',
};

export { mockWorkoutQuote, mockRestDayQuote };
