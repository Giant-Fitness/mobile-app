import { createSlice } from '@reduxjs/toolkit';
import { getProgramsAsync } from './thunks';
import { REQUEST_STATE } from '../utils';

const INIT_STATE = {
    programList: [],
    getPrograms: REQUEST_STATE.IDLE,
    error: null
};

const programSlice = createSlice({
    name: 'programs',
    initialState: INIT_STATE,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProgramsAsync.pending, (state) => {
                state.getPrograms = REQUEST_STATE.PENDING;
                state.error = null;
            })
            .addCase(getProgramsAsync.fulfilled, (state, action) => {
                state.getPrograms = REQUEST_STATE.FULFILLED;
                state.programList = action.payload;
            })
            .addCase(getProgramsAsync.rejected, (state, action) => {
                state.getPrograms = REQUEST_STATE.REJECTED,
                state.error = action.error;
            })
    },
});

// create slice auto creates an action that corresponds to a reducer
// export const {} = programSlice.actions;

export default programSlice.reducer;
