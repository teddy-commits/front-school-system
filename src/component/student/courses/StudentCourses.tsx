import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, User, MapPin, Calendar, ChevronRight, CreditCard, CheckCircle, AlertCircle, X } from 'lucide-react';
import { registrationApi } from '../../../api/modules/registrationApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface AvailableCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  semester: string;
  academicYear: number;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  availableSeats: number;
  prerequisites: string;
  schedule: string;
  room: string;
  isEligible: boolean;
  eligibilityMessage: string;
}

interface RegisteredCourse {
  registrationId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  schedule: string;
  room: string;
  instructorName: string;
  status: string;
  enrollmentDate: string;
  fee: number;
}

interface RegistrationSummary {
  studentId: number;
  studentName: string;
  studentEmail: string;
  department: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  totalCredits: number;
  totalFees: number;
  feesPaid: number;
  feesDue: number;
  totalCourses: number;
  registrationStatus: string;
  registrationDate: string;
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

const StudentCourses: React.FC = () => {
  const { userId, userFullName } = useAuth(); // userId is already number | null
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [summary, setSummary] = useState<RegistrationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registered' | 'available'>('registered');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeringCourseId, setRegisteringCourseId] = useState<number | null>(null);

  // Get current semester and academic year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  let currentSemester = 'FALL';
  if (currentMonth >= 1 && currentMonth <= 6) {
    currentSemester = 'SPRING';
  } else if (currentMonth >= 7 && currentMonth <= 12) {
    currentSemester = 'FALL';
  }

  useEffect(() => {
    if (userId) {
      fetchRegisteredCourses();
      fetchAvailableCourses();
      fetchRegistrationSummary();
    }
  }, [userId]);

  const fetchRegisteredCourses = async () => {
    if (!userId) return;
    try {
      const result = await registrationApi.getStudentRegisteredCourses(
        userId, // Already a number
        currentSemester, 
        currentYear
      ) as ApiResponse<RegisteredCourse[]>;
      
      if (result.success && 'data' in result) {
        setRegisteredCourses(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching registered courses:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    if (!userId) return;
    try {
      const result = await registrationApi.getAvailableCoursesForStudent(
        userId, // Already a number
        currentSemester, 
        currentYear
      ) as ApiResponse<AvailableCourse[]>;
      
      if (result.success && 'data' in result) {
        setAvailableCourses(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching available courses:', error);
      toast.error('Failed to load available courses');
    }
  };

  const fetchRegistrationSummary = async () => {
    if (!userId) return;
    try {
      const result = await registrationApi.getRegistrationSummary(
        userId, // Already a number
        currentSemester, 
        currentYear
      ) as ApiResponse<RegistrationSummary>;
      
      if (result.success && 'data' in result) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCourse = async (course: AvailableCourse) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!course.isEligible) {
      toast.error(course.eligibilityMessage);
      return;
    }

    setIsRegistering(true);
    setRegisteringCourseId(course.courseId);
    
    try {
      const result = await registrationApi.registerCourse({
        studentId: userId, // Already a number
        courseId: course.courseId,
        semester: currentSemester,
        academicYear: currentYear
      }) as ApiResponse<RegisteredCourse>;
      
      if (result.success && 'data' in result) {
        toast.success(`Successfully registered for ${course.courseCode}!`);
        // Refresh data
        await fetchRegisteredCourses();
        await fetchAvailableCourses();
        await fetchRegistrationSummary();
        setActiveTab('registered');
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register for course');
    } finally {
      setIsRegistering(false);
      setRegisteringCourseId(null);
    }
  };

  const handleDropCourse = async (course: RegisteredCourse) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!confirm(`Are you sure you want to drop ${course.courseCode}?`)) {
      return;
    }

    try {
      const result = await registrationApi.dropCourse(
        userId, // Already a number
        course.courseId,
        currentSemester,
        currentYear,
        'Student requested drop'
      ) as ApiResponse;
      
      if (result.success) {
        toast.success(`Successfully dropped ${course.courseCode}`);
        // Refresh data
        await fetchRegisteredCourses();
        await fetchAvailableCourses();
        await fetchRegistrationSummary();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to drop course');
    }
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-gray-500">User not authenticated.</p>
        <p className="text-sm text-gray-400 mt-2">Please log in again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Course Registration</h2>
        <p className="text-sm text-gray-500">
          Welcome, {userFullName} - {currentSemester} {currentYear} Registration
        </p>
      </div>

      {/* Registration Summary Card */}
      {summary && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Credits</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalCredits}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Courses</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalCourses}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Fees</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalFees)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-sm font-semibold ${
                summary.registrationStatus === 'COMPLETED' ? 'text-green-600' :
                summary.registrationStatus === 'PAID' ? 'text-blue-600' :
                summary.registrationStatus === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {summary.registrationStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'registered'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Courses ({registeredCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'available'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Courses ({availableCourses.filter(c => c.isEligible).length})
        </button>
      </div>

      {/* Registered Courses Tab */}
      {activeTab === 'registered' && (
        <>
          {registeredCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You are not enrolled in any courses yet.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Browse Available Courses →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredCourses.map((course) => (
                <div key={course.registrationId} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
                  <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{course.courseCode}</h3>
                        <p className="text-gray-600">{course.courseName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'ENROLLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{course.schedule || 'Schedule TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{course.room || 'Room TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Instructor: {course.instructorName || 'TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-500">Credits: {course.credits}</span>
                      <button
                        onClick={() => handleDropCourse(course)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Drop Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Available Courses Tab */}
      {activeTab === 'available' && (
        <>
          {availableCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No courses available for registration.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later or contact academic office.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCourses.map((course) => (
                <div key={course.courseId} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{course.courseCode}</h3>
                        <p className="text-gray-600">{course.courseName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        course.availableSeats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.availableSeats} seats left
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{course.schedule || 'Schedule TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{course.room || 'Room TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Instructor: {course.instructorName || 'TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Credits: {course.credits}</span>
                    </div>
                    
                    {course.prerequisites && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Prerequisites:</span> {course.prerequisites}
                      </div>
                    )}
                    
                    {!course.isEligible && (
                      <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {course.eligibilityMessage}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-medium text-gray-700">
                        Fee: {formatCurrency(course.credits * 1500)}
                      </span>
                      <button
                        onClick={() => handleRegisterCourse(course)}
                        disabled={!course.isEligible || isRegistering}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                          course.isEligible
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isRegistering && registeringCourseId === course.courseId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Register Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentCourses;