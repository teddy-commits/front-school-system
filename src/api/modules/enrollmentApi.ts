import apiClient, { handleApiError } from '../client';

interface EnrollInCourseData {
  studentId: number;
  courseCode: string;
  semester?: string;
  academicYear?: number;
}

interface EnrollInSectionData {
  studentId: number;
  sectionId: number;
  semester?: string;
  academicYear?: number;
}

interface GetCourseEnrollmentsParams {
  courseId: number;
  semester: string;
  academicYear: number;
  sectionId?: number;
}

export const enrollmentApi = {
  
  enrollInCourse: async (data: EnrollInCourseData) => {
    try {
      const response = await apiClient.post('/grading/enrollments/course', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  withdrawFromCourse: async (enrollmentId: number) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/course/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentCourseEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActiveCourseEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/students/${studentId}/active`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCourseEnrollmentsByCode: async (courseCode: string) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/courses/${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getCourseEnrollments: async (courseId: number, semester: string, academicYear: number, sectionId?: number) => {
    try {
      let url = `/grading/enrollments/course/${courseId}/students?semester=${encodeURIComponent(semester)}&academicYear=${academicYear}`;
      
      if (sectionId) {
        url += `&sectionId=${sectionId}`;
      }
      
      console.log('Fetching enrollments from:', url);
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  isStudentEnrolledInCourse: async (studentId: number, courseCode: string) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/course/check?studentId=${studentId}&courseCode=${courseCode}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  enrollInSection: async ({ studentId, sectionId, semester, academicYear }: EnrollInSectionData) => {
    try {
      const response = await apiClient.post(
        `/grading/enrollments/section/${sectionId}/student/${studentId}`,
        null,
        { 
          params: { 
            semester: semester || 'FALL', 
            academicYear: academicYear || new Date().getFullYear() 
          } 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  dropSection: async (enrollmentId: number) => {
    try {
      const response = await apiClient.delete(`/grading/enrollments/section/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentSectionEnrollments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentSectionEnrollmentsBySemester: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/students/${studentId}/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSectionEnrollments: async (sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/sections/${sectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInstructorStudents: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/instructor/students?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  isStudentEnrolledInSection: async (studentId: number, sectionId: number) => {
    try {
      const response = await apiClient.get(`/grading/enrollments/section/check?studentId=${studentId}&sectionId=${sectionId}`);
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
};