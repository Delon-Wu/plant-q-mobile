import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { SecureStoreStorage } from './secureStore';
import settingsReducer from './settingsSlice';
import userReducer from './userSlice';

const persistConfig = {
  key: 'user',
  storage: SecureStoreStorage,
  whitelist: ['name', 'email', 'phone', 'accessToken', 'refreshToken'],
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    settings: settingsReducer,
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
