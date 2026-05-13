import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, RefreshCw, BookOpen } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import CreateCourseModal from './CreateCourseModal';
import EditCourseModal from './EditCourseModal';
import CourseDetailsModal from './CourseDetailsModal';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  semester: string;
  academicYear: number;
  status: string;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  prerequisites: string;
  schedule: string;
  room: string;
}

interface Instructor {
  id: number;
  fullName: string;
  email: string;
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

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const statuses = ['ALL', 'DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const semesters = ['ALL', 'FALL', 'SPRING', 'SUMMER'];

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedStatus, selectedSemester, courses]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const result = await courseApi.getAllCourses() as ApiResponse<Course[]>;
      if (result.success && 'data' in result) {
        setCourses(Array.isArray(result.data) ? result.data : []);
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const result = await registrationApi.getAllInstructors() as ApiResponse<Instructor[]>;
      if (result.success && 'data' in result) {
        setInstructors(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }
    
    if (selectedSemester !== 'ALL') {
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }
    
    setFilteredCourses(filtered);
  };

  const handleDelete = async (id: number, courseCode: string) => {
    if (window.confirm(`Delete course "${courseCode}"? This action cannot be undone.`)) {
      const result = await courseApi.deleteCourse(id) as ApiResponse;
      if (result.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const result = await courseApi.updateCourseStatus(id, newStatus) as ApiResponse;
    if (result.success) {
      toast.success(`Course status updated to ${newStatus}`);
      fetchCourses();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update status');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Course Management</h2>
          <p className="text-sm text-gray-500">Create, edit, and manage all university courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold text-green-600">{courses.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-bold text-purple-600">{courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Class Size</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0) / (courses.length || 1))}</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
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
              placeholder="Search by course code, name or instructor..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)} 
            className="px-4 py-2 border rounded-lg w-40 focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
          </select>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)} 
            className="px-4 py-2 border rounded-lg w-40 focus:ring-2 focus:ring-indigo-500"
          >
            {semesters.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Semesters' : s}</option>)}
          </select>
          <button 
            onClick={fetchCourses} 
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-indigo-600">{course.courseCode}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                      <div className="text-xs text-gray-500">{course.description?.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">{course.credits}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{course.instructorName || 'Not Assigned'}</div>
                      <div className="text-xs text-gray-500">{course.instructorEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.semester} {course.academicYear}</td>
                    <td className="px-6 py-4 text-sm text-center">{course.enrolledStudents}/{course.maxStudents}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => { setSelectedCourse(course); setShowDetailsModal(true); }} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedCourse(course); setShowEditModal(true); }} 
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <select 
                          value={course.status} 
                          onChange={(e) => handleStatusChange(course.id, e.target.value)} 
                          className="text-xs border rounded px-2 py-1"
                        >
                          {statuses.filter(s => s !== 'ALL').map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <button 
                          onClick={() => handleDelete(course.id, course.courseCode)} 
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreateCourseModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCourses} instructors={instructors} />}
      {showEditModal && selectedCourse && <EditCourseModal course={selectedCourse} onClose={() => setShowEditModal(false)} onSuccess={fetchCourses} instructors={instructors} />}
      {showDetailsModal && selectedCourse && <CourseDetailsModal course={selectedCourse} onClose={() => setShowDetailsModal(false)} />}
    </div>
  );
};

export default CourseManagement;