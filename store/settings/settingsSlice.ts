import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    bodyWeightPreference: 'kgs' | 'lbs';
    liftWeightPreference: 'kgs' | 'lbs';
}

const initialState: SettingsState = {
    bodyWeightPreference: 'kgs',
    liftWeightPreference: 'kgs',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setBodyWeightPreference: (state, action: PayloadAction<'kgs' | 'lbs'>) => {
            state.bodyWeightPreference = action.payload;
        },
        setLiftWeightPreference: (state, action: PayloadAction<'kgs' | 'lbs'>) => {
            state.liftWeightPreference = action.payload;
        },
    },
});

export const { setBodyWeightPreference, setLiftWeightPreference } = settingsSlice.actions;

export default settingsSlice.reducer;
