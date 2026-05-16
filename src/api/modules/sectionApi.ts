import apiClient, { handleApiError } from '../client';

export const sectionApi = {
  getAllSections: async () => {
    try {
      const response = await apiClient.get('/grading/sections');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createSection: async (data: any) => {
    try {
      const response = await apiClient.post('/grading/sections', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateSection: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/grading/sections/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionsByCourse: async (courseId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/course/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMySections: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/instructor/current?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOpenSections: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/open?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionById: async (id: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteSection: async (id: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSectionStatus: async (id: number, status: string) => {
    try {
      const response = await apiClient.patch(`/grading/sections/${id}/status?status=${status}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionsBySemester: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionInstructors: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${sectionId}/instructors`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  addInstructorToSection: async (data: { sectionId: number; instructorId: number; courseId?: number }) => {
    try {
      const response = await apiClient.post(`/grading/sections/${data.sectionId}/instructors`, {
        instructorId: data.instructorId,
        courseId: data.courseId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  removeInstructorFromSection: async (sectionInstructorId: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/instructors/${sectionInstructorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },


  getSectionCourses: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${sectionId}/courses`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  addCourseToSection: async (data: { sectionId: number; courseId: number; schedule?: string; room?: string }) => {
    try {
      const response = await apiClient.post(`/grading/sections/${data.sectionId}/courses`, {
        courseId: data.courseId,
        schedule: data.schedule,
        room: data.room
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  removeCourseFromSection: async (sectionCourseId: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/courses/${sectionCourseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};