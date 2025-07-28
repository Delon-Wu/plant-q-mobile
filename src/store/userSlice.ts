import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  phone: string;
  accessToken?: string; // 可选字段
  refreshToken?: string; // 可选字段
  position?: {
    latitude: number | null;
    longitude: number | null;
  };
}

const initialState: UserState = {
  name: '',
  email: '',
  phone: '',
  accessToken: '',
  refreshToken: '',
  position: { latitude: null, longitude: null },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<UserState>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
    },
    setToken(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearUserStore(state) {
      state.name = '';
      state.email = '';
      state.phone = '';
      state.accessToken = '';
      state.refreshToken = '';
      state.position = { latitude: null, longitude: null };
    },
    setPosition(state, action: PayloadAction<{ latitude: number | null; longitude: number | null }>) {
      state.position.latitude = action.payload.latitude;
      state.position.longitude = action.payload.longitude;
    },
  },
});

export const selectIsLogin = (state: UserState) => !!state.accessToken && !!state.refreshToken;
export const { setUserInfo, clearUserStore, setToken, setPosition } = userSlice.actions;
export default userSlice.reducer;
