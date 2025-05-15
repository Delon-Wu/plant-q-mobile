import axios from "axios";

// 创建实例
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const loginURL = "/accounts/login";

// 白名单
const whiteList = [
  loginURL,
  "/accounts/register",
  "/accounts/refresh-token",
];

// 请求拦截器（可选）
apiClient.interceptors.request.use(
  (config) => {
    // const token = "YOUR_TOKEN"; // 从存储中获取 token
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log("config.url-->", config.url);
    // if (!whiteList.includes(config.url) && config.headers.Authorization === undefined) {
    //   refreshToken().then((res) => {
    //     apiClient.defaults.headers.common["Authorization"] = `Bearer ${res.accessToken}`;
    //   });
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器（可选）
apiClient.interceptors.response.use(
  (response) => {
    // 获取请求配置
    const { url } = response.config;

    if (url === loginURL) {
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
    }
    return response.data
  },
  (error) => {
    // TODO: 请求失败清除token
    console.error("API Error:", error.response?.data);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
