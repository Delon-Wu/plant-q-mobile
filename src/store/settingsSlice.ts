import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  host: string;
}

const initialState: SettingsState = {
  host: '',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHost(state, action: PayloadAction<string>) {
      state.host = action.payload;
    },
  },
});

export const { setHost } = settingsSlice.actions;
export default settingsSlice.reducer;
