import apiClient, { handleApiError } from '../client';

export const sectionApi = {
  // Get all sections (Admin/Academic Admin only)
  getAllSections: async () => {
    try {
      const response = await apiClient.get('/grading/sections');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create a section (Admin/Academic Admin only)
  createSection: async (data: any) => {
    try {
      const response = await apiClient.post('/grading/sections', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update a section
  updateSection: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/grading/sections/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all sections for a course
  getSectionsByCourse: async (courseId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/course/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get instructor's sections (for instructor dashboard)
  getMySections: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/instructor/current?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get open sections for student registration
  getOpenSections: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/open?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get section by ID
  getSectionById: async (id: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete a section
  deleteSection: async (id: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update section status
  updateSectionStatus: async (id: number, status: string) => {
    try {
      const response = await apiClient.patch(`/grading/sections/${id}/status?status=${status}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get sections by semester
  getSectionsBySemester: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Section Instructor Management ==========
  
  // Get section instructors
  getSectionInstructors: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${sectionId}/instructors`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add instructor to section
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

  // Remove instructor from section
  removeInstructorFromSection: async (sectionInstructorId: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/instructors/${sectionInstructorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Section Course Management ==========
  
  // Get section courses
  getSectionCourses: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/sections/${sectionId}/courses`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add course to section
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

  // Remove course from section
  removeCourseFromSection: async (sectionCourseId: number) => {
    try {
      const response = await apiClient.delete(`/grading/sections/courses/${sectionCourseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};