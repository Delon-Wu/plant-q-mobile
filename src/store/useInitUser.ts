import { getUserInfo } from '@/src/api/account';
import { AccessToken, RefreshToken } from '@/src/constants/localStorageKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUserInfo } from './userSlice';

export default function useInitUser() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.user);
  
  useEffect(() => {
    (async () => {
      const accessToken = await AsyncStorage.getItem(AccessToken) || '';
      const refreshToken = await AsyncStorage.getItem(RefreshToken) || '';
      if (accessToken || refreshToken) {
        dispatch(setToken({
          accessToken,
          refreshToken,
        }));
        // 如果用户信息为空，自动获取用户信息
        if (!userInfo?.email) {
          try {
            const { data } = await getUserInfo();
            dispatch(setUserInfo({
              name: data.username,
              email: data.email,
              phone: data.phone,
            }));
          } catch (e) {
            // ignore
          }
        }
      }
    })();
  }, [dispatch, userInfo?.email]);
}
