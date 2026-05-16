import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AcademicAdminSidebar from './AcademicAdminSidebar';
import AcademicAdminOverview from './dashboard/AcademicAdminOverview';
import CourseManagement from './courses/CourseManagement';
import EnrollmentManagement from './enrollments/EnrollmentManagement';
import StudentManagement from './students/StudentManagement';
import AcademicReports from './reports/AcademicReports';
import RegistrationSessionManagement from './sessions/RegistrationSessionManagement';
import { useAuth } from '../../context/AuthContext';
import { courseApi } from '../../api/modules/courseApi';
import { registrationApi } from '../../api/modules/registrationApi';
import SectionManagement from '../Academic Admin/sections/SectionManagement';
import AdminSectionEnrollment from './sections/AdminSectionEnrollment';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  isActive: boolean;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

const AcademicAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    setIsMobileMenuOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const coursesResult = await courseApi.getAllCourses() as ApiResponse<Course[]>;
      if (coursesResult.success && 'data' in coursesResult && Array.isArray(coursesResult.data)) {
        setTotalCourses(coursesResult.data.length);
      } else if (!coursesResult.success && 'message' in coursesResult) {
        toast.error(coursesResult.message);
      }

      const studentsResult = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
      if (studentsResult.success && 'data' in studentsResult && Array.isArray(studentsResult.data)) {
        setTotalStudents(studentsResult.data.length);
      } else if (!studentsResult.success && 'message' in studentsResult) {
        toast.error(studentsResult.message);
      }
      
      setTotalEnrollments(156);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'overview': return 'Dashboard';
      case 'courses': return 'Course Management';
      case 'enrollments': return 'Enrollment Management';
      case 'students': return 'Student Management';
      case 'reports': return 'Academic Reports';
      case 'sessions': return 'Registration Session Management';
      case 'sections': return 'Section Management';
      case 'section-enrollment': return 'Section Enrollment';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AcademicAdminSidebar isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800 truncate flex-1 md:flex-none ml-2 md:ml-0">
              {getPageTitle()}
            </h1>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">Academic Administrator</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm md:text-base">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Mobile user info */}
          <div className="sm:hidden mt-2 text-right">
            <p className="text-xs font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500">Academic Administrator</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="overview" element={
              <AcademicAdminOverview 
                totalCourses={totalCourses}
                totalStudents={totalStudents}
                totalEnrollments={totalEnrollments}
                isLoading={isLoading}
              />
            } />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="enrollments" element={<EnrollmentManagement />} />
            <Route path="section-enrollment" element={<AdminSectionEnrollment />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="reports" element={<AcademicReports />} />
            <Route path="sessions" element={<RegistrationSessionManagement />} />
            <Route path="sections" element={<SectionManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AcademicAdminDashboard;