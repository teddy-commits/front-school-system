export interface StudentRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  dateOfBirth?: string;
  emergencyContact?: string;
  nationality?: string;
}

export interface StudentRegistrationResponse {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  registrationStatus: string;
  registrationDate: string;
  message: string;
}

export interface StudentProfileResponse {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  cgpa: number;
  currentSemester: string;
  totalCredits: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserCreationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  designation?: string;
  qualification?: string;
  department?: string;
  faculty?: string;
  joiningDate?: string;
  salary?: number;
  position?: string;
  division?: string;
}

export interface UserProfileResponse {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  userType: string;
  department: string;
  faculty: string;
  designation: string;
  qualification: string;
  isActive: boolean;
  createdAt: string;
  permissions: string;
}

export interface UserStatistics {
  totalStudents: number;
  totalInstructors: number;
  totalAcademicAdministrators: number;
  totalManagementStaff: number;
  totalAdmins: number;
  totalActiveUsers: number;
  totalUsers: number;
}