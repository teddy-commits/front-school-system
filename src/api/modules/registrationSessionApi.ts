import apiClient, { handleApiError } from '../client';

export const registrationSessionApi = {
  checkRegistrationStatus: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/status');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCurrentSession: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/current');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  getUpcomingSessions: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/upcoming');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createSession: async (data: any) => {
    try {
      const response = await apiClient.post('/registration/sessions', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSession: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/registration/sessions/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllSessions: async () => {
    try {
      const response = await apiClient.get('/registration/sessions');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  closeSession: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/sessions/${id}/close`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  activateSession: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/sessions/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteSession: async (id: number) => {
    try {
      const response = await apiClient.delete(`/registration/sessions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};