import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface SettingsState {
  host: string;
  baseURL: string;
}

const initialState: SettingsState = {
  host: process.env.NODE_ENV === 'development' && Platform.OS !== "web" ? process.env.EXPO_PUBLIC_DEV_API_HOST ?? '' : '',
  baseURL: process.env.NODE_ENV === 'development' && Platform.OS !== "web" ? (process.env.EXPO_PUBLIC_DEV_API_HOST ?? '') + '/api' : (process.env.EXPO_PUBLIC_API_BASE_URL ?? ''),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHost(state, action: PayloadAction<string>) {
      state.host = action.payload;
      state.baseURL = action.payload + '/api';
    },
  },
});

export const { setHost } = settingsSlice.actions;
export default settingsSlice.reducer;
