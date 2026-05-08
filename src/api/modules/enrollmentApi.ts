import apiClient, { handleApiError } from '../client';

export const enrollmentApi = {
  // ========== Course-based Enrollment (Legacy) ==========
  
  // Enroll in a course
  enrollInCourse: async (data: { studentId: number; courseCode: string; semester?: string; academicYear?: number }) => {
    try {
      const response = await apiClient.post('/grading/enrollments/course', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Withdraw from course
  withdrawFromCourse: async (enrollmentId: number) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/course/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student's course enrollments
  getStudentCourseEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student's active course enrollments
  getActiveCourseEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}/active`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get course enrollments (for instructors)
  getCourseEnrollments: async (courseCode: string) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/courses/${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if student is enrolled in a course
  isStudentEnrolledInCourse: async (studentId: number, courseCode: string) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/check?studentId=${studentId}&courseCode=${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Section-based Enrollment (New) ==========

  // Enroll in a section
  enrollInSection: async (data: { studentId: number; sectionId: number }) => {
    try {
      const response = await apiClient.post('/grading/enrollments/section', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Drop a section
  dropSection: async (enrollmentId: number) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/section/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student's section enrollments
  getStudentSectionEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student's section enrollments by semester
  getStudentSectionEnrollmentsBySemester: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all enrollments for a section (instructor view)
  getSectionEnrollments: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/sections/${sectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get instructor's students (all sections)
  getInstructorStudents: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/instructor/students?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if student is enrolled in a section
  isStudentEnrolledInSection: async (studentId: number, sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/check?studentId=${studentId}&sectionId=${sectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};