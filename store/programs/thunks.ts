// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getAllProgramsAsync = createAsyncThunk<Program[], void>('programs/getAllPrograms', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    // If programs are already loaded, return them
    if (state.programs.allProgramsState === REQUEST_STATE.FULFILLED) {
        return Object.values(state.programs.programs);
    }
    return await ProgramService.getAllPrograms();
});

export const getProgramAsync = createAsyncThunk<Program | undefined, { programId: string }, { state: RootState }>(
    'programs/getProgram',
    async ({ programId }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingProgram = state.programs.programs[programId];
        if (existingProgram) {
            // If already exists, return it
            return existingProgram;
        }

        const program = await ProgramService.getProgram(programId);
        if (!program) {
            return rejectWithValue('Program not found.');
        }
        return program;
    },
);

export const getAllProgramDaysAsync = createAsyncThunk<ProgramDay[], { programId: string }, { state: RootState }>(
    'programs/getAllProgramDays',
    async ({ programId }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const existingDays = state.programs.programDays[programId];
            const expectedDayCount = state.programs.programs[programId]?.Days;

            if (existingDays && expectedDayCount && Object.keys(existingDays).length === expectedDayCount) {
                return Object.values(existingDays);
            }

            const programDays = await ProgramService.getProgramDaysAll(programId);
            if (!programDays || programDays.length === 0) {
                return rejectWithValue('No program days found.');
            }
            return programDays;
        } catch (error) {
            return rejectWithValue('Error fetching program days.');
        }
    },
);

export const getProgramDayAsync = createAsyncThunk<ProgramDay, { programId: string; dayId: string }, { state: RootState }>(
    'programs/getProgramDay',
    async ({ programId, dayId }, { getState, rejectWithValue }) => {
        const state = getState();
        // Check if the program day already exists in the state
        const existingDay = state.programs.programDays[programId]?.[dayId];
        if (existingDay) {
            // If already exists, return it
            return existingDay;
        }

        // Fetch from the service
        const programDay = await ProgramService.getProgramDay(programId, dayId);
        if (!programDay) {
            return rejectWithValue('Program day not found.');
        }
        return programDay;
    },
);

export const getMultipleProgramDaysAsync = createAsyncThunk<ProgramDay[], { programId: string; dayIds: string[] }, { state: RootState }>(
    'programs/getMultipleProgramDays',
    async ({ programId, dayIds }, { getState, rejectWithValue }) => {
        const state = getState();

        const existingDays = dayIds.map((dayId) => state.programs.programDays[programId]?.[dayId]).filter((day) => day !== undefined);
        if (existingDays.length === dayIds.length) {
            // If all days exist in the state, return them
            return existingDays as ProgramDay[];
        }

        // Fetch missing days
        const missingDayIds = dayIds.filter((dayId) => !state.programs.programDays[programId]?.[dayId]);
        try {
            const fetchedDays = await ProgramService.getProgramDaysFiltered(programId, missingDayIds);
            if (!fetchedDays || fetchedDays.length === 0) {
                return rejectWithValue('Program days not found.');
            }
            return [...existingDays, ...fetchedDays];
        } catch (error) {
            return rejectWithValue('Error fetching program days.');
        }
    },
);
