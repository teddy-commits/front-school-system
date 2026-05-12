import apiClient, { handleApiError } from '../client';

export const courseApi = {
  // Create a new course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/grading/courses', courseData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/grading/courses');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await apiClient.get(`/grading/courses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get course by code
  getCourseByCode: async (code) => {
    try {
      const response = await apiClient.get(`/grading/courses/code/${code}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    try {
      const response = await apiClient.put(`/grading/courses/${id}`, courseData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await apiClient.delete(`/grading/courses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search courses
  searchCourses: async (keyword) => {
    try {
      const response = await apiClient.get(`/grading/courses/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get courses by department
  getCoursesByDepartment: async (department) => {
    try {
      const response = await apiClient.get(`/grading/courses/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get courses by faculty
  getCoursesByFaculty: async (faculty) => {
    try {
      const response = await apiClient.get(`/grading/courses/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get courses by semester
  getCoursesBySemester: async (semester, academicYear) => {
    try {
      const response = await apiClient.get(`/grading/courses/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get courses by instructor (by email)
  getCoursesByInstructor: async (instructorEmail) => {
    try {
      const response = await apiClient.get(`/grading/courses/instructor/${instructorEmail}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get courses for the logged-in instructor (based on their department)
 getMyCourses: async (semester, academicYear) => {
    try {
      const response = await apiClient.get('/grading/sections/instructor/my-courses', {
        params: {
          semester: semester, 
          academicYear: academicYear
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get available courses for the logged-in instructor (based on their department)
  getAvailableCoursesForInstructor: async () => {
    try {
      const response = await apiClient.get('/grading/courses/instructor/available');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update course status
  updateCourseStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/grading/courses/${id}/status?status=${status}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default courseApi;