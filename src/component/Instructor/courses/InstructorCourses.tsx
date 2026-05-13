import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, MapPin, Clock, Eye, RefreshCw } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import CourseEnrollmentModal from './CourseEnrollmentModal';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  credits: number;
  status: string;
  schedule: string;
  room: string;
  semester: string;
  academicYear: number;
  enrolledStudents: number;
  maxStudents: number;
  department: string;
}

interface ApiCourseResponse {
  id: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  credits: number;
  status?: string;
  schedule?: string;
  room?: string;
  semester: string;
  academicYear: number;
  enrolledStudents?: number;
  maxStudents?: number;
  department?: string;
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

const InstructorCourses: React.FC = () => {
  const { user } = useAuth(); // Changed from userEmail to user
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [department, setDepartment] = useState<string>('');

  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    fetchMyCourses();
  }, [selectedSemester, selectedYear]);

  const fetchMyCourses = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching courses for:', selectedSemester, selectedYear);
      
      const result = await courseApi.getMyCourses(selectedSemester, selectedYear) as ApiResponse<ApiCourseResponse[]>;
      
      console.log('API Response:', result);
      
      if (result.success && 'data' in result && Array.isArray(result.data)) {
        console.log('Courses data:', result.data);
        
        const transformedCourses: Course[] = result.data.map((item: ApiCourseResponse) => ({
          id: item.id,
          courseCode: item.courseCode,
          courseName: item.courseName,
          sectionId: item.sectionId,
          credits: item.credits,
          status: item.status || 'OPEN',
          schedule: item.schedule || 'Schedule TBA',
          room: item.room || 'Room TBA',
          semester: item.semester,
          academicYear: item.academicYear,
          enrolledStudents: item.enrolledStudents || 0,
          maxStudents: item.maxStudents || 40,
          department: item.department || department || 'N/A'
        }));
        
        setCourses(transformedCourses);
        
        if (result.data.length > 0 && result.data[0].department) {
          setDepartment(result.data[0].department);
        }
      } else if (!result.success && 'message' in result) {
        toast.error(result.message || 'Failed to load courses');
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      OPEN: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeatStatus = (enrolled: number, max: number) => {
    if (enrolled >= max) return 'Full';
    if (enrolled >= max * 0.8) return 'Almost Full';
    return 'Available';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
        <p className="text-sm text-gray-500">
          Courses assigned to you in the <span className="font-medium text-blue-600">{department || 'your'}</span> department
        </p>
      </div>

      {/* Semester/Year Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <select 
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="FALL">Fall</option>
          <option value="SPRING">Spring</option>
          <option value="SUMMER">Summer</option>
        </select>
        
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </div>

      {/* Department Info Card */}
      {department && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Your Department</p>
              <p className="text-sm text-blue-600">{department}</p>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses assigned to you yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Courses from your department will appear here once assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{course.courseCode}</h3>
                    <p className="text-gray-600">{course.courseName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                    {course.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      Enrolled: {course.enrolledStudents} / {course.maxStudents} students
                      <span className="ml-2 text-xs text-gray-400">({getSeatStatus(course.enrolledStudents, course.maxStudents)})</span>
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.semester} {course.academicYear}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.schedule || 'Schedule TBA'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.room || 'Room TBA'}</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowEnrollmentModal(true);
                    }}
                    className="flex items-center px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    View Students
                  </button>
                  <button 
                    onClick={() => window.location.href = `/instructor-dashboard/grades?course=${course.courseCode}`}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Manage Grades
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchMyCourses}
          className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Courses
        </button>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <CourseEnrollmentModal
          course={selectedCourse}
          semester={selectedSemester} 
          academicYear={selectedYear}  
          sectionId={selectedCourse.sectionId}    
          onClose={() => setShowEnrollmentModal(false)}
        />
      )}
    </div>
  );
};

export default InstructorCourses;