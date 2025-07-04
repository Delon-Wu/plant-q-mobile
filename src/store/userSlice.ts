import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  phone: string;
  accessToken?: string; // 可选字段
  refreshToken?: string; // 可选字段
  // 可以根据需要添加更多用户信息字段
}

const initialState: UserState = {
  name: '',
  email: '',
  phone: '',
  accessToken: '',
  refreshToken: '',
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
    },
  },
});

export const selectIsLogin = (state: UserState) => !!state.accessToken && !!state.refreshToken;
export const { setUserInfo, clearUserStore, setToken } = userSlice.actions;
export default userSlice.reducer;
