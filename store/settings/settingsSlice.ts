import { createSlice, PayloadAction } from '@reduxjs/toolkit'; 
interface SettingsState { 
    bodyWeightPreference: 'kg' | 'pounds';
    liftWeightPreference: 'kg' | 'pounds';
}

const initialState: SettingsState = { 
    bodyWeightPreference: 'kg',
    liftWeightPreference: 'kg',
};

const settingsSlice = createSlice({
    name: 'settings', 
    initialState, 
    reducers: { 
    setBodyWeightPreference: (state, action: PayloadAction<'kg' | 'pounds'>) => {
          state.bodyWeightPreference = action.payload;
        },
    setLiftWeightPreference: (state, action: PayloadAction<'kg' | 'pounds'>) => {
          state.liftWeightPreference = action.payload;
        },
      },
    });

export const { setBodyWeightPreference, setLiftWeightPreference } = settingsSlice.actions; 

export default settingsSlice.reducer; 
