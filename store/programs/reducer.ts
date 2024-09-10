// store/programs/reducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCurrentAndNextDaysAsync, getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/store/utils';
import { ProgramDay, Program } from '@/store/programs/types';

// Define the initial state type
interface ProgramState {
    programs: Program[];
    allProgramsState: REQUEST_STATE;
    currentAndNextDays: ProgramDay[];
    currentAndNextDaysState: REQUEST_STATE;
    allProgramDays: ProgramDay[];
    allProgramDaysState: REQUEST_STATE;
    error: string | null;
}

const initialState: ProgramState = {
    programs: [],
    allProgramsState: REQUEST_STATE.IDLE,
    currentAndNextDays: [],
    currentAndNextDaysState: REQUEST_STATE.IDLE,
    allProgramDays: [],
    allProgramDaysState: REQUEST_STATE.IDLE,
    error: null,
};

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentAndNextDaysAsync.pending, (state) => {
                state.currentAndNextDaysState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getCurrentAndNextDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                state.currentAndNextDaysState = REQUEST_STATE.FULFILLED;
                state.currentAndNextDays = action.payload;
            })
            .addCase(getCurrentAndNextDaysAsync.rejected, (state, action) => {
                state.currentAndNextDaysState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getAllProgramDaysAsync.pending, (state) => {
                state.allProgramDaysState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllProgramDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                state.allProgramDaysState = REQUEST_STATE.FULFILLED;
                state.allProgramDays = action.payload;
            })
            .addCase(getAllProgramDaysAsync.rejected, (state, action) => {
                state.allProgramDaysState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getAllProgramsAsync.pending, (state) => {
                state.allProgramsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllProgramsAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.allProgramsState = REQUEST_STATE.FULFILLED;
                state.programs = action.payload;
            })
            .addCase(getAllProgramsAsync.rejected, (state, action) => {
                state.allProgramsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default programSlice.reducer;
