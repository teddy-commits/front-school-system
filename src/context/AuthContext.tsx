import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/modules/authApi';
import toast from 'react-hot-toast';

// Define types inline to avoid import issues
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

type Role = string;

interface AuthContextType {
  user: LoginResponse | null;
  isLoading: boolean;
  login: (id: string, password: string, userType: 'student' | 'staff') => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: string | null;
  userType: 'student' | 'staff' | null;
  hasRole: (role: string | string[]) => boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isManagement: boolean;
  userFullName: string | null;
  userId: number | null;
  userLoginId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userType');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (id: string, password: string, userType: 'student' | 'staff'): Promise<boolean> => {
    setIsLoading(true);
    
    const result = await authApi.login(id, password);
    
    if (result.success && result.data) {
      setUser(result.data);
      localStorage.setItem('userType', userType);
      setIsLoading(false);
      
      if (userType === 'student') {
        toast.success(`Welcome Student: ${result.data.fullName}!`);
      } else {
        toast.success(`Welcome, ${result.data.fullName}!`);
      }
      return true;
    }
    
    setIsLoading(false);
    toast.error(result.message || 'Login failed. Please check your credentials.');
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await authApi.logout();
    setUser(null);
    setIsLoading(false);
    toast.success('Logged out successfully');
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const isStudent = user?.role === 'STUDENT' || user?.role === 'UNDERGRADUATE_STUDENT' || user?.role === 'POSTGRADUATE_STUDENT';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'PROFESSOR' || user?.role === 'SENIOR_INSTRUCTOR';
  const isManagement = user?.role === 'MANAGEMENT' || user?.role === 'FINANCE_MANAGER' || user?.role === 'HR_MANAGER';

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role || null,
    userType: localStorage.getItem('userType') as 'student' | 'staff' | null,
    hasRole,
    isStudent,
    isAdmin,
    isInstructor,
    isManagement,
    userFullName: user?.fullName || null,
    userId: user?.id || null,
    userLoginId: user?.loginId || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};