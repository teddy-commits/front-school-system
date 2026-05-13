import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { sectionApi } from '../../../api/modules/sectionApi';
import { gradeApi } from '../../../api/modules/gradeApi';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  GraduationCap,
  ChevronLeft,
  Eye,
  FileText,
  RefreshCw,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  enrolledStudents: number;
  maxStudents: number;
  schedule: string;
  room: string;
  status: string;
}

interface Student {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  email: string;
  phoneNumber: string;
  department: string;
  faculty: string;
  enrollmentDate: string;
  status: string;
  grade?: {
    score: number;
    gradeLetter: string;
    gradePoint: number;
  };
}

interface Grade {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  score: number;
  gradeLetter: string;
  gradePoint: number;
  semester: string;
  academicYear: number;
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

const InstructorSectionStudents: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    fetchMySections();
  }, [selectedSemester, selectedYear]);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchMySections = async () => {
    setIsLoading(true);
    const result = await sectionApi.getMySections(selectedSemester, selectedYear) as ApiResponse<Section[]>;
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
    
    const result = await enrollmentApi.getSectionEnrollments(section.id) as ApiResponse<any[]>;
    if (result.success && 'data' in result && Array.isArray(result.data)) {
      const studentsWithDetails = await Promise.all(
        result.data.map(async (enrollment: any) => {
          // Fetch grade for this student if available
          const gradeResult = await fetchStudentGrade(enrollment.studentId, section.courseCode);
          return {
            ...enrollment,
            grade: gradeResult.success && gradeResult.data ? gradeResult.data : null
          };
        })
      );
      setStudents(studentsWithDetails);
      setFilteredStudents(studentsWithDetails);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch enrolled students');
    }
    setIsLoading(false);
  };

  const fetchStudentGrade = async (studentId: number, courseCode: string) => {
    try {
      const result = await gradeApi.getStudentGrades(studentId) as ApiResponse<Grade[]>;
      if (result.success && 'data' in result && Array.isArray(result.data)) {
        const grade = result.data.find((g: Grade) => g.courseCode === courseCode);
        return { success: true, data: grade };
      }
      return { success: false, data: null };
    } catch {
      return { success: false, data: null };
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleExportCSV = () => {
    if (!selectedSection || students.length === 0) return;
    
    const headers = ['Student ID', 'Student Name', 'Email', 'Department', 'Faculty', 'Enrollment Date', 'Status'];
    const csvData = students.map(s => [
      s.studentIdNumber,
      s.studentName,
      s.email || '',
      s.department || '',
      s.faculty || '',
      new Date(s.enrollmentDate).toLocaleDateString(),
      s.status
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSection.courseCode}_Section${selectedSection.sectionCode}_Students.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export started');
  };

  const getGradeColor = (gradeLetter: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'A-': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'C-': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return colors[gradeLetter] || 'bg-gray-100 text-gray-800';
  };

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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Section Students</h2>
        <p className="text-sm text-gray-500">View and manage students enrolled in your sections</p>
      </div>

      {/* Semester Selection */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={fetchMySections}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sections List */}
      {!selectedSection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => fetchSectionStudents(section)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {section.courseCode} - {section.courseName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(section.academicYearLevel)}`}>
                      Year {section.academicYearLevel}
                    </span>
                    <span className="text-sm text-gray-500">Section {section.sectionCode}</span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(section.status)}`}>
                  {section.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.semester} {section.academicYear}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.schedule || 'Schedule TBA'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.room || 'Room TBA'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{section.enrolledStudents} / {section.maxStudents} students</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
          ))}
          {sections.length === 0 && !isLoading && (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sections assigned for {selectedSemester} {selectedYear}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedSection(null);
              setStudents([]);
              setFilteredStudents([]);
              setSearchTerm('');
            }}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Sections
          </button>

          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedSection.courseCode} - {selectedSection.courseName}</h2>
                <p className="text-blue-100 mt-1">
                  Section {selectedSection.sectionCode} | Year {selectedSection.academicYearLevel}
                </p>
                <div className="flex gap-4 mt-3 text-sm text-blue-100">
                  <span>{selectedSection.semester} {selectedSection.academicYear}</span>
                  <span>{selectedSection.schedule || 'Schedule TBA'}</span>
                  <span>{selectedSection.room || 'Room TBA'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{students.length}</div>
                <div className="text-sm text-blue-100">Enrolled Students</div>
                <div className="text-sm text-blue-100">Max: {selectedSection.maxStudents}</div>
              </div>
            </div>
          </div>

          {/* Search and Export */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleExportCSV}
                disabled={students.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Students Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">{student.studentIdNumber}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.department || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {student.grade ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(student.grade.gradeLetter)}`}>
                              {student.grade.gradeLetter} ({student.grade.score}%)
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View Student Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No students found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Student Details</h2>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedStudent.studentName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.studentName}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.studentIdNumber}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">{selectedStudent.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">{selectedStudent.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">{selectedStudent.department || 'Not assigned'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">Enrolled: {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button onClick={() => setShowStudentModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// X icon component
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default InstructorSectionStudents;