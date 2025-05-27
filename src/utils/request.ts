import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import { AccessToken } from '../constant/localStorageKey';

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

enum WhiteList {
  login = '/accounts/login',
  register = '/accounts/register',
  refresh = '/accounts/refresh-token',
}
const whiteList = Object.values(WhiteList);

// 请求拦截器（可选）
apiClient.interceptors.request.use(
  (config: any) => {
    if (whiteList.includes(config.url ?? '')) {
      return config;
    }
    const token = localStorage.getItem(AccessToken); // 从存储中获取 token
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
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
    return response;
  },
  (error: any) => {
    const { url } = error.config;
    if (error.response?.status === 401) {
      if (url === WhiteList.refresh && error.response.data.code === 40101) {
        localStorage.removeItem(AccessToken);
      }
      router.replace('/login');
    }
    console.error('API Error:', error.response?.data);
    return Promise.reject<ErrorResponse>(error.response?.data || { message: error.message });
  }
);

// 通用请求函数，支持泛型
export default <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>, any>> => {
  return apiClient.request<ApiResponse<T>>(config).then(res => res.data);
};

// get请求函数，支持泛型
export const get = <T>(url: string, params?: any) => 
  apiClient.get<ApiResponse<T>>(url, params).then(res => res.data) as Promise<ApiResponse<T>>;

// post请求函数，支持泛型
export const post = <T>(url: string, params?: any) =>
  apiClient.post<ApiResponse<T>>(url, params).then(res => res.data) as Promise<ApiResponse<T>>;