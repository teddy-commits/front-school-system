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
  const { user } = useAuth();
  const location = useLocation();
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    fetchInstructorData();
  }, [selectedSemester, selectedYear]);
  useEffect(() => {
    setIsMobileMenuOpen(false);
    
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <InstructorSidebar isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4">
          <div className="flex justify-between items-center">
            {/* Mobile menu button */}
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
            
            <div className="hidden md:flex items-center space-x-3">
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4 ml-2 md:ml-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">Instructor</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm md:text-base">
                  {user?.fullName?.charAt(0) || 'I'}
                </span>
              </div>
            </div>
          </div>
          <div className="md:hidden mt-3 flex gap-2">
            <select 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="FALL">Fall</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          
          <div className="sm:hidden mt-2">
            <p className="text-xs font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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