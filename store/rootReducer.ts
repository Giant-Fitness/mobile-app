// store/rootReducer.js

import { configureStore } from '@reduxjs/toolkit';
import programsReducer from '@/store/programs/reducer';
import quotesReducer from '@/store/quotes/reducer';

// Define the RootState type based on the reducers
export type RootState = ReturnType<typeof store.getState>;
// Define the AppDispatch type based on the store's dispatch
export type AppDispatch = typeof store.dispatch;

export const store = configureStore({
    reducer: {
        programs: programsReducer,
        quotes: quotesReducer,
    },
    devTools: true,
});
