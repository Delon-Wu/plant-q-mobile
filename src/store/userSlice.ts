import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  phone: string;
  // 可以根据需要添加更多用户信息字段
}

const initialState: UserState = {
  name: '',
  email: '',
  phone: '',
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
    clearUserInfo(state) {
      state.name = '';
      state.email = '';
      state.phone = '';
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
