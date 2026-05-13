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
  
  // ✅ Add semester/year state
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    fetchInstructorData();
  }, [userEmail, selectedSemester, selectedYear]); // Re-fetch when semester changes

  const fetchInstructorData = async () => {
    setIsLoading(true);
    try {
      // ✅ Use the new endpoint that returns section/course data with semester/year
      const coursesResult = await courseApi.getMyCourses(selectedSemester, selectedYear);
      
      if (coursesResult.success) {
        // Transform to include all needed fields
        const transformedCourses = coursesResult.data.map((item: any) => ({
          id: item.id,
          courseCode: item.courseCode,
          courseName: item.courseName,
          sectionId: item.sectionId,
          semester: item.semester || selectedSemester,
          academicYear: item.academicYear || selectedYear,
          credits: item.credits,
          schedule: item.schedule,
          room: item.room
        }));
        
        setAssignedCourses(transformedCourses);
        
        // Calculate total students
        let studentCount = 0;
        for (const course of transformedCourses) {
          const enrollmentsResult = await enrollmentApi.getCourseEnrollments(
            course.id,
            selectedSemester,
            selectedYear,
            course.sectionId
          );
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
      case 'sections': return 'My Sections';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            {/* Semester/Year selector in header */}
            <div className="flex items-center space-x-3">
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 border rounded"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
              {/* User info */}
              <div className="flex items-center space-x-4 ml-6">
                <p className="text-sm">{user?.fullName}</p>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white">{user?.fullName?.charAt(0) || 'I'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

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
            
            {/* ✅ Pass semester and academicYear */}
            <Route path="grades" element={
              <GradeManagement 
                assignedCourses={assignedCourses} 
                semester={selectedSemester}
                academicYear={selectedYear}
              />
            } />
            
            <Route path="profile" element={<InstructorProfile />} />
            <Route path="sections" element={<InstructorSections />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default InstructorDashboard;