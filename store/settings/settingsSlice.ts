import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // imports createSlice and payload which are used for creating a slice and setting an action assosiated with it

interface SettingsState { //defines what the payload values can be
    bodyWeightPreference: 'kg' | 'pounds';
    liftWeightPreference: 'kg' | 'pounds';
}

const initialState: SettingsState = { //defines initial state
    bodyWeightPreference: 'kg',
    liftWeightPreference: 'kg',
};

const settingsSlice = createSlice({
    name: 'settings', //gives a name through which this slice can be accessed
    initialState, // gives it the initial state (initial value ) for the variable
    reducers: { // gives the reducers through which it can be changed
    setBodyWeightPreference: (state, action: PayloadAction<'kg' | 'pounds'>) => {
          state.bodyWeightPreference = action.payload;
        },
    setLiftWeightPreference: (state, action: PayloadAction<'kg' | 'pounds'>) => {
          state.liftWeightPreference = action.payload;
        },
      },
    });

export const { setBodyWeightPreference, setLiftWeightPreference } = settingsSlice.actions; // exportes the reducers so can be used elsewhere

export default settingsSlice.reducer; // exports the slice so that we can read the value for these varialbes outside
