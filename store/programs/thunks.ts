// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { actionTypes } from '@/store/programs/actionTypes';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay, UserProgramProgress } from '@/type/types';
import { RootState } from '@/store/rootReducer';

export const getUserProgramProgressAsync = createAsyncThunk<UserProgramProgress, void>(actionTypes.GET_USER_PROGRAM_PROGRESS, async () => {
    return await ProgramService.getUserProgramProgress();
});

export const getAllProgramsAsync = createAsyncThunk<Program[], void>(actionTypes.GET_ALL_PROGRAMS, async () => {
    return await ProgramService.getAllPrograms();
});

export const getProgramAsync = createAsyncThunk<Program | undefined, { programId: string }>(actionTypes.GET_PROGRAM, async ({ programId }, thunkAPI) => {
    return await ProgramService.getProgram(programId);
});

export const getProgramDayAsync = createAsyncThunk<ProgramDay, { programId: string; dayId: string }, { state: RootState }>(
    actionTypes.GET_PROGRAM_DAY,
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

export const getActiveProgramAsync = createAsyncThunk<Program | undefined, void, { state: RootState }>(
    actionTypes.GET_ACTIVE_PROGRAM,
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const programId = state.programs.userProgramProgress?.ProgramId;

        if (!programId) {
            return rejectWithValue('Program ID not found in user progress.');
        }

        return await ProgramService.getProgram(programId);
    },
);

export const getActiveProgramCurrentDayAsync = createAsyncThunk<ProgramDay, void, { state: RootState }>(
    actionTypes.GET_ACTIVE_PROGRAM_CURRENT_DAY,
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const programId = state.programs.userProgramProgress?.ProgramId;
        const dayId = state.programs.userProgramProgress?.CurrentDay;

        if (!programId || !dayId) {
            return rejectWithValue('Program ID or Day ID not found in user progress.');
        }

        // Check if the program day already exists in the state
        const existingDay = state.programs.programDays[programId]?.[dayId];
        if (existingDay) {
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

export const getActiveProgramNextDaysAsync = createAsyncThunk<ProgramDay[], { numDays: number }, { state: RootState }>(
    actionTypes.GET_ACTIVE_PROGRAM_NEXT_DAYS,
    async ({ numDays }, { getState, rejectWithValue }) => {
        const state = getState();
        const programId = state.programs.userProgramProgress?.ProgramId;
        const dayId = state.programs.userProgramProgress?.CurrentDay;

        if (!programId || !dayId) {
            return rejectWithValue('Program ID or Day ID not found in user progress.');
        }

        const startDay = parseInt(dayId, 10);
        const dayIdsToFetch = Array.from({ length: numDays }, (_, i) => (startDay + i + 1).toString());

        // Filter out dayIds that already exist in state
        const dayIdsNotInState = dayIdsToFetch.filter((id) => !state.programs.programDays[programId]?.[id]);

        if (dayIdsNotInState.length === 0) {
            // All days are already in state
            return dayIdsToFetch.map((id) => state.programs.programDays[programId][id]);
        }

        // Fetch from the service
        const programDays = await ProgramService.getProgramDaysFiltered(programId, dayIdsNotInState);
        if (!programDays || programDays.length === 0) {
            return rejectWithValue('Program days not found.');
        }
        return programDays;
    },
);
