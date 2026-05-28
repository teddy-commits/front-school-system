import apiClient, { handleApiError } from '../client';

interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  departmentId: number;
  faculty: string;
  enrollmentYear: number;
  studentType: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  departmentId?: number;
  faculty?: string;
  enrollmentYear?: number;
  studentType?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  role: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  role?: string;
}

export const registrationApi = {
  registerStudent: async (studentData: StudentRegistrationData) => {
    try {
      const response = await apiClient.post('/registration/students/register', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllStudents: async () => {
    try {
      const response = await apiClient.get('/registration/students/');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentById: async (id: number) => {
    try {
      const response = await apiClient.get(`/registration/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentByStudentId: async (studentId: string) => {
    try {
      const response = await apiClient.get(`/registration/students/student-id/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateStudent: async (id: number, studentData: UpdateStudentData) => {
    try {
      const response = await apiClient.put(`/registration/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deactivateStudent: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  activateStudent: async (id: number) => {
    try {
      const response = await apiClient.patch(`/registration/students/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchStudents: async (keyword: string) => {
    try {
      const response = await apiClient.get(`/registration/students/search?keyword=${keyword}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentsByDepartment: async (department: string) => {
    try {
      const response = await apiClient.get(`/registration/students/department/${department}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentsByFaculty: async (faculty: string) => {
    try {
      const response = await apiClient.get(`/registration/students/faculty/${faculty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentCount: async () => {
    try {
      const response = await apiClient.get('/registration/students/count');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllInstructors: async () => {
    try {
      const response = await apiClient.get('/admin/users/instructors');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createInstructor: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/instructors', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createAcademicAdministrator: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/academic-administrators', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createManagementStaff: async (data: UserData) => {
    try {
      const response = await apiClient.post('/admin/users/management', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserStatistics: async () => {
    try {
      const response = await apiClient.get('/admin/users/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserById: async (id: number) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  updateUser: async (id: number, data: UpdateUserData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAcademicAdministrators: async () => {
    try {
      const response = await apiClient.get('/admin/users/academic-administrators');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getManagementStaff: async () => {
    try {
      const response = await apiClient.get('/admin/users/management');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deactivateUser: async (id: number) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/deactivate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  activateUser: async (id: number) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchUsers: async (keyword: string, role?: string) => {
    try {
      const url = role 
        ? `/admin/users/search?keyword=${keyword}&role=${role}`
        : `/admin/users/search?keyword=${keyword}`;
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAvailableCoursesForStudent: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/registration/students/${studentId}/available-courses`, {
        params: { semester, academicYear }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentRegisteredCourses: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/registration/students/${studentId}/registered-courses`, {
        params: { semester, academicYear }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  registerCourse: async (data: { studentId: number; courseId: number; semester: string; academicYear: number }) => {
    try {
      const response = await apiClient.post('/registration/courses/register', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  dropCourse: async (studentId: number, courseId: number, semester: string, academicYear: number, reason?: string) => {
    try {
      const response = await apiClient.delete('/registration/courses/drop', {
        params: { studentId, courseId, semester, academicYear, reason }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRegistrationSummary: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/registration/students/${studentId}/summary`, {
        params: { semester, academicYear }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== NEW METHODS FOR COURSE ASSIGNMENT ==========

  /**
   * Get students preview for a specific department and year level
   */
  getStudentsPreview: async (departmentId: number, academicYearLevel: number) => {
    try {
      const response = await apiClient.get('/registration/course-assignments/students/preview', {
        params: { departmentId, academicYearLevel }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get courses already assigned to a department/year/semester
   */
  getAssignedCourses: async (departmentId: number, academicYearLevel: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get('/registration/course-assignments/assigned-courses', {
        params: { departmentId, academicYearLevel, semester, academicYear }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Assign courses to all students in a department and year level
   */
  assignCoursesToDepartment: async (data: {
    departmentId: number;
    academicYearLevel: number;
    semester: string;
    academicYear: number;
    courseIds: number[];
  }) => {
    try {
      const response = await apiClient.post('/registration/course-assignments/assign', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};