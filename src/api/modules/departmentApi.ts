import apiClient, { handleApiError } from '../client';

export const departmentApi = {
  createDepartment: async (data: any) => {
    try {
      const response = await apiClient.post('/departments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateDepartment: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/departments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllDepartments: async () => {
    try {
      const response = await apiClient.get('/departments');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActiveDepartments: async () => {
    try {
      const response = await apiClient.get('/departments/active');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDepartmentById: async (id: number) => {
    try {
      const response = await apiClient.get(`/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDepartmentByCode: async (code: string) => {
    try {
      const response = await apiClient.get(`/departments/code/${code}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDepartmentsByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/departments/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchDepartments: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/departments/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteDepartment: async (id: number) => {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  activateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deactivateDepartment: async (id: number) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};