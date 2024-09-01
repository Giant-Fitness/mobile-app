import { createAsyncThunk } from "@reduxjs/toolkit";
import { actionTypes } from "./actionTypes";
import ProgramService from './service';

export const getProgramsAsync = createAsyncThunk(
    actionTypes.GET_PROGRAMS,
    async () => {
        return await ProgramService.getPrograms();
    }
);