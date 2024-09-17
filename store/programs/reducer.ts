// store/programs/reducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    getUserProgramProgressAsync,
    getAllProgramsAsync,
    getProgramAsync,
    getProgramDayAsync,
    getActiveProgramAsync,
    getActiveProgramCurrentDayAsync,
    getActiveProgramNextDaysAsync,
} from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ProgramDay, Program, UserProgramProgress } from '@/type/types';

// Define the initial state type
interface ProgramState {
    userProgramProgress: UserProgramProgress | null;
    userProgramProgressState: REQUEST_STATE;
    programs: Program[];
    allProgramsState: REQUEST_STATE;
    program: Program | null;
    programState: REQUEST_STATE;
    programDay: ProgramDay | null;
    programDayState: REQUEST_STATE;
    activeProgram: Program | null;
    activeProgramState: REQUEST_STATE;
    activeProgramCurrentDay: ProgramDay | null;
    activeProgramCurrentDayState: REQUEST_STATE;
    activeProgramNextDays: ProgramDay[];
    activeProgramNextDaysState: REQUEST_STATE;
    error: string | null;
}

const initialState: ProgramState = {
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    programs: [] as Program[],
    allProgramsState: REQUEST_STATE.IDLE,
    program: null,
    programState: REQUEST_STATE.IDLE,
    programDay: null,
    programDayState: REQUEST_STATE.IDLE,
    activeProgram: null,
    activeProgramState: REQUEST_STATE.IDLE,
    activeProgramCurrentDay: null,
    activeProgramCurrentDayState: REQUEST_STATE.IDLE,
    activeProgramNextDays: [] as ProgramDay[],
    activeProgramNextDaysState: REQUEST_STATE.IDLE,
    error: null,
};

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserProgramProgressAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserProgramProgressAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload || null;
            })
            .addCase(getUserProgramProgressAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getAllProgramsAsync.pending, (state) => {
                state.allProgramsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllProgramsAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.allProgramsState = REQUEST_STATE.FULFILLED;
                state.programs = action.payload || [];
            })
            .addCase(getAllProgramsAsync.rejected, (state, action) => {
                state.allProgramsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getProgramAsync.pending, (state) => {
                state.programState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getProgramAsync.fulfilled, (state, action: PayloadAction<Program | undefined>) => {
                state.programState = REQUEST_STATE.FULFILLED;
                state.program = action.payload || null;
            })
            .addCase(getProgramAsync.rejected, (state, action) => {
                state.programState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getProgramDayAsync.pending, (state) => {
                state.programDayState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getProgramDayAsync.fulfilled, (state, action: PayloadAction<ProgramDay | undefined>) => {
                state.programDayState = REQUEST_STATE.FULFILLED;
                state.programDay = action.payload || null;
            })
            .addCase(getProgramDayAsync.rejected, (state, action) => {
                state.programDayState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getActiveProgramAsync.pending, (state) => {
                state.activeProgramState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getActiveProgramAsync.fulfilled, (state, action: PayloadAction<Program | undefined>) => {
                state.activeProgramState = REQUEST_STATE.FULFILLED;
                state.activeProgram = action.payload || null;
            })
            .addCase(getActiveProgramAsync.rejected, (state, action) => {
                state.activeProgramState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getActiveProgramCurrentDayAsync.pending, (state) => {
                state.activeProgramCurrentDayState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getActiveProgramCurrentDayAsync.fulfilled, (state, action: PayloadAction<ProgramDay | undefined>) => {
                state.activeProgramCurrentDayState = REQUEST_STATE.FULFILLED;
                state.activeProgramCurrentDay = action.payload || null;
            })
            .addCase(getActiveProgramCurrentDayAsync.rejected, (state, action) => {
                state.activeProgramCurrentDayState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            })
            .addCase(getActiveProgramNextDaysAsync.pending, (state) => {
                state.activeProgramNextDaysState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getActiveProgramNextDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                state.activeProgramNextDaysState = REQUEST_STATE.FULFILLED;
                state.activeProgramNextDays = action.payload || [];
            })
            .addCase(getActiveProgramNextDaysAsync.rejected, (state, action) => {
                state.activeProgramNextDaysState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default programSlice.reducer;
