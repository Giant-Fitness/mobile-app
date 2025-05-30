// store/initialization/initializationSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REQUEST_STATE } from '@/constants/requestStates';

export interface InitializationState {
    // Overall states
    isInitialized: boolean;
    currentPhase: 'auth' | 'critical' | 'secondary' | 'background' | 'complete';

    // Phase states
    authState: keyof typeof REQUEST_STATE;
    criticalDataState: keyof typeof REQUEST_STATE;
    secondaryDataState: keyof typeof REQUEST_STATE;
    backgroundSyncState: keyof typeof REQUEST_STATE;

    // Data loading progress
    loadedItems: string[];
    failedItems: string[];
    totalItems: number;

    // Error handling
    criticalError: string | null;
    retryAttempt: number;

    // Cache status
    cacheStatus: {
        [key: string]: 'fresh' | 'stale' | 'missing';
    };
}

const initialState: InitializationState = {
    isInitialized: false,
    currentPhase: 'auth',

    authState: REQUEST_STATE.IDLE,
    criticalDataState: REQUEST_STATE.IDLE,
    secondaryDataState: REQUEST_STATE.IDLE,
    backgroundSyncState: REQUEST_STATE.IDLE,

    loadedItems: [],
    failedItems: [],
    totalItems: 0,

    criticalError: null,
    retryAttempt: 0,

    cacheStatus: {},
};

const initializationSlice = createSlice({
    name: 'initialization',
    initialState,
    reducers: {
        setPhase: (state, action: PayloadAction<InitializationState['currentPhase']>) => {
            state.currentPhase = action.payload;
        },

        setAuthState: (state, action: PayloadAction<keyof typeof REQUEST_STATE>) => {
            state.authState = action.payload;
        },

        setCriticalDataState: (state, action: PayloadAction<keyof typeof REQUEST_STATE>) => {
            state.criticalDataState = action.payload;
        },

        setSecondaryDataState: (state, action: PayloadAction<keyof typeof REQUEST_STATE>) => {
            state.secondaryDataState = action.payload;
        },

        setBackgroundSyncState: (state, action: PayloadAction<keyof typeof REQUEST_STATE>) => {
            state.backgroundSyncState = action.payload;
        },

        addLoadedItem: (state, action: PayloadAction<string>) => {
            if (!state.loadedItems.includes(action.payload)) {
                state.loadedItems.push(action.payload);
            }
        },

        addFailedItem: (state, action: PayloadAction<string>) => {
            if (!state.failedItems.includes(action.payload)) {
                state.failedItems.push(action.payload);
            }
        },

        setTotalItems: (state, action: PayloadAction<number>) => {
            state.totalItems = action.payload;
        },

        setCriticalError: (state, action: PayloadAction<string | null>) => {
            state.criticalError = action.payload;
        },

        incrementRetryAttempt: (state) => {
            state.retryAttempt += 1;
        },

        resetRetryAttempt: (state) => {
            state.retryAttempt = 0;
        },

        setCacheStatus: (state, action: PayloadAction<{ key: string; status: 'fresh' | 'stale' | 'missing' }>) => {
            state.cacheStatus[action.payload.key] = action.payload.status;
        },

        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
            if (action.payload) {
                state.currentPhase = 'complete';
            }
        },

        reset: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const {
    setPhase,
    setAuthState,
    setCriticalDataState,
    setSecondaryDataState,
    setBackgroundSyncState,
    addLoadedItem,
    addFailedItem,
    setTotalItems,
    setCriticalError,
    incrementRetryAttempt,
    resetRetryAttempt,
    setCacheStatus,
    setInitialized,
    reset,
} = initializationSlice.actions;

export default initializationSlice.reducer;
