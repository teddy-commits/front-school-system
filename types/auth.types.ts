export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  id: number;
  fullName: string;
  email: string;
  studentId: string | null;
  employeeId: string | null;
  loginId: string;
  role: Role;
  additionalRoles: Role[];
  userType: UserType;
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
  role: Role;
  additionalRoles: Role[];
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

export type Role = 
  | 'STUDENT' 
  | 'UNDERGRADUATE_STUDENT' 
  | 'POSTGRADUATE_STUDENT'
  | 'INSTRUCTOR' 
  | 'PROFESSOR' 
  | 'ACADEMIC_ADMINISTRATOR'
  | 'MANAGEMENT' 
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export type UserType = 'STUDENT' | 'INSTRUCTOR' | 'ACADEMIC_ADMINISTRATOR' | 'MANAGEMENT' | 'ADMIN' | 'USER';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}