// store/programs/reducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    getCurrentDayAsync,
    getAllProgramDaysAsync,
    getAllProgramsAsync,
    getActiveProgramMetaAsync,
    getUserPlanProgressAsync,
    getNextDaysAsync,
} from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ProgramDay, Program, UserWorkoutPlanProgress } from '@/type/types';

// Define the initial state type
interface ProgramState {
    programs: Program[];
    allProgramsState: REQUEST_STATE;
    activeProgram: Program;
    activeProgramState: REQUEST_STATE;
    currentDay: ProgramDay;
    currentDayState: REQUEST_STATE;
    nextDays: ProgramDay[];
    nextDaysState: REQUEST_STATE;
    allProgramDays: ProgramDay[];
    allProgramDaysState: REQUEST_STATE;
    userPlanProgress: UserWorkoutPlanProgress;
    userPlanProgressState: REQUEST_STATE;
    error: string | null;
}

const initialState: ProgramState = {
    programs: [],
    allProgramsState: REQUEST_STATE.IDLE,
    activeProgram: null,
    activeProgramState: REQUEST_STATE.IDLE,
    currentDay: null,
    currentDayState: REQUEST_STATE.IDLE,
    nextDays: [],
    nextDaysState: REQUEST_STATE.IDLE,
    allProgramDays: [],
    allProgramDaysState: REQUEST_STATE.IDLE,
    userPlanProgress: null,
    userPlanProgressState: REQUEST_STATE.IDLE,
    error: null,
};

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentDayAsync.pending, (state) => {
                state.currentDayState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getCurrentDayAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                state.currentDayState = REQUEST_STATE.FULFILLED;
                state.currentDay = action.payload;
            })
            .addCase(getCurrentDayAsync.rejected, (state, action) => {
                state.currentDayState = REQUEST_STATE.REJECTED;
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
            })
            .addCase(getActiveProgramMetaAsync.pending, (state) => {
                state.activeProgramState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getActiveProgramMetaAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.activeProgramState = REQUEST_STATE.FULFILLED;
                state.activeProgram = action.payload;
            })
            .addCase(getActiveProgramMetaAsync.rejected, (state, action) => {
                state.activeProgramState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getUserPlanProgressAsync.pending, (state) => {
                state.userPlanProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserPlanProgressAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.userPlanProgressState = REQUEST_STATE.FULFILLED;
                state.userPlanProgress = action.payload;
            })
            .addCase(getUserPlanProgressAsync.rejected, (state, action) => {
                state.userPlanProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getNextDaysAsync.pending, (state) => {
                state.nextDaysState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getNextDaysAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.nextDaysState = REQUEST_STATE.FULFILLED;
                state.nextDays = action.payload;
            })
            .addCase(getNextDaysAsync.rejected, (state, action) => {
                state.nextDaysState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default programSlice.reducer;
