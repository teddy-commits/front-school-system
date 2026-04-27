// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
};

export const REGISTRATION_ENDPOINTS = {
  STUDENT_REGISTER: '/registration/students/register',
  STUDENTS: '/registration/students',
  STUDENT_BY_ID: (id: number): string => `/registration/students/${id}`,
  STUDENT_BY_STUDENT_ID: (studentId: string): string => `/registration/students/student-id/${studentId}`,
  STUDENT_BY_EMAIL: (email: string): string => `/registration/students/email/${email}`,
  STUDENTS_BY_DEPARTMENT: (department: string): string => `/registration/students/department/${department}`,
  STUDENTS_BY_FACULTY: (faculty: string): string => `/registration/students/faculty/${faculty}`,
  STUDENTS_BY_YEAR: (year: number): string => `/registration/students/year/${year}`,
  STUDENT_COUNT: '/registration/students/count',
  STUDENT_SEARCH: '/registration/students/search',
  STUDENT_DEACTIVATE: (id: number): string => `/registration/students/${id}/deactivate`,
  STUDENT_ACTIVATE: (id: number): string => `/registration/students/${id}/activate`,

  ADMIN_INSTRUCTORS: '/admin/users/instructors',
  ADMIN_ACADEMIC_ADMINS: '/admin/users/academic-administrators',
  ADMIN_MANAGEMENT: '/admin/users/management',
  ADMIN_ADMINS: '/admin/users/admins',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id: number): string => `/admin/users/${id}`,
  ADMIN_USER_STATISTICS: '/admin/users/statistics',
  ADMIN_USER_SEARCH: '/admin/users/search',
};

export const GRADING_ENDPOINTS = {

  COURSES: '/grading/courses',
  COURSE_BY_ID: (id: number): string => `/grading/courses/${id}`,
  COURSE_BY_CODE: (code: string): string => `/grading/courses/code/${code}`,
  COURSES_BY_DEPARTMENT: (department: string): string => `/grading/courses/department/${department}`,
  COURSES_BY_FACULTY: (faculty: string): string => `/grading/courses/faculty/${faculty}`,
  COURSES_BY_SEMESTER: '/grading/courses/semester',
  COURSES_BY_INSTRUCTOR: (email: string): string => `/grading/courses/instructor/${email}`,
  COURSE_SEARCH: '/grading/courses/search',
  COURSE_STATUS: (id: number, status: string): string => `/grading/courses/${id}/status?status=${status}`,
  COURSE_DELETE: (id: number): string => `/grading/courses/${id}`,
  
  ENROLLMENTS: '/grading/enrollments',
  ENROLLMENT_BY_ID: (id: number): string => `/grading/enrollments/${id}`,
  STUDENT_ENROLLMENTS: (studentId: number): string => `/grading/enrollments/students/${studentId}`,
  STUDENT_ACTIVE_ENROLLMENTS: (studentId: number): string => `/grading/enrollments/students/${studentId}/active`,
  COURSE_ENROLLMENTS: (courseCode: string): string => `/grading/enrollments/courses/${courseCode}`,
  ENROLLMENT_COUNT: (courseCode: string): string => `/grading/enrollments/courses/${courseCode}/count`,
  CHECK_ENROLLMENT: '/grading/enrollments/check',
  
  GRADES_SUBMIT: '/grading/grades/submit',
  GRADE_BY_ID: (id: number): string => `/grading/grades/${id}`,
  STUDENT_GRADES: (studentId: number): string => `/grading/students/${studentId}/grades`,
  COURSE_GRADES: (courseCode: string): string => `/grading/courses/${courseCode}/grades`,
  STUDENT_TRANSCRIPT: (studentId: number): string => `/grading/students/${studentId}/transcript`,
  STUDENT_CGPA: (studentId: number): string => `/grading/students/${studentId}/cgpa`,
  PUBLISH_GRADES: (courseCode: string): string => `/grading/courses/${courseCode}/publish`,
};

export const FINANCE_ENDPOINTS = {
  // Fee Structures
  FEE_STRUCTURES: '/finance/fee-structures',
  FEE_STRUCTURE_BY_ID: (id: number): string => `/finance/fee-structures/${id}`,
  
  GENERATE_STUDENT_FEE: (studentId: number, feeStructureId: number, semester: string, academicYear: number): string => 
    `/finance/students/${studentId}/fees?feeStructureId=${feeStructureId}&semester=${semester}&academicYear=${academicYear}`,
  STUDENT_FEES: (studentId: number): string => `/finance/students/${studentId}/fees`,
  STUDENT_FEE_SUMMARY: (studentId: number): string => `/finance/students/${studentId}/summary`,
  OVERDUE_FEES: '/finance/fees/overdue',
  APPLY_LATE_FEE: (feeId: number): string => `/finance/fees/${feeId}/apply-late-fee`,
  WAIVE_FEE: (feeId: number, amount: number, reason: string): string => 
    `/finance/fees/${feeId}/waive?amount=${amount}&reason=${encodeURIComponent(reason)}`,
  
  // Payments
  PAYMENTS: '/finance/payments',
  PAYMENTS_PARTIAL: '/finance/payments/partial',
  PAYMENT_BY_ID: (id: number): string => `/finance/payments/${id}`,
  REFUND_PAYMENT: (id: number, reason: string): string => 
    `/finance/payments/${id}/refund?reason=${encodeURIComponent(reason)}`,
  STUDENT_PAYMENTS: (studentId: number): string => `/finance/students/${studentId}/payments`,
  PAYMENTS_BY_DATE_RANGE: '/finance/payments/report/date-range',
  PAYMENT_RECEIPT: (id: number): string => `/finance/payments/${id}/receipt`,
  
  // Invoices
  GENERATE_INVOICE: (studentId: number, semester: string, academicYear: number): string => 
    `/finance/students/${studentId}/invoices?semester=${semester}&academicYear=${academicYear}`,
  STUDENT_INVOICES: (studentId: number): string => `/finance/students/${studentId}/invoices`,
  INVOICE_BY_ID: (id: number): string => `/finance/invoices/${id}`,
  INVOICE_BY_NUMBER: (number: string): string => `/finance/invoices/number/${number}`,
  ALL_INVOICES: '/finance/invoices',
  OVERDUE_INVOICES: '/finance/invoices/overdue',
  DOWNLOAD_INVOICE: (id: number): string => `/finance/invoices/${id}/download`,
  
  // Reports
  DAILY_REPORT: '/finance/reports/daily',
  MONTHLY_REPORT: '/finance/reports/monthly',
  SEMESTER_REPORT: '/finance/reports/semester',
  DEPARTMENT_REPORT: '/finance/reports/department',
};