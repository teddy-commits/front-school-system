import apiClient, { handleApiError } from '../client';

export const semesterRegistrationApi = {
  initiateRegistration: async (data: {
    studentId: number;
    semester: string;
    academicYear: number;
    courseIds: number[];
  }) => {
    try {
      const response = await apiClient.post('/semester-registration/initiate', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  addCourses: async (registrationId: number, courseIds: number[]) => {
    try {
      const response = await apiClient.post(`/semester-registration/${registrationId}/courses`, courseIds);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  removeCourse: async (registrationId: number, courseId: number) => {
    try {
      const response = await apiClient.delete(`/semester-registration/${registrationId}/courses/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  completeRegistration: async (registrationId: number) => {
    try {
      const response = await apiClient.post(`/api/v1/semester-registration/${registrationId}/complete`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  processPayment: async (registrationId: number, paymentReference: string, amount: number) => {
    try {
      const response = await apiClient.post(
        `/semester-registration/${registrationId}/pay?paymentReference=${paymentReference}&amount=${amount}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentRegistrations: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/semester-registration/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get current semester registration
  getCurrentRegistration: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/semester-registration/students/${studentId}/current`);
      if (response.status === 204) {
        return { success: true, data: null };
      }
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  canRegister: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(
        `/semester-registration/students/${studentId}/can-register?semester=${semester}&academicYear=${academicYear}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};