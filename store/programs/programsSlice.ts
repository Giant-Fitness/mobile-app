// store/programs/programsSlice.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { initialState } from '@/store/programs/programsState';
import { getAllProgramDaysAsync, getAllProgramsAsync, getMultipleProgramDaysAsync, getProgramAsync, getProgramDayAsync } from '@/store/programs/thunks';
import { Program, ProgramDay } from '@/types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
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
            })
            .addCase(getProgramAsync.rejected, (state, action) => {
                const { programId } = action.meta.arg;
                state.programsState[programId] = REQUEST_STATE.REJECTED;
                state.error = action.error.message || 'Failed to fetch program';
            })

            // Program Day
            .addCase(getProgramDayAsync.pending, (state, action) => {
                const { programId, dayId } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                state.error = null;
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
                state.error = action.error.message || 'Failed to fetch program day';
            })

            // All Program Days
            .addCase(getAllProgramDaysAsync.pending, (state, action) => {
                const { programId } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                state.error = null;
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
                state.error = action.error.message || 'Failed to fetch all program days';
            })

            // Multiple Program Days
            .addCase(getMultipleProgramDaysAsync.pending, (state, action) => {
                const { programId, dayIds } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                dayIds.forEach((dayId) => {
                    state.programDaysState[programId][dayId] = REQUEST_STATE.PENDING;
                });
                state.error = null;
            })
            .addCase(getMultipleProgramDaysAsync.fulfilled, (state, action: PayloadAction<ProgramDay[]>) => {
                const { programId } = action.meta.arg;
                state.programDays[programId] = state.programDays[programId] || {};
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                action.payload.forEach((day) => {
                    state.programDays[programId][day.DayId] = day;
                    state.programDaysState[programId][day.DayId] = REQUEST_STATE.FULFILLED;
                });
            })
            .addCase(getMultipleProgramDaysAsync.rejected, (state, action) => {
                const { programId, dayIds } = action.meta.arg;
                state.programDaysState[programId] = state.programDaysState[programId] || {};
                dayIds.forEach((dayId) => {
                    state.programDaysState[programId][dayId] = REQUEST_STATE.REJECTED;
                });
                state.error = action.error.message || 'Failed to fetch multiple program days';
            });
    },
});

export const { clearError } = programSlice.actions;
export default programSlice.reducer;
