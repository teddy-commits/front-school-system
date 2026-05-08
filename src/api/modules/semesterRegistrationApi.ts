import apiClient, { handleApiError } from '../client';

export const semesterRegistrationApi = {
  // Initiate semester registration
  initiateRegistration: async (data: {
    studentId: number;
    semester: string;
    academicYear: number;
    courseIds: number[];
  }) => {
    try {
      const response = await apiClient.post('/api/v1/semester-registration/initiate', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add courses to existing registration
  addCourses: async (registrationId: number, courseIds: number[]) => {
    try {
      const response = await apiClient.post(`/api/v1/semester-registration/${registrationId}/courses`, courseIds);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Remove course from registration
  removeCourse: async (registrationId: number, courseId: number) => {
    try {
      const response = await apiClient.delete(`/api/v1/semester-registration/${registrationId}/courses/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Complete registration
  completeRegistration: async (registrationId: number) => {
    try {
      const response = await apiClient.post(`/api/v1/semester-registration/${registrationId}/complete`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Process payment
  processPayment: async (registrationId: number, paymentReference: string, amount: number) => {
    try {
      const response = await apiClient.post(
        `/api/v1/semester-registration/${registrationId}/pay?paymentReference=${paymentReference}&amount=${amount}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student's semester registrations
  getStudentRegistrations: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/api/v1/semester-registration/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get current semester registration
  getCurrentRegistration: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/api/v1/semester-registration/students/${studentId}/current`);
      if (response.status === 204) {
        return { success: true, data: null };
      }
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if student can register for semester
  canRegister: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(
        `/api/v1/semester-registration/students/${studentId}/can-register?semester=${semester}&academicYear=${academicYear}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};