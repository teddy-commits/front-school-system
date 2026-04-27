import { authClient, apiClient, handleApiError } from '../client';
import toast from 'react-hot-toast';

export const authApi = {
  login: async (id, password) => {
    try {
      const response = await authClient.post('/auth/login', { id, password });
      
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userRole', response.data.role);
      }
      
      return { success: true, data: response.data };
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
      return { success: true, data: response.data };
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
      return JSON.parse(userStr);
    }
    return null;
  },

  getUserRole: () => {
    return localStorage.getItem('userRole');
  },
  hasRole: (role) => {
    const userRole = authApi.getUserRole();
    return userRole === role;
  },
  hasAnyRole: (roles) => {
    const userRole = authApi.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },
};