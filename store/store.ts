// store/store.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import programsReducer from '@/store/programs/programsSlice';
import quotesReducer from '@/store/quotes/quotesSlice';
import userReducer from '@/store/user/userSlice';
import workoutsReducer from '@/store/workouts/workoutsSlice';
import feedbackReducer from '@/store/feedback/feedbackSlice';
import { resetStore } from '@/store/actions';
// Create a reducer enhancer that handles resetting the entire store
const resettableReducer = (reducer: typeof rootReducer) => (state: any, action: any) => {
    if (action.type === resetStore().type) {
        // Reset to initial state
        return reducer(undefined, action);
    }
    return reducer(state, action);
};

const combinedReducer = combineReducers({
    programs: programsReducer,
    quotes: quotesReducer,
    user: userReducer,
    workouts: workoutsReducer,
    feedback: feedbackReducer,
});

// Create root reducer with reset functionality
const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action: ReturnType<typeof resetStore> | any) => {
    if (action.type === resetStore.type) {
        // Reset state to undefined so each reducer returns initial state
        state = undefined;
    }
    return combinedReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    devTools: true,
});

// Define the RootState type based on the reducers
export type RootState = ReturnType<typeof store.getState>;

// Define the AppDispatch type based on the store's dispatch
export type AppDispatch = typeof store.dispatch;
