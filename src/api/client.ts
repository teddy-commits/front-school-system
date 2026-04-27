import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
// For API calls (protected endpoints) - baseURL includes /api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
// For Auth calls (login/logout) - baseURL is just the server root
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Create axios instances
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Rest of your client.ts code remains the same...

// Request interceptor - Add Auth Token
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

// Response interceptor - Handle Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - Token expired
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

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data;
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

// Export types
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