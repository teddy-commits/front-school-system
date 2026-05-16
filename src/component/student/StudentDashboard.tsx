import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentOverview from './dashboard/StudentOverview';
import StudentCourses from './courses/StudentCourses';
import StudentGrades from './grades/StudentGrades';
import StudentFees from './fees/StudentFees';
import StudentPayments from './payments/StudentPayments';
import StudentInvoices from './invoices/StudentInvoices';
import StudentProfile from './profile/StudentProfile';
import { useAuth } from '../../context/AuthContext';
import { gradeApi } from '../../api/modules/gradeApi';
import { financeApi } from '../../api/modules/financeApi';
import SemesterRegistration from './registration/SemesterRegistration';
import StudentSectionEnrollment from './sections/StudentSectionEnrollment';

interface CGPAResponse {
  success: boolean;
  data?: number;
  message?: string;
  status?: number;
}

interface FeeSummaryResponse {
  success: boolean;
  data?: {
    totalOutstanding: number;
    totalPaid?: number;
    totalDue?: number;
    [key: string]: any;
  };
  message?: string;
  status?: number;
}

interface StudentInfo {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  program: string;
  department: string;
  currentSemester: number;
  enrollmentYear: number;
  [key: string]: any;
}

const StudentDashboard: React.FC = () => {
  const { user, userId } = useAuth();
  const location = useLocation();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [enrolledCourses, setEnrolledCourses] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchStudentData();
    setIsMobileMenuOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userId, location.pathname]);

  const fetchStudentData = async () => {
    if (!userId) return;

    try {
      const cgpaResult = await gradeApi.getStudentCGPA(userId) as CGPAResponse;
      if (cgpaResult.success && cgpaResult.data !== undefined) {
        setCgpa(cgpaResult.data);
      }
      const feeResult = await financeApi.getStudentFeeSummary(userId) as FeeSummaryResponse;
      if (feeResult.success && feeResult.data) {
        setTotalOutstanding(feeResult.data.totalOutstanding || 0);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'overview': return 'Dashboard';
      case 'courses': return 'My Courses';
      case 'grades': return 'My Grades';
      case 'fees': return 'Fee Status';
      case 'payments': return 'Payment History';
      case 'invoices': return 'Invoices';
      case 'profile': return 'My Profile';
      case 'semester-registration': return 'Semester Registration';
      case 'section-registration': return 'Section Enrollment';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <StudentSidebar isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
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
                <p className="text-xs text-gray-500 hidden md:block">Student</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm md:text-base">
                  {user?.fullName?.charAt(0) || 'S'}
                </span>
              </div>
            </div>
          </div>
  
          <div className="sm:hidden mt-2">
            <p className="text-xs font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="overview" element={
              <StudentOverview 
                cgpa={cgpa} 
                totalOutstanding={totalOutstanding}
                enrolledCourses={enrolledCourses}
              />
            } />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="invoices" element={<StudentInvoices />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="semester-registration" element={<SemesterRegistration />} />
            <Route path="section-registration" element={<StudentSectionEnrollment />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;