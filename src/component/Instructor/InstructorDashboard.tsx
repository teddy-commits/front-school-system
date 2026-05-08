import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import InstructorOverview from './dashboard/InstructorOverview';
import InstructorCourses from './courses/InstructorCourses';
import GradeManagement from './grades/GradeManagement';
import InstructorProfile from './profile/InstructorProfile';
import { useAuth } from '../../context/AuthContext';
import { courseApi } from '../../api/modules/courseApi';
import { enrollmentApi } from '../../api/modules/enrollmentApi';
import toast from 'react-hot-toast';
import InstructorSections from './sections/InstructorSections';
const InstructorDashboard: React.FC = () => {
  const { user, userEmail } = useAuth();
  const location = useLocation();
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, [userEmail]);

  const fetchInstructorData = async () => {
    setIsLoading(true);
    try {
      // Fetch courses assigned to this instructor
      const coursesResult = await courseApi.getCoursesByInstructor(userEmail!);
      if (coursesResult.success) {
        setAssignedCourses(coursesResult.data);
        
        // Calculate total students across all courses
        let studentCount = 0;
        for (const course of coursesResult.data) {
          const enrollmentsResult = await enrollmentApi.getCourseEnrollments(course.courseCode);
          if (enrollmentsResult.success) {
            studentCount += enrollmentsResult.data.length;
          }
        }
        setTotalStudents(studentCount);
      }
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'overview': return 'Dashboard';
      case 'courses': return 'My Courses';
      case 'grades': return 'Grade Management';
      case 'profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'I'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="overview" element={
              <InstructorOverview 
                assignedCourses={assignedCourses}
                totalStudents={totalStudents}
                isLoading={isLoading}
              />
            } />
            <Route path="courses" element={<InstructorCourses assignedCourses={assignedCourses} />} />
            <Route path="grades" element={<GradeManagement assignedCourses={assignedCourses} />} />
            <Route path="profile" element={<InstructorProfile />} />
            <Route path="sections" element={<InstructorSections />} />
            
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;