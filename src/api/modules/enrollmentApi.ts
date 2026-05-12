import apiClient, { handleApiError } from '../client';

export const enrollmentApi = {
  // ========== Course-based Enrollment (Legacy) ==========
  
  enrollInCourse: async (data) => {
    try {
      const response = await apiClient.post('/grading/enrollments/course', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  withdrawFromCourse: async (enrollmentId) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/course/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentCourseEnrollments: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActiveCourseEnrollments: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}/active`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get enrollments by course CODE (old - keep for backward compatibility)
  getCourseEnrollmentsByCode: async (courseCode) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/courses/${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ GET ENROLLMENTS BY COURSE ID WITH SEMESTER/YEAR
  getCourseEnrollments: async (courseId, semester, academicYear) => {
    try {
      // Build URL with query parameters manually to ensure they're sent
      const url = `/grading/enrollments/course/${courseId}/students?semester=${encodeURIComponent(semester)}&academicYear=${academicYear}`;
      console.log('Fetching enrollments from:', url); // Debug log
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  isStudentEnrolledInCourse: async (studentId, courseCode) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/check?studentId=${studentId}&courseCode=${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Section-based Enrollment (New) ==========

  enrollInSection: async (studentId, sectionId, semester, academicYear) => {
    try {
      // ✅ Match the backend URL pattern
      const response = await apiClient.post(
        `/grading/enrollments/section/${sectionId}/student/${studentId}`,
        null,  // No request body
        { 
          params: { 
            semester: semester, 
            academicYear: academicYear 
          } 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  dropSection: async (enrollmentId) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/section/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentSectionEnrollments: async (studentId) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentSectionEnrollmentsBySemester: async (studentId, semester, academicYear) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionEnrollments: async (sectionId) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/sections/${sectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInstructorStudents: async (semester, academicYear) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/instructor/students?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  isStudentEnrolledInSection: async (studentId, sectionId) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/check?studentId=${studentId}&sectionId=${sectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionsBySemester: async (semester, academicYear) => {
    try {
      const response = await apiClient.get(`/grading/sections/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};