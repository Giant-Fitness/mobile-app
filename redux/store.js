import { configureStore } from '@reduxjs/toolkit';
import programsReducer from './items/reducer';

export const store = configureStore({
    reducer: {
        programs: programsReducer,
    },
    devTools: true,
});
