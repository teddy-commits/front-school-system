import apiClient, { handleApiError } from '../client';

export const departmentApi = {
  // Create department
  createDepartment: async (data: any) => {
    try {
      const response = await apiClient.post('/departments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update department
  updateDepartment: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/departments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await apiClient.get('/departments');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get active departments
  getActiveDepartments: async () => {
    try {
      const response = await apiClient.get('/departments/active');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get department by ID
  getDepartmentById: async (id: number) => {
    try {
      const response = await apiClient.get(`/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get department by code
  getDepartmentByCode: async (code: string) => {
    try {
      const response = await apiClient.get(`/departments/code/${code}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get departments by faculty
  getDepartmentsByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/departments/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search departments
  searchDepartments: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/departments/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete department
  deleteDepartment: async (id: number) => {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activate department
  activateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deactivate department
  deactivateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};