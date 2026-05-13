import { authClient, apiClient, handleApiError } from '../client';
import toast from 'react-hot-toast';

interface LoginResponse {
  token: string;
  tokenType: string;
  id: number;
  fullName: string;
  email: string;
  studentId: string | null;
  employeeId: string | null;
  loginId: string;
  role: string;
  additionalRoles: string[];
  userType: string;
  message: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  loginId: string;
  userType: string;
}

export const authApi = {
  login: async (id: string, password: string) => {
    try {
      const response = await authClient.post('/auth/login', { id, password });
      
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userRole', response.data.role);
      }
      
      return { success: true, data: response.data as LoginResponse };
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await authClient.post('/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      return { success: true, data: null };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return { success: true, data: response.data as User };
    } catch (error) {
      return handleApiError(error);
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  },

  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  hasRole: (role: string) => {
    const userRole = authApi.getUserRole();
    return userRole === role;
  },

  hasAnyRole: (roles: string[]) => {
    const userRole = authApi.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },
};