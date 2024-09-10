// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { actionTypes } from '@/store/programs/actionTypes';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay } from '@/store/types';

export const getAllProgramsAsync = createAsyncThunk<Program[], void>(actionTypes.GET_ALL_PROGRAMS, async () => {
    return await ProgramService.getAllPrograms();
});

export const getCurrentAndNextDaysAsync = createAsyncThunk<ProgramDay[], void>(actionTypes.GET_CURRENT_AND_NEXT_DAYS, async () => {
    return await ProgramService.getCurrentAndNextDays();
});

export const getAllProgramDaysAsync = createAsyncThunk<ProgramDay[], void>(actionTypes.GET_ALL_PROGRAM_DAYS, async (planId: string) => {
    return await ProgramService.getAllProgramDays(planId);
});
