import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.1.9:5000/', // Use /api prefix
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach token if available
    if (global.authToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${global.authToken}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

export default api; 