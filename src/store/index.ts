import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { SecureStoreStorage } from './secureStore';
import settingsReducer from './settingsSlice';
import userReducer from './userSlice';

const persistConfig = {
  key: 'user',
  storage: Platform.OS === "web" ? AsyncStorage : SecureStoreStorage,
  whitelist: ['name', 'email', 'phone', 'accessToken', 'refreshToken'],
  keyPrefix: '',
  // 增加错误处理
  serialize: true,
  writeFailHandler: (err: Error) => {
    console.warn('Redux persist write failed:', err.message);
  },
  // 添加超时设置
  timeout: 10000,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // 在生产环境中减少检查以提高性能
      immutableCheck: __DEV__,
      thunk: true,
    }),
  // 只在开发环境启用 DevTools
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
