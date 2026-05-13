import apiClient, { handleApiError } from '../client';

interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  departmentId: number;
  faculty: string;
  enrollmentYear: number;
  studentType: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  departmentId?: number;
  faculty?: string;
  enrollmentYear?: number;
  studentType?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  role: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  role?: string;
}

export const registrationApi = {
  // Register a new student (Public endpoint - no auth required)
  registerStudent: async (studentData: StudentRegistrationData) => {
    try {
      const response = await apiClient.post('/registration/students/register', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllStudents: async () => {
    try {
      const response = await apiClient.get('/registration/students/');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by ID
  getStudentById: async (id: number) => {
    try {
      const response = await apiClient.get(`/registration/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by Student ID
  getStudentByStudentId: async (studentId: string) => {
    try {
      const response = await apiClient.get(`/registration/students/student-id/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update student
  updateStudent: async (id: number, studentData: UpdateStudentData) => {
    try {
      const response = await apiClient.put(`/registration/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate student
  deactivateStudent: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate student
  activateStudent: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search students
  searchStudents: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/registration/students/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by department
  getStudentsByDepartment: async (department: string) => {
    try {
      const response = await apiClient.get(`/registration/students/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by faculty
  getStudentsByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/registration/students/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student count
  getStudentCount: async () => {
    try {
      const response = await apiClient.get('/registration/students/count');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Admin User Management ==========
  
  // Get all instructors
  getAllInstructors: async () => {
    try {
      const response = await apiClient.get('/admin/users/instructors');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create instructor
  createInstructor: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/instructors', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createAcademicAdministrator: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/academic-administrators', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create management staff
  createManagementStaff: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/management', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get user statistics
  getUserStatistics: async () => {
    try {
      const response = await apiClient.get('/admin/users/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get user by ID
  getUserById: async (id: number) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update user
  updateUser: async (id: number, data: UpdateUserData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get academic administrators
  getAcademicAdministrators: async () => {
    try {
      const response = await apiClient.get('/admin/users/academic-administrators');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get management staff
  getManagementStaff: async () => {
    try {
      const response = await apiClient.get('/admin/users/management');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get ALL users (all roles)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate user
  deactivateUser: async (id: number) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate user
  activateUser: async (id: number) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search users
  searchUsers: async (keyword: string, role?: string) => {
    try {
      const url = role 
        ? `/admin/users/search?keyword=${keyword}&role=${role}`
        : `/admin/users/search?keyword=${keyword}`;
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};