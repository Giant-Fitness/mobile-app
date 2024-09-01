import { configureStore } from '@reduxjs/toolkit';
import programsReducer from './programs/reducer';

export const store = configureStore({
    reducer: {
        programs: programsReducer,
    },
    devTools: true,
});
