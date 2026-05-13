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

interface AssignedCourse {
  id: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  semester: string;
  academicYear: number;
  credits: number;
  schedule: string;
  room: string;
}

interface CourseResponseItem {
  id: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  semester?: string;
  academicYear?: number;
  credits: number;
  schedule: string;
  room: string;
}

// API Response types
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

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth(); // Removed userEmail since it doesn't exist in AuthContext
  const location = useLocation();
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    fetchInstructorData();
  }, [selectedSemester, selectedYear]); // Removed userEmail dependency

  const fetchInstructorData = async () => {
    setIsLoading(true);
    try {
      const coursesResult = await courseApi.getMyCourses(selectedSemester, selectedYear) as ApiResponse<CourseResponseItem[]>;
      
      if (coursesResult.success && 'data' in coursesResult && Array.isArray(coursesResult.data)) {
        const transformedCourses: AssignedCourse[] = coursesResult.data.map((item: CourseResponseItem) => ({
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
          ) as ApiResponse<any[]>;
          
          if (enrollmentsResult.success && 'data' in enrollmentsResult && Array.isArray(enrollmentsResult.data)) {
            studentCount += enrollmentsResult.data.length;
          }
        }
        setTotalStudents(studentCount);
      } else if (!coursesResult.success && 'message' in coursesResult) {
        toast.error(coursesResult.message);
      } else {
        toast.error('Failed to load courses');
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
            <div className="flex items-center space-x-3">
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
              <div className="flex items-center space-x-4 ml-6">
                <p className="text-sm text-gray-700">{user?.fullName}</p>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user?.fullName?.charAt(0) || 'I'}</span>
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
            <Route path="courses" element={<InstructorCourses />} />
            
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