import apiClient, { handleApiError } from '../client';

export const departmentApi = {
  // Create department
  createDepartment: async (data: any) => {
    try {
      const response = await apiClient.post('/api/v1/departments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update department
  updateDepartment: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/api/v1/departments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await apiClient.get('/api/v1/departments');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get active departments
  getActiveDepartments: async () => {
    try {
      const response = await apiClient.get('/api/v1/departments/active');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get department by ID
  getDepartmentById: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/v1/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get department by code
  getDepartmentByCode: async (code: string) => {
    try {
      const response = await apiClient.get(`/api/v1/departments/code/${code}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get departments by faculty
  getDepartmentsByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/api/v1/departments/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search departments
  searchDepartments: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/api/v1/departments/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete department
  deleteDepartment: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/v1/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate department
  activateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/api/v1/departments/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate department
  deactivateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/api/v1/departments/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};