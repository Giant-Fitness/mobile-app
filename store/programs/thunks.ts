// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

export const getAllProgramsAsync = createAsyncThunk<Program[], { forceRefresh?: boolean } | void>(
    'programs/getAllPrograms',
    async (args = {}, { getState }) => {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        // If programs are already loaded and not forcing refresh, return them
        if (state.programs.allProgramsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return Object.values(state.programs.programs);
        }

        return await ProgramService.getAllPrograms();
    },
);

export const getProgramAsync = createAsyncThunk<Program | undefined, { programId: string; forceRefresh?: boolean }, { state: RootState }>(
    'programs/getProgram',
    async ({ programId, forceRefresh = false }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingProgram = state.programs.programs[programId];

        // If already exists and not forcing refresh, return it
        if (existingProgram && !forceRefresh) {
            return existingProgram;
        }

        const program = await ProgramService.getProgram(programId);
        if (!program) {
            return rejectWithValue('Program not found.');
        }
        return program;
    },
);

export const getAllProgramDaysAsync = createAsyncThunk<ProgramDay[], { programId: string; forceRefresh?: boolean }, { state: RootState }>(
    'programs/getAllProgramDays',
    async ({ programId, forceRefresh = false }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const existingDays = state.programs.programDays[programId];
            const expectedDayCount = state.programs.programs[programId]?.Days;

            // If days are already loaded and not forcing refresh, return them
            if (!forceRefresh && existingDays && expectedDayCount && Object.keys(existingDays).length === expectedDayCount) {
                return Object.values(existingDays);
            }

            const programDays = await ProgramService.getProgramDaysAll(programId);
            if (!programDays || programDays.length === 0) {
                return rejectWithValue('No program days found.');
            }
            return programDays;
        } catch (error) {
            console.log(error);
            return rejectWithValue('Error fetching program days.');
        }
    },
);

export const getProgramDayAsync = createAsyncThunk<ProgramDay, { programId: string; dayId: string; forceRefresh?: boolean }, { state: RootState }>(
    'programs/getProgramDay',
    async ({ programId, dayId, forceRefresh = false }, { getState, rejectWithValue }) => {
        const state = getState();
        // Check if the program day already exists in the state
        const existingDay = state.programs.programDays[programId]?.[dayId];

        // If already exists and not forcing refresh, return it
        if (existingDay && !forceRefresh) {
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

export const getMultipleProgramDaysAsync = createAsyncThunk<
    ProgramDay[],
    { programId: string; dayIds: string[]; forceRefresh?: boolean },
    { state: RootState }
>('programs/getMultipleProgramDays', async ({ programId, dayIds, forceRefresh = false }, { getState, rejectWithValue }) => {
    const state = getState();

    // If not forcing refresh, check for existing days
    if (!forceRefresh) {
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
            console.log(error);
            return rejectWithValue('Error fetching program days.');
        }
    } else {
        // Force refresh - fetch all requested days
        try {
            const fetchedDays = await ProgramService.getProgramDaysFiltered(programId, dayIds);
            if (!fetchedDays || fetchedDays.length === 0) {
                return rejectWithValue('Program days not found.');
            }
            return fetchedDays;
        } catch (error) {
            console.log(error);
            return rejectWithValue('Error fetching program days.');
        }
    }
});
