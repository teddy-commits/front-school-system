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
import toast from 'react-hot-toast';

const AcademicAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const coursesResult = await courseApi.getAllCourses();
      if (coursesResult.success) setTotalCourses(coursesResult.data.length);

      const studentsResult = await registrationApi.getAllStudents();
      if (studentsResult.success) setTotalStudents(studentsResult.data.length);
      
      setTotalEnrollments(156); // This would come from an enrollment stats API
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
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AcademicAdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Academic Administrator</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
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
            <Route path="students" element={<StudentManagement />} />
            <Route path="reports" element={<AcademicReports />} />
            <Route path="sessions" element={<RegistrationSessionManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AcademicAdminDashboard;