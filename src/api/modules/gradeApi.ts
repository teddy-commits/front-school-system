import apiClient, { handleApiError } from '../client';

export const gradeApi = {
  // ========== Grade Management ==========
  
  // Submit grade for a student
  submitGrade: async (data) => {
    try {
      const response = await apiClient.post('/grading/grades/submit', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all grades for a student
  getStudentGrades: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/students/${studentId}/grades`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all grades for a course
  getCourseGrades: async (courseCode) => {
    try {
      const response = await apiClient.get(`/grading/courses/${courseCode}/grades`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update grade
  updateGrade: async (gradeId, data) => {
    try {
      const response = await apiClient.put(`/grading/grades/${gradeId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student transcript
  getStudentTranscript: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/students/${studentId}/transcript`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student CGPA
  getStudentCGPA: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/students/${studentId}/cgpa`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Publish grades for a course
  publishGrades: async (courseCode) => {
    try {
      const response = await apiClient.post(`/grading/courses/${courseCode}/publish`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get grade statistics for a course
  getCourseGradeStats: async (courseCode) => {
    try {
      const response = await apiClient.get(`/grading/courses/${courseCode}/grades/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};
