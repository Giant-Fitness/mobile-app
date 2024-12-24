// store/store.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import programsReducer from '@/store/programs/programsSlice';
import quotesReducer from '@/store/quotes/quotesSlice';
import userReducer from '@/store/user/userSlice';
import workoutsReducer from '@/store/workouts/workoutsSlice';
import feedbackReducer from '@/store/feedback/feedbackSlice';
import exerciseProgressReducer from '@/store/exerciseProgress/exerciseProgressSlice';
import { resetStore } from '@/store/actions';
import  settingsReducer  from '@/store/settings/settingsSlice';


const combinedReducer = combineReducers({
    programs: programsReducer,
    quotes: quotesReducer,
    user: userReducer,
    workouts: workoutsReducer,
    feedback: feedbackReducer,
    exerciseProgress: exerciseProgressReducer,
    settings: settingsReducer,
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
