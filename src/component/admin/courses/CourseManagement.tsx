import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, Filter, 
  BookOpen, Clock, Users, RefreshCw, X,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import CreateCourseModal from './CreateCourseModal';
import CourseDetailsModal from './CourseDetailsModal';
import EditCourseModal from './EditCourseModal';

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
  hasAvailableSeats: boolean;
  prerequisites: string;
  room: string;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<any[]>([]);

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
      const result = await courseApi.getAllCourses();
      if (result.success) {
        setCourses(result.data);
      } else {
        toast.error(result.message);
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
      const result = await registrationApi.getAllInstructors();
      if (result.success) {
        setInstructors(result.data);
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
    if (window.confirm(`Are you sure you want to delete course ${courseCode}?`)) {
      const result = await courseApi.deleteCourse(id);
      if (result.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const result = await courseApi.updateCourseStatus(id, newStatus);
    if (result.success) {
      toast.success(`Course status updated to ${newStatus}`);
      fetchCourses();
    } else {
      toast.error(result.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      OPEN: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeatStatus = (enrolled: number, max: number) => {
    if (enrolled === 0) return { text: 'No Enrollments', color: 'text-gray-500' };
    if (enrolled >= max) return { text: 'Full', color: 'text-red-600' };
    if (enrolled >= max * 0.8) return { text: 'Almost Full', color: 'text-yellow-600' };
    return { text: 'Available', color: 'text-green-600' };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Course Management</h2>
          <p className="text-sm text-gray-500">Manage all courses offered by the university</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </button>
      </div>

      {/* Statistics Cards */}
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
              <p className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-bold text-purple-600">
                {courses.reduce((sum, c) => sum + c.enrolledStudents, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Class Size</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(courses.reduce((sum, c) => sum + c.enrolledStudents, 0) / courses.length) || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course code, name or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester === 'ALL' ? 'All Semesters' : semester}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchCourses}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => {
                  const seatStatus = getSeatStatus(course.enrolledStudents, course.maxStudents);
                  return (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-blue-600">
                          {course.courseCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                        <div className="text-xs text-gray-500 mt-1">{course.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.credits}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.department}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{course.instructorName || 'Not Assigned'}</div>
                        <div className="text-xs text-gray-500">{course.instructorEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{course.schedule || 'TBA'}</div>
                        <div className="text-xs text-gray-500">{course.room || 'TBA'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{course.enrolledStudents}/{course.maxStudents}</div>
                        <div className={`text-xs ${seatStatus.color}`}>{seatStatus.text}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDetailsModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowEditModal(true);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <select
                            value={course.status}
                            onChange={(e) => handleStatusChange(course.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {statuses.filter(s => s !== 'ALL').map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDelete(course.id, course.courseCode)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No courses found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchCourses}
          instructors={instructors}
        />
      )}
      {showDetailsModal && selectedCourse && (
        <CourseDetailsModal 
          course={selectedCourse} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
      {showEditModal && selectedCourse && (
        <EditCourseModal 
          course={selectedCourse}
          onClose={() => setShowEditModal(false)} 
          onSuccess={fetchCourses}
          instructors={instructors}
        />
      )}
    </div>
  );
};

export default CourseManagement;