export interface CourseRequest {
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  department?: string;
  faculty?: string;
  semester: string;
  academicYear: number;
  status?: string;
  instructorEmail?: string;
  maxStudents?: number;
  prerequisites?: string;
  syllabus?: string;
  room?: string;
  schedule?: string;
}

export interface CourseResponse {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  semester: string;
  academicYear: number;
  status: string;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  prerequisites: string;
  syllabus: string;
  room: string;
  schedule: string;
  hasAvailableSeats: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentRequest {
  studentId: number;
  courseCode: string;
  semester?: string;
  academicYear?: number;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  enrollmentDate: string;
  status: string;
  semester: string;
  academicYear: number;
  createdAt: string;
  message: string;
}

export interface GradeSubmissionRequest {
  studentId: number;
  courseCode: string;
  score: number;
  semester?: string;
  academicYear?: number;
  remarks?: string;
}

export interface GradeResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  courseCode: string;
  courseName: string;
  score: number;
  gradeLetter: string;
  gradePoint: number;
  semester: string;
  academicYear: number;
  remarks: string;
  gradedBy: string;
  gradedDate: string;
}

export interface TranscriptResponse {
  studentId: string;
  studentName: string;
  department: string;
  faculty: string;
  overallCGPA: number;
  totalCreditsEarned: number;
  semesterGrades: SemesterGrade[];
}

export interface SemesterGrade {
  semester: string;
  academicYear: number;
  semesterGPA: number;
  courses: CourseGrade[];
}

export interface CourseGrade {
  courseCode: string;
  courseName: string;
  credits: number;
  score: number;
  gradeLetter: string;
  gradePoint: number;
}