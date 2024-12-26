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
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'

const settingsPersistConfig = {
    key : 'settings',
    storage : AsyncStorage,
}
const persistedSettingsReducer = persistReducer(settingsPersistConfig, settingsReducer);

const combinedReducer = combineReducers({
    programs: programsReducer,
    quotes: quotesReducer,
    user: userReducer,
    workouts: workoutsReducer,
    feedback: feedbackReducer,
    exerciseProgress: exerciseProgressReducer,
    settings: persistedSettingsReducer,
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
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],  // Ignore both PERSIST and REHYDRATE actions
          },
        }),
      

});

export const persistor = persistStore(store);

// this is to manually rehydrate

persistor.subscribe(() => {
  const state = store.getState();
  if (state._persist?.rehydrated) {
    console.log('Rehydration completed!');
  }
});

// Define the RootState type based on the reducers
export type RootState = ReturnType<typeof store.getState>;

// Define the AppDispatch type based on the store's dispatch
export type AppDispatch = typeof store.dispatch;
