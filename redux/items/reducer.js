import { createSlice } from '@reduxjs/toolkit';

const INIT_STATE = {}

const programSlice = createSlice({
    name: 'programs',
    initialState: INIT_STATE,
    reducers: {}
});


// create slice auto creates an action that corresponds to a reducer
// export const {} = programSlice.actions;

export default programSlice.reducer;
