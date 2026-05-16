import apiClient, { handleApiError } from '../client';

interface CourseData {
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  faculty: string;
  description?: string;
  prerequisites?: string;
  status?: string;
}

interface UpdateCourseData {
  courseCode?: string;
  courseName?: string;
  credits?: number;
  department?: string;
  faculty?: string;
  description?: string;
  prerequisites?: string;
  status?: string;
}

export const courseApi = {
  createCourse: async (courseData: CourseData) => {
    try {
      const response = await apiClient.post('/grading/courses', courseData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/grading/courses');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  getCourseById: async (id: number) => {
    try {
      const response = await apiClient.get(`/grading/courses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCourseByCode: async (code: string) => {
    try {
      const response = await apiClient.get(`/grading/courses/code/${code}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateCourse: async (id: number, courseData: UpdateCourseData) => {
    try {
      const response = await apiClient.put(`/grading/courses/${id}`, courseData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteCourse: async (id: number) => {
    try {
      const response = await apiClient.delete(`/grading/courses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchCourses: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/grading/courses/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCoursesByDepartment: async (department: string) => {
    try {
      const response = await apiClient.get(`/grading/courses/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCoursesByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/grading/courses/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCoursesBySemester: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/courses/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCoursesByInstructor: async (instructorEmail: string) => {
    try {
      const response = await apiClient.get(`/grading/courses/instructor/${instructorEmail}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMyCourses: async (semester: string, academicYear: number) => {
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

  getAvailableCoursesForInstructor: async () => {
    try {
      const response = await apiClient.get('/grading/courses/instructor/available');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateCourseStatus: async (id: number, status: string) => {
    try {
      const response = await apiClient.patch(`/grading/courses/${id}/status?status=${status}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default courseApi;