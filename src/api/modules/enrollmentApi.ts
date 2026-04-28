import apiClient, { handleApiError } from '../client';

export const enrollmentApi = {
  // Get student enrollments
  getStudentEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get active enrollments
  getActiveEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/students/${studentId}/active`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Enroll in course
  enrollCourse: async (data: { studentId: number; courseCode: string; semester: string; academicYear: number }) => {
    try {
      const response = await apiClient.post('/grading/enrollments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Withdraw from course
  withdrawCourse: async (enrollmentId: number) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};