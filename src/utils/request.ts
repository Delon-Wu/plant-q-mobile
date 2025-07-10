import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import { refreshToken } from '../api/account';
import { store } from '../store';
import { clearUserStore, setToken } from '../store/userSlice';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 创建实例
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export enum WhiteList {
  login = '/accounts/login',
  register = '/accounts/register',
  refresh = '/accounts/login/refresh',
}
const whiteList = Object.values(WhiteList);

// 请求拦截器（可选）
apiClient.interceptors.request.use(
  (config: any) => {
    const host = store.getState().settings.host;
    if (host) {
      config.baseURL = host + '/api';
    }
    if (whiteList.includes(config.url ?? '')) {
      return config;
    } else {
      const userInfo = store.getState().user;
      console.log('userInfo-->', userInfo);
      if (userInfo?.accessToken) {
        config.headers = { ...config.headers, Authorization: `Bearer ${userInfo.accessToken}` };
      }
    }
    console.log('config-->', config);
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

interface ErrorResponse {
  code?: number;
  message?: string;
  data?: any;
}
let cont = 5;
// 响应拦截器（可选）
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // 打印详细错误信息
    if (error.toJSON) {
      console.log('Axios Error JSON:', error.toJSON());
    }
    if (error.status === 401) {
      console.log('error-->', error);
      if (error.config?.url !== WhiteList.refresh) {
        // 如果是401错误且不是刷新token的请求，则尝试刷新token
        const tokenToRefresh = store.getState().user.refreshToken || '';
        if (tokenToRefresh) {
          // TODO: 根据返回数据里的code === 40101来判断token是否过期
          const res = await refreshToken(tokenToRefresh);
          store.dispatch(setToken({ refreshToken: tokenToRefresh, accessToken: res.data.data.access }));
        } else {
          store.dispatch(clearUserStore());
          router.replace('/login');
        }
      } else {
        store.dispatch(clearUserStore());
        router.replace('/login');
      }
    }
    console.error('API Error:', error.response?.data);
    return Promise.reject<ErrorResponse>(error.response?.data || { message: error.message });
  }
);

export default apiClient;