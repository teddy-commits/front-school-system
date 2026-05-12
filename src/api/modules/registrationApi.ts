import apiClient, { handleApiError } from '../client';

export const registrationApi = {
  // Register a new student (Public endpoint - no auth required)
  registerStudent: async (studentData) => {
    try {
      const response = await apiClient.post('/registration/students/register', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all students (Requires authentication - Admin only)
  getAllStudents: async () => {
    try {
      const response = await apiClient.get('/registration/students/');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await apiClient.get(`/registration/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by Student ID
  getStudentByStudentId: async (studentId) => {
    try {
      const response = await apiClient.get(`/registration/students/student-id/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await apiClient.put(`/registration/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate student
  deactivateStudent: async (id) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate student
  activateStudent: async (id) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search students
  searchStudents: async (keyword) => {
    try {
      const response = await apiClient.get(`/registration/students/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by department
  getStudentsByDepartment: async (department) => {
    try {
      const response = await apiClient.get(`/registration/students/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by faculty
  getStudentsByFaculty: async (faculty) => {
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
  createInstructor: async (data) => {
    try {
      const response = await apiClient.post('/admin/users/instructors', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  createAcademicAdministrator: async (data) => {
    try {
      const response = await apiClient.post('/admin/users/academic-administrators', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create management staff
  createManagementStaff: async (data) => {
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
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update user
  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate user
  deactivateUser: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate user
  activateUser: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search users
  searchUsers: async (keyword, role) => {
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