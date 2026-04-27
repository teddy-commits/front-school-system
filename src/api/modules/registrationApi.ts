import apiClient, { handleApiError } from '../client';

export const registrationApi = {
  // Register a new student (Public endpoint - no auth required)
  registerStudent: async (studentData) => {
    try {
      const response = await apiClient.post('/api/v1/registration/students/register', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all students (Requires authentication - Admin only)
  getAllStudents: async () => {
    try {
      const response = await apiClient.get('/api/v1/registration/students');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by ID (Requires authentication)
  getStudentById: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by Student ID (e.g., STU20240001)
  getStudentByStudentId: async (studentId) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/student-id/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student by email
  getStudentByEmail: async (email) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/email/${email}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await apiClient.put(`/api/v1/registration/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate student (Admin only)
  deactivateStudent: async (id) => {
    try {
      const response = await apiClient.patch(`/api/v1/registration/students/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate student (Admin only)
  activateStudent: async (id) => {
    try {
      const response = await apiClient.patch(`/api/v1/registration/students/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search students
  searchStudents: async (keyword) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by department
  getStudentsByDepartment: async (department) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by faculty
  getStudentsByFaculty: async (faculty) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get students by enrollment year
  getStudentsByYear: async (year) => {
    try {
      const response = await apiClient.get(`/api/v1/registration/students/year/${year}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student count
  getStudentCount: async () => {
    try {
      const response = await apiClient.get('/api/v1/registration/students/count');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};