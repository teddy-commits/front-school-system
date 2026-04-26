import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080/auth';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient: AxiosInstance = axios.create({
  baseURL: AUTH_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
     
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

export const handleApiError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response) {
      const message = axiosError.response.data?.message || 
                     axiosError.response.data?.error || 
                     'An error occurred';
      return { success: false, message, status: axiosError.response.status };
    } else if (axiosError.request) {
      // Request made but no response
      return { success: false, message: 'Network error. Please check your connection.', status: 0 };
    }
  }
  
  return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred', status: 0 };
};

export default apiClient;