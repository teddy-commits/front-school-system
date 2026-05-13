import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, GraduationCap, FileText, X } from 'lucide-react';
import { registrationApi } from '../../../api/modules/registrationApi';
import { gradeApi } from '../../../api/modules/gradeApi';
import toast from 'react-hot-toast';
import StudentTranscriptModal from './StudentTranscriptModal';

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
}

interface Transcript {
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  cgpa: number;
  totalCredits: number;
  completedCredits: number;
  courses: any[];
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

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState('ALL');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  const departments = ['ALL', 'Computer Science', 'Software Engineering', 'Information Technology', 'Electrical Engineering', 'Mechanical Engineering'];
  const faculties = ['ALL', 'Faculty of Computing and Informatics', 'Faculty of Engineering', 'Faculty of Business and Economics', 'Faculty of Science'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedDepartment, selectedFaculty, students]);

  const fetchStudents = async () => {
    setIsLoading(true);
    const result = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
    if (result.success && 'data' in result) {
      setStudents(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch students');
    }
    setIsLoading(false);
  };

  const filterStudents = () => {
    let filtered = [...students];
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedDepartment !== 'ALL') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    if (selectedFaculty !== 'ALL') {
      filtered = filtered.filter(s => s.faculty === selectedFaculty);
    }
    setFilteredStudents(filtered);
  };

  const handleViewTranscript = async (student: Student) => {
    const result = await gradeApi.getStudentTranscript(student.id) as ApiResponse<Transcript>;
    if (result.success && 'data' in result) {
      setTranscript(result.data);
      setSelectedStudent(student);
      setShowTranscriptModal(true);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to load transcript');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Student Management</h2>
        <p className="text-sm text-gray-500">View student information and academic records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Students</p>
              <p className="text-2xl font-bold text-green-600">{students.filter(s => s.isActive).length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{new Set(students.map(s => s.department)).size}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. CGPA</p>
              <p className="text-2xl font-bold text-orange-600">3.2</p>
            </div>
            <GraduationCap className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or student ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg" 
            />
          </div>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)} 
            className="px-4 py-2 border rounded-lg w-48"
          >
            {departments.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>)}
          </select>
          <select 
            value={selectedFaculty} 
            onChange={(e) => setSelectedFaculty(e.target.value)} 
            className="px-4 py-2 border rounded-lg w-56"
          >
            {faculties.map(f => <option key={f} value={f}>{f === 'ALL' ? 'All Faculties' : f}</option>)}
          </select>
          <button onClick={fetchStudents} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-indigo-600">{student.studentId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.faculty}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.enrollmentYear}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleViewTranscript(student)} 
                        className="flex items-center justify-center px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredStudents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No students found</p>
          </div>
        )}
      </div>

      {showTranscriptModal && selectedStudent && transcript && (
        <StudentTranscriptModal 
          student={selectedStudent} 
          transcript={transcript} 
          onClose={() => setShowTranscriptModal(false)} 
        />
      )}
    </div>
  );
};

export default StudentManagement;