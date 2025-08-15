import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import { store } from '../store';
import { clearUserStore, setToken } from '../store/userSlice';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 创建实例
const apiClient: AxiosInstance = axios.create({
  baseURL: store.getState().settings.baseURL,
  timeout: 30000,
});

export enum WhiteList {
  login = '/accounts/login',
  register = '/accounts/register',
  refresh = '/accounts/login/refresh',
  sendCode = '/accounts/send-verification-code',
  verifyCode = '/accounts/verify-code',
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
    console.log('Final request config-->', config);
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

interface ErrorResponse {
  code?: number;
  message?: string;
  data?: any;
}

// 响应拦截器（可选）
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    // 打印详细错误信息
    if (error.toJSON) {
      console.error('Axios Error JSON:', error.toJSON());
    }
    
    // 网络连接错误的特殊处理
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network connection failed. Check if the server is running and accessible.');
      return Promise.reject({
        code: -1,
        message: '网络连接失败，请检查网络设置或服务器状态',
        data: null
      });
    }
    if (error.status === 401 && !error.config._retry) {
      if (error.config?.url !== WhiteList.refresh) {
        error.config._retry = true;
        // 如果是401错误且不是刷新token的请求，则尝试刷新token
        const tokenToRefresh = store.getState().user.refreshToken || '';
        if (tokenToRefresh) {
          const res = await apiClient.post(WhiteList.refresh, { refresh: tokenToRefresh });
          store.dispatch(setToken({ refreshToken: tokenToRefresh, accessToken: res.data.data.access }));
          error.config.headers['Authorization'] = `Bearer ${res.data.data.access}`;

          // 重新发送请求
          return apiClient(error.config);
        } else {
          store.dispatch(clearUserStore());
          router.replace('/login');
        }
      } else {
        store.dispatch(clearUserStore());
        router.replace('/login');
      }
    }
    return Promise.reject<ErrorResponse>(error.response?.data || { message: error.message });
  }
);

export default apiClient;