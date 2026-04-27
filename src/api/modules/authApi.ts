import { authClient, apiClient, handleApiError } from '../client';
import toast from 'react-hot-toast';

// Define types locally to avoid import issues
export interface LoginResponse {
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

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  additionalRoles: string[];
  studentId: string | null;
  employeeId: string | null;
  department: string;
  faculty: string;
  designation: string;
  qualification: string;
  isActive: boolean;
  createdAt: string;
  permissions: string;
}

export const authApi = {
  // Login user - works with both email (staff) and student ID (students)
  login: async (id, password) => {
    try {
      const response = await authClient.post('/login', { id, password });
      
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

  // Logout user
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

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Get user from local storage
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authApi.getUserRole();
    return userRole === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = authApi.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },
};