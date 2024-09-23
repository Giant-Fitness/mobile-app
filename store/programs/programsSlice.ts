// store/programs/programsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgramState, initialState } from '@/store/programs/programsState';
import {
    getUserProgramProgressAsync,
    getAllProgramsAsync,
    getProgramAsync,
    getProgramDayAsync,
    getActiveProgramAsync,
    getActiveProgramCurrentDayAsync,
    getActiveProgramNextDaysAsync,
    getAllProgramDaysAsync,
} from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Program, ProgramDay, UserProgramProgress } from '@/types';

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        setSelectedProgram: (state, action: PayloadAction<string>) => {
            state.selectedProgramId = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.programDaysError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // User Program Progress
            .addCase(getUserProgramProgressAsync.pending, (state) => {
                state.userProgramProgressState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getUserProgramProgressAsync.fulfilled, (state, action: PayloadAction<UserProgramProgress>) => {
                state.userProgramProgressState = REQUEST_STATE.FULFILLED;
                state.userProgramProgress = action.payload;
            })
            .addCase(getUserProgramProgressAsync.rejected, (state, action) => {
                state.userProgramProgressState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch user program progress';
            })

            // All Programs
            .addCase(getAllProgramsAsync.pending, (state) => {
                state.allProgramsState = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getAllProgramsAsync.fulfilled, (state, action: PayloadAction<Program[]>) => {
                state.allProgramsState = REQUEST_STATE.FULFILLED;
                action.payload.forEach((program) => {
                    state.programs[program.ProgramId] = program;
                    state.programsState[program.ProgramId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getAllProgramsAsync.rejected, (state, action) => {
                state.allProgramsState = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch all programs';
            })

            // Single Program
            .addCase(getProgramAsync.pending, (state, action) => {
                const { programId } = action.meta.arg;
                state.programsState[programId] = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getProgramAsync.fulfilled, (state, action: PayloadAction<Program>) => {
                const program = action.payload;
                state.programs[program.ProgramId] = program;
                state.programsState[program.ProgramId] = REQUEST_STATE.FULFILLED;
                state.selectedProgramId = program.ProgramId;
            })
            .addCase(getProgramAsync.rejected, (state, action) => {
                const { programId } = action.meta.arg;
                state.programsState[programId] = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch program';
            })

            // Active Program
            .addCase(getActiveProgramAsync.pending, (state) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    state.programsState[programId] = REQUEST_STATE.PENDING;
                }
                state.error = null;
            })
            .addCase(getActiveProgramAsync.fulfilled, (state, action: PayloadAction<Program>) => {
                const program = action.payload;
                state.programs[program.ProgramId] = program;
                state.programsState[program.ProgramId] = REQUEST_STATE.FULFILLED;
                state.activeProgramId = program.ProgramId;
            })
            .addCase(getActiveProgramAsync.rejected, (state, action) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    state.programsState[programId] = REQUEST_STATE.REJECTED;
                }
                state.error = action.error.message || 'Failed to fetch active program';
            })

            // Program Day
            .addCase(getProgramDayAsync.pending, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                state.programDaysError = null;
            })
            .addCase(getProgramDayAsync.fulfilled, (state, action: PayloadAction<ProgramDay>) => {
                const { programId, dayId } = action.meta.arg;
                state.programDays[programId] = state.programDays[programId] || {};
                state.programDays[programId][dayId] = action.payload;
                state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
            })
            .addCase(getProgramDayAsync.rejected, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                state.programDaysError = action.error.message || 'Failed to fetch program day';
            })

            // Active Program Current Day
            .addCase(getActiveProgramCurrentDayAsync.pending, (state) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    state.programDaysState[programId] = state.programDaysState[programId] || {};
                    state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                    state.programDaysError = null;
                }
            })
            .addCase(getActiveProgramCurrentDayAsync.fulfilled, (state, action: PayloadAction<ProgramDay>) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    state.programDays[programId] = state.programDays[programId] || {};
                    state.programDays[programId][dayId] = action.payload;
                    state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
                    state.activeProgramCurrentDayId = dayId;
                }
            })
            .addCase(getActiveProgramCurrentDayAsync.rejected, (state, action) => {
                const programId = state.userProgramProgress?.ProgramId;
                const dayId = state.userProgramProgress?.CurrentDay;
                if (programId && dayId) {
                    state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                    state.programDaysError = action.error.message || 'Failed to fetch active program current day';
                }
            })

            // Active Program Next Days
            .addCase(getActiveProgramNextDaysAsync.pending, (state) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    state.programDaysState[programId] = state.programDaysState[programId] || {};
                    state.programDaysError = null;
                }
            })
            .addCase(getActiveProgramNextDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                const programId = state.userProgramProgress?.ProgramId;
                if (programId) {
                    state.programDays[programId] = state.programDays[programId] || {};
                    const nextDayIds: string[] = [];
                    action.payload.forEach((programDay) => {
                        const dayId = programDay.DayId;
                        state.programDays[programId][dayId] = programDay;
                        state.programDaysState[programId][dayId] = REQUEST_STATE.FULFILLED;
                        nextDayIds.push(dayId);
                    });
                    state.activeProgramNextDayIds = nextDayIds;
                }
            })
            .addCase(getActiveProgramNextDaysAsync.rejected, (state, action) => {
                state.programDaysError = action.error.message || 'Failed to fetch active program next days';
            })

            // All Program Days
            .addCase(getAllProgramDaysAsync.pending, (state, action) => {
                const { programId } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                state.programDaysError = null;
            })
            .addCase(getAllProgramDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                const { programId } = action.meta.arg;
                state.programDays[programId] = state.programDays[programId] || {};
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                action.payload.forEach((day) => {
                    state.programDays[programId][day.DayId] = day;
                    state.programDaysState[programId][day.DayId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getAllProgramDaysAsync.rejected, (state, action) => {
                const { programId } = action.meta.arg;
                if (programId) {
                    state.programDaysState[programId] = state.programDaysState[programId] || {};
                    Object.keys(state.programDays[programId] || {}).forEach((dayId) => {
                        if (state.programDaysState[programId][dayId] === REQUEST_STATE.PENDING) {
                            state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                        }
                    });
                }
                state.programDaysError = action.error.message || 'Failed to fetch all program days';
            });
    },
});

export const { setSelectedProgram, clearError } = programSlice.actions;
export default programSlice.reducer;
