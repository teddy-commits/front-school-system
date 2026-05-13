import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, Users, BookOpen, X, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { sectionApi } from '../../../api/modules/sectionApi';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  instructorName: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule: string;
  room: string;
  status: string;
  hasAvailableSeats: boolean;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  academicYearLevel: number;
  isActive: boolean;
}

interface EnrolledStudent {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  email: string;
  enrollmentDate: string;
  status: string;
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

const EnrollmentManagement: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('ALL');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];
  const yearLevels = ['ALL', '1', '2', '3', '4', '5'];

  useEffect(() => {
    fetchSections();
  }, [selectedSemester, selectedYear]);

  const fetchSections = async () => {
    setIsLoading(true);
    const result = await sectionApi.getSectionsBySemester(selectedSemester, selectedYear) as ApiResponse<Section[]>;
    if (result.success && 'data' in result) {
      setSections(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch sections');
    }
    setIsLoading(false);
  };

  const fetchSectionStudents = async (section: Section) => {
    setIsLoading(true);
    setSelectedSection(section);
    const result = await enrollmentApi.getSectionEnrollments(section.id) as ApiResponse<EnrolledStudent[]>;
    if (result.success && 'data' in result) {
      setEnrolledStudents(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch enrolled students');
    }
    setIsLoading(false);
  };

  const fetchAvailableStudents = async () => {
    const result = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
    if (result.success && 'data' in result) {
      // Get all students already enrolled in ANY section for this semester
      const enrolledResult = await enrollmentApi.getInstructorStudents(selectedSemester, selectedYear) as ApiResponse<any[]>;
      const enrolledStudentIds = (enrolledResult.success && 'data' in enrolledResult && Array.isArray(enrolledResult.data)) 
        ? enrolledResult.data.map((e: any) => e.studentId) 
        : [];
      
      const available = result.data.filter(
        (student: Student) => !enrolledStudentIds.includes(student.id) && student.isActive
      );
      setAvailableStudents(available);
      setFilteredAvailableStudents(available);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch students');
    }
  };

  const filterAvailableStudents = () => {
    let filtered = [...availableStudents];
    
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedYearLevel !== 'ALL') {
      filtered = filtered.filter(student => 
        student.academicYearLevel?.toString() === selectedYearLevel
      );
    }
    
    setFilteredAvailableStudents(filtered);
  };

 const handleEnroll = async (studentId: number) => {
  if (!selectedSection) {
    toast.error('No section selected');
    return;
  }
  
  if (!studentId) {
    toast.error('Invalid student ID');
    return;
  }
  
  console.log('Enrolling:', {
    studentId,
    sectionId: selectedSection.id,
    semester: selectedSemester,
    year: selectedYear
  });
  
  setIsLoading(true);
  
  try {
    // Fix: Pass an object instead of 4 separate arguments
    const result = await enrollmentApi.enrollInSection({
      studentId: studentId,
      sectionId: selectedSection.id,
      semester: selectedSemester,
      academicYear: selectedYear
    }) as ApiResponse;
    
    if (result.success) {
      toast.success('Student enrolled successfully');
      await fetchSectionStudents(selectedSection);
      setShowStudentModal(false);
      setSelectedStudentId('');
      setSearchTerm('');
    } else if (!result.success && 'message' in result) {
      toast.error(result.message || 'Failed to enroll student');
    } else {
      toast.error('Failed to enroll student');
    }
  } catch (error) {
    console.error('Enroll error:', error);
    toast.error('Failed to enroll student');
  } finally {
    setIsLoading(false);
  }
};
  const handleWithdraw = async (enrollmentId: number, studentName: string) => {
    if (window.confirm(`Withdraw ${studentName} from this section?`)) {
      const result = await enrollmentApi.dropSection(enrollmentId) as ApiResponse;
      if (result.success) {
        toast.success('Student withdrawn successfully');
        if (selectedSection) {
          fetchSectionStudents(selectedSection);
        }
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to withdraw student');
      }
    }
  };

  const openAddModal = async () => {
    await fetchAvailableStudents();
    setShowStudentModal(true);
  };

  useEffect(() => {
    filterAvailableStudents();
  }, [searchTerm, selectedYearLevel, availableStudents]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-green-100 text-green-800',
      FULL: 'bg-red-100 text-red-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getYearLevelBadge = (yearLevel: number) => {
    const styles: Record<number, string> = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-indigo-100 text-indigo-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-cyan-100 text-cyan-800',
      5: 'bg-teal-100 text-teal-800'
    };
    return styles[yearLevel] || 'bg-gray-100 text-gray-800';
  };

  // Filter sections by course if needed
  const filteredSections = selectedCourseFilter === 'ALL' 
    ? sections 
    : sections.filter(s => s.courseId.toString() === selectedCourseFilter);

  // Get unique courses for filter dropdown
  const uniqueCourses = [...new Map(sections.map(s => [s.courseId, { id: s.courseId, code: s.courseCode, name: s.courseName }])).values()];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Section Enrollment Management</h2>
        <p className="text-sm text-gray-500">Manage student enrollments in course sections</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          >
            <option value="ALL">All Courses</option>
            {uniqueCourses.map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
          <button
            onClick={fetchSections}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sections List - Show when no section selected */}
      {!selectedSection ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              onClick={() => fetchSectionStudents(section)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-indigo-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {section.courseCode} - {section.courseName}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(section.academicYearLevel)}`}>
                      Year {section.academicYearLevel}
                    </span>
                  </div>
                  <p className="text-gray-600">Section {section.sectionCode}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(section.status)}`}>
                  {section.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.semester} {section.academicYear}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.schedule || 'TBA'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.room || 'TBA'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.enrolledStudents} / {section.maxStudents} students</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="flex items-center text-indigo-600 text-sm">
                  Manage Enrollments <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sections available for {selectedSemester} {selectedYear}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedSection(null);
              setEnrolledStudents([]);
            }}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Sections
          </button>

          {/* Section Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedSection.courseCode} - {selectedSection.courseName}</h2>
                <p className="text-indigo-100 mt-1">
                  Section {selectedSection.sectionCode} | Year {selectedSection.academicYearLevel}
                </p>
                <div className="flex gap-4 mt-3 text-sm text-indigo-100">
                  <span>{selectedSection.semester} {selectedSection.academicYear}</span>
                  <span>{selectedSection.schedule || 'Schedule TBA'}</span>
                  <span>{selectedSection.room || 'Room TBA'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{enrolledStudents.length}</div>
                <div className="text-sm text-indigo-100">Enrolled Students</div>
                <div className="text-sm text-indigo-100">Max: {selectedSection.maxStudents}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Enrolled Students</h3>
            {selectedSection.hasAvailableSeats && (
              <button
                onClick={openAddModal}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Student
              </button>
            )}
          </div>

          {/* Enrolled Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrolledStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-indigo-600">{student.studentIdNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleWithdraw(student.id, student.studentName)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {enrolledStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No students enrolled in this section</p>
                {selectedSection.hasAvailableSeats && (
                  <button
                    onClick={openAddModal}
                    className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add your first student
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Student Modal */}
      {showStudentModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Enroll Student</h2>
                <p className="text-sm text-gray-500">
                  {selectedSection.courseCode} - Section {selectedSection.sectionCode}
                </p>
              </div>
              <button onClick={() => {
                setShowStudentModal(false);
                setSelectedStudentId('');
                setSearchTerm('');
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              
              {/* Student list */}
              <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                {filteredAvailableStudents.length === 0 ? (
                  <p className="text-center text-gray-500 p-4">
                    {searchTerm 
                      ? 'No students match your search' 
                      : 'No available students to enroll'}
                  </p>
                ) : (
                  filteredAvailableStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {student.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.studentId} | {student.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Year {student.academicYearLevel || 'N/A'} | {student.department || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Enrolling student:', {
                            studentId: student.id,
                            sectionId: selectedSection?.id,
                            semester: selectedSemester,
                            year: selectedYear
                          });
                          handleEnroll(student.id);
                        }}
                        disabled={isLoading}
                        className="ml-3 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isLoading ? '...' : 'Enroll'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;