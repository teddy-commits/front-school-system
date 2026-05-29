import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Search,
  Users,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
  code: string;
  faculty: string;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  faculty: string;
  instructorName?: string;
  instructorEmail?: string;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  academicYearLevel: number;
}

interface AssignmentResult {
  totalStudents: number;
  totalAssignments: number;
  errors: string[];
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

const CourseAssignment: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<string>('FALL');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(new Date().getFullYear());
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);

  const yearLevels = [1, 2, 3, 4, 5];
  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const academicYears = [2024, 2025, 2026, 2027];

  useEffect(() => {
    fetchDepartments();
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchAssignedCourses();
      if (showPreview) {
        fetchStudents();
      }
    }
  }, [selectedDepartment, selectedYear, selectedSemester, selectedAcademicYear, showPreview]);

  const isSuccessResponse = <T,>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
    return response.success === true && 'data' in response;
  };

  const fetchDepartments = async () => {
    const result = await departmentApi.getAllDepartments() as ApiResponse<Department[]>;
    if (isSuccessResponse(result)) {
      setDepartments(result.data);
      if (result.data.length > 0) {
        setSelectedDepartment(result.data[0].id);
      }
    }
    setIsLoading(false);
  };

  const fetchAllCourses = async () => {
    const result = await courseApi.getAllCourses() as ApiResponse<Course[]>;
    if (isSuccessResponse(result)) {
      setAllCourses(result.data);
    }
  };

  const fetchAssignedCourses = async () => {
    if (!selectedDepartment) return;
    
    const result = await registrationApi.getAssignedCourses(
      selectedDepartment, selectedYear, selectedSemester, selectedAcademicYear
    ) as ApiResponse<Course[]>;
    
    if (isSuccessResponse(result)) {
      setAssignedCourses(result.data);
    }
  };

  const fetchStudents = async () => {
    if (!selectedDepartment) return;
    
    const result = await registrationApi.getStudentsPreview(selectedDepartment, selectedYear) as ApiResponse<Student[]>;
    if (isSuccessResponse(result)) {
      setStudents(result.data);
    }
  };

  const handleAssignCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course to assign');
      return;
    }

    if (!confirm(`This will assign ${selectedCourses.length} course(s) to ${students.length} student(s) in Year ${selectedYear}. Continue?`)) {
      return;
    }

    setIsSubmitting(true);
    const result = await registrationApi.assignCoursesToDepartment({
      departmentId: selectedDepartment!,
      academicYearLevel: selectedYear,
      semester: selectedSemester,
      academicYear: selectedAcademicYear,
      courseIds: selectedCourses
    }) as ApiResponse<AssignmentResult>;

    if (isSuccessResponse(result)) {
      setAssignmentResult(result.data);
      setShowSuccessModal(true);
      toast.success(`Successfully assigned ${selectedCourses.length} course(s)!`);
      setSelectedCourses([]);
      await fetchAssignedCourses();
    } else {
      toast.error(result.message || 'Failed to assign courses');
    }
    setIsSubmitting(false);
  };

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAllAvailable = () => {
    const availableCourseIds = getAvailableCourses().map(c => c.id);
    setSelectedCourses(availableCourseIds);
  };

  const clearSelection = () => {
    setSelectedCourses([]);
  };

  const getAvailableCourses = () => {
    const assignedIds = assignedCourses.map(c => c.id);
    let available = allCourses.filter(course => !assignedIds.includes(course.id));
    
    if (searchTerm) {
      available = available.filter(course => 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return available;
  };

  const availableCourses = getAvailableCourses();
  const departmentName = departments.find(d => d.id === selectedDepartment)?.name || '';
  const totalCredits = selectedCourses.reduce((sum, courseId) => {
    const course = allCourses.find(c => c.id === courseId);
    return sum + (course?.credits || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Course Assignment</h2>
        <p className="text-gray-500">
          Assign courses to students based on their department and academic year level
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              value={selectedDepartment || ''}
              onChange={(e) => setSelectedDepartment(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Level *</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {yearLevels.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition flex items-center justify-center"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Students Preview Section */}
      {showPreview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">Students in {departmentName} - Year {selectedYear}</h3>
              <span className="ml-2 text-sm text-blue-600">({students.length} students)</span>
            </div>
            <button 
              onClick={fetchStudents} 
              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {students.length > 0 ? (
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {students.map(student => (
                  <div key={student.id} className="bg-white rounded-lg p-2 text-sm shadow-sm">
                    <p className="font-medium text-gray-800">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.studentId} | {student.email}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-blue-600">
              No students found in this department and year level
            </div>
          )}
        </div>
      )}

      {/* Currently Assigned Courses Summary */}
      {assignedCourses.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Currently Assigned for {selectedSemester} {selectedAcademicYear}: {assignedCourses.length} courses
              </span>
            </div>
            <button 
              onClick={fetchAssignedCourses} 
              className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {assignedCourses.map(course => (
              <span key={course.id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                {course.courseCode}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Available Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Available Courses</h3>
                <p className="text-sm text-gray-500">
                  {availableCourses.length} courses available for assignment
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllAvailable}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          
          <div className="divide-y max-h-96 overflow-y-auto">
            {availableCourses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No courses available</p>
                <p className="text-sm">All courses are already assigned</p>
              </div>
            ) : (
              availableCourses.map((course) => (
                <div key={course.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="mt-1 mr-3 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono text-sm font-semibold text-emerald-600">
                          {course.courseCode}
                        </span>
                        <span className="text-xs text-gray-500">| {course.credits} credits</span>
                      </div>
                      <p className="text-gray-800 font-medium">{course.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Department: {course.department} | Faculty: {course.faculty}
                      </p>
                      {course.instructorName && (
                        <p className="text-xs text-gray-400">Instructor: {course.instructorName}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Assignment Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-semibold text-gray-800">Assignment Summary</h3>
            <p className="text-sm text-gray-600">Review before assigning courses</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Summary Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-800">{departmentName || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target Year Level:</span>
                  <span className="font-medium text-gray-800">Year {selectedYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-medium text-gray-800">{selectedSemester} {selectedAcademicYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Students to receive:</span>
                  <span className="font-medium text-emerald-600">{students.length} students</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Courses Selected:</span>
                    <span className="font-semibold text-emerald-600">{selectedCourses.length} courses</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-semibold text-emerald-600">{totalCredits} credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Courses List */}
            {selectedCourses.length > 0 && (
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Courses:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedCourses.map(courseId => {
                    const course = allCourses.find(c => c.id === courseId);
                    return course ? (
                      <span key={courseId} className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs">
                        {course.courseCode}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAssignCourses}
              disabled={selectedCourses.length === 0 || isSubmitting || students.length === 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Assign to {students.length} Student(s)
                </>
              )}
            </button>

            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Important:</strong> This action will register the selected courses for all {students.length} students in {departmentName} Year {selectedYear} for {selectedSemester} {selectedAcademicYear} semester. This cannot be undone easily.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && assignmentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Assignment Complete</h2>
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Courses Assigned Successfully!</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students Processed:</span>
                  <span className="font-semibold">{assignmentResult.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Courses Assigned:</span>
                  <span className="font-semibold text-emerald-600">{assignmentResult.totalAssignments}</span>
                </div>
                {assignmentResult.errors && assignmentResult.errors.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-sm text-red-600 font-medium">Warnings:</p>
                    <ul className="text-xs text-red-500 list-disc list-inside">
                      {assignmentResult.errors.slice(0, 3).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {assignmentResult.errors.length > 3 && (
                        <li>...and {assignmentResult.errors.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignment;