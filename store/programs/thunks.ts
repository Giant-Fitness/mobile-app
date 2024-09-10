// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { actionTypes } from '@/store/programs/actionTypes';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay, UserWorkoutPlanProgress } from '@/store/types';

export const getAllProgramsAsync = createAsyncThunk<Program[], void>(actionTypes.GET_ALL_PROGRAMS, async () => {
    return await ProgramService.getAllPrograms();
});

export const getCurrentDayAsync = createAsyncThunk<ProgramDay, void>(actionTypes.GET_CURRENT_DAY, async () => {
    return await ProgramService.getCurrentDay();
});

export const getNextDaysAsync = createAsyncThunk<ProgramDay[], { planId: string; currentDayId: string; numDays: number }>(
    actionTypes.GET_NEXT_DAYS,
    async ({ planId, currentDayId, numDays }, thunkAPI) => {
        return await ProgramService.getNextDays(planId, currentDayId, numDays);
    },
);

export const getAllProgramDaysAsync = createAsyncThunk<ProgramDay[], void>(actionTypes.GET_ALL_PROGRAM_DAYS, async (planId: string) => {
    return await ProgramService.getAllProgramDays(planId);
});

export const getActiveProgramMetaAsync = createAsyncThunk<Program[], void>(actionTypes.GET_ACTIVE_PROGRAM_META, async () => {
    return await ProgramService.getActiveProgramMeta();
});

export const getUserPlanProgressAsync = createAsyncThunk<Program[], void>(actionTypes.GET_USER_PLAN_PROGRESS, async () => {
    return await ProgramService.getUserPlanProgress();
});
