import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, Users, BookOpen, X } from 'lucide-react';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

const EnrollmentManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    const result = await courseApi.getAllCourses();
    if (result.success) setCourses(result.data);
  };

  const fetchStudents = async () => {
    const result = await registrationApi.getAllStudents();
    if (result.success) setStudents(result.data);
  };

  const fetchEnrollments = async (courseCode: string) => {
    if (!courseCode) return;
    setIsLoading(true);
    const result = await enrollmentApi.getCourseEnrollments(courseCode);
    if (result.success) setEnrollments(result.data);
    setIsLoading(false);
  };

  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    fetchEnrollments(courseCode);
  };

  const handleEnroll = async (studentId: number) => {
    const result = await enrollmentApi.enrollCourse({
      studentId,
      courseCode: selectedCourse,
      semester: 'FALL',
      academicYear: new Date().getFullYear()
    });
    if (result.success) {
      toast.success('Student enrolled successfully');
      fetchEnrollments(selectedCourse);
      setShowStudentModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleWithdraw = async (enrollmentId: number) => {
    if (window.confirm('Withdraw this student from the course?')) {
      const result = await enrollmentApi.withdrawCourse(enrollmentId);
      if (result.success) {
        toast.success('Student withdrawn successfully');
        fetchEnrollments(selectedCourse);
      } else {
        toast.error(result.message);
      }
    }
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.studentIdNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableStudents = students.filter(s => 
    !enrollments.some(e => e.studentId === s.id)
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Enrollment Management</h2>
        <p className="text-sm text-gray-500">Manage student course enrollments</p>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select a course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.courseCode}>
                  {course.courseCode} - {course.courseName} ({course.enrolledStudents}/{course.maxStudents})
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <div className="flex items-end">
              <button
                onClick={() => setShowStudentModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Student
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enrollments Table */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">Enrolled Students</h3>
            <p className="text-sm text-gray-500">Total: {enrollments.length} students</p>
            <div className="mt-2 relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12"><Users className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No students enrolled in this course yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{enrollment.studentIdNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{enrollment.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{enrollment.status}</span></td>
                      <td className="px-6 py-4 text-center"><button onClick={() => handleWithdraw(enrollment.id)} className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition">Withdraw</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b"><h2 className="text-xl font-semibold">Enroll Student</h2><button onClick={() => setShowStudentModal(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              <select value="" onChange={(e) => handleEnroll(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select a student</option>
                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;