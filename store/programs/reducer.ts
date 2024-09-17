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
    activeProgram: Program | null;
    activeProgramState: REQUEST_STATE;
    programDays: {
        [programId: string]: {
            [dayId: string]: ProgramDay;
        };
    };
    programDaysState: {
        [programId: string]: {
            [dayId: string]: REQUEST_STATE;
        };
    };
    activeProgramCurrentDayId: string | null;
    activeProgramNextDayIds: string[];
    programDaysError: string | null;
    error: string | null;
}

const initialState: ProgramState = {
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    programs: [] as Program[],
    allProgramsState: REQUEST_STATE.IDLE,
    program: null,
    programState: REQUEST_STATE.IDLE,
    activeProgram: null,
    activeProgramState: REQUEST_STATE.IDLE,
    programDays: {},
    programDaysState: {},
    activeProgramCurrentDayId: null,
    activeProgramNextDayIds: [],
    programDaysError: null,
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
            .addCase(getProgramDayAsync.pending, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                if (!state.programDaysState[programId]) {
                    state.programDaysState[programId] = {};
                }
                state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                state.programDaysError = null;
            })
            .addCase(getProgramDayAsync.fulfilled, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                if (!state.programDays[programId]) {
                    state.programDays[programId] = {};
                }
                state.programDays[programId][dayId] = action.payload;
                state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
            })
            .addCase(getProgramDayAsync.rejected, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                state.programDaysError = action.error.message || 'An error occurred';
            })
            // Update getActiveProgramCurrentDayAsync
            .addCase(getActiveProgramCurrentDayAsync.pending, (state) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    if (!state.programDaysState[programId]) {
                        state.programDaysState[programId] = {};
                    }
                    state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                    state.programDaysError = null;
                }
            })
            .addCase(getActiveProgramCurrentDayAsync.fulfilled, (state, action) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    if (!state.programDays[programId]) {
                        state.programDays[programId] = {};
                    }
                    state.programDays[programId][dayId] = action.payload;
                    state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
                    state.activeProgramCurrentDayId = dayId; // Store the current day ID
                }
            })
            .addCase(getActiveProgramCurrentDayAsync.rejected, (state, action) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                    state.programDaysError = action.error.message || 'An error occurred';
                }
            })
            .addCase(getActiveProgramNextDaysAsync.pending, (state) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    if (!state.programDaysState[programId]) {
                        state.programDaysState[programId] = {};
                    }
                    state.programDaysError = null;
                }
            })
            .addCase(getActiveProgramNextDaysAsync.fulfilled, (state, action) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    if (!state.programDays[programId]) {
                        state.programDays[programId] = {};
                    }
                    const nextDayIds: string[] = [];
                    action.payload.forEach((programDay) => {
                        const dayId = programDay.DayId;
                        state.programDays[programId][dayId] = programDay;
                        state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
                        nextDayIds.push(dayId);
                    });
                    state.activeProgramNextDayIds = nextDayIds; // Store next day IDs
                }
            })
            .addCase(getActiveProgramNextDaysAsync.rejected, (state, action) => {
                state.programDaysError = action.error.message || 'An error occurred';
            });
    },
});

export default programSlice.reducer;
