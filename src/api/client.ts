import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      
      toast.error('Session expired. Please login again.');
      
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/')) {
        window.location.href = '/login/staff';
      }
      return Promise.reject(error);
    }
    
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Invalid request';
      toast.error(message);
    }
    
    if (error.response?.status === 404) {
      toast.error('Resource not found');
    }
    
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data as { message?: string; error?: string };
      const message = data?.message || data?.error || 'An error occurred';
      return {
        success: false,
        message,
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }
  
  return {
    success: false,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 0,
  };
};

export type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
  status: number;
  errors?: Record<string, string>;
};

export default apiClient;