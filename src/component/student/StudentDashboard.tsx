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

const StudentDashboard: React.FC = () => {
  const { user, userId } = useAuth();
  const location = useLocation();
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [enrolledCourses, setEnrolledCourses] = useState<number>(0);

  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  const fetchStudentData = async () => {
    if (!userId) return;

    try {
      // Fetch CGPA
      const cgpaResult = await gradeApi.getStudentCGPA(userId);
      if (cgpaResult.success) setCgpa(cgpaResult.data);

      // Fetch fee summary
      const feeResult = await financeApi.getStudentFeeSummary(userId);
      if (feeResult.success) setTotalOutstanding(feeResult.data.totalOutstanding || 0);
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
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'S'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
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