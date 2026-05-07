import apiClient, { handleApiError } from '../client';

export const registrationSessionApi = {
  // Check if registration is open (Public)
  checkRegistrationStatus: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/status');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get current open session (Public)
  getCurrentSession: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/current');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get upcoming sessions (Public)
  getUpcomingSessions: async () => {
    try {
      const response = await apiClient.get('/registration/sessions/upcoming');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Create session
  createSession: async (data: any) => {
    try {
      const response = await apiClient.post('/registration/sessions', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Update session
  updateSession: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/registration/sessions/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Get all sessions
  getAllSessions: async () => {
    try {
      const response = await apiClient.get('/registration/sessions');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Close session
  closeSession: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/sessions/${id}/close`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Activate session
  activateSession: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/sessions/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Admin: Delete session
  deleteSession: async (id: number) => {
    try {
      const response = await apiClient.delete(`/registration/sessions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};