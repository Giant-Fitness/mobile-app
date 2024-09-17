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

export const getProgramDayAsync = createAsyncThunk<ProgramDay, { programId: string; dayId: string }>(
    actionTypes.GET_PROGRAM_DAY,
    async ({ programId, dayId }) => {
        return await ProgramService.getProgramDay(programId, dayId);
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
    }
);

export const getActiveProgramCurrentDayAsync = createAsyncThunk<ProgramDay | undefined, void, { state: RootState }>(
    actionTypes.GET_ACTIVE_PROGRAM_CURRENT_DAY,
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const programId = state.programs.userProgramProgress?.ProgramId;
        const dayId = state.programs.userProgramProgress?.CurrentDay;

        if (!programId || !dayId) {
            return rejectWithValue('Program ID or Day ID not found in user progress.');
        }

        return await ProgramService.getProgramDay(programId, dayId);
    }
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

        return await ProgramService.getProgramDaysFiltered(programId, dayIdsToFetch);
    }
);

