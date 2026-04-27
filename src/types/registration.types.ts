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
  nationality?: string;
  emergencyContact?: string;
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