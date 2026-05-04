import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Award, AlertCircle } from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import GradeSubmissionModal from './GradeSubmissionModal';
import GradeEditModal from './GradeEditModal';
import StudentGradesView from './StudentGradesView';

interface GradeManagementProps {
  assignedCourses: any[];
}

const GradeManagement: React.FC<GradeManagementProps> = ({ assignedCourses }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [currentCourse, setCurrentCourse] = useState<any>(null);

 // In GradeManagement.tsx, when fetching enrollments
const fetchCourseData = async (courseCode: string) => {
  if (!courseCode) return;
  
  setIsLoading(true);
  try {
    // Fetch enrolled students
    const enrollmentsResult = await enrollmentApi.getCourseEnrollments(courseCode);
    if (enrollmentsResult.success) {
      // Map the enrollment data to ensure consistent structure
      const mappedStudents = enrollmentsResult.data.map((enrollment: any) => ({
        id: enrollment.id,
        studentId: enrollment.studentId,  // Make sure this exists
        studentIdNumber: enrollment.studentIdNumber || enrollment.studentId,
        studentName: enrollment.studentName || enrollment.fullName,
        email: enrollment.email,
        status: enrollment.status
      }));
      setStudents(mappedStudents);
    }
    
    // Fetch existing grades
    const gradesResult = await gradeApi.getCourseGrades(courseCode);
    if (gradesResult.success) {
      setGrades(gradesResult.data);
    }
  } catch (error) {
    console.error('Error fetching course data:', error);
    toast.error('Failed to load course data');
  } finally {
    setIsLoading(false);
  }
};

  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    const course = assignedCourses.find(c => c.courseCode === courseCode);
    setCurrentCourse(course);
    fetchCourseData(courseCode);
  };

  const getGradeForStudent = (studentId: number) => {
    return grades.find(g => g.studentId === studentId);
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
// In GradeManagement.tsx, when setting selectedStudent
const handleViewGrade = (student: any, grade: any) => {
  console.log('Viewing grade for student:', student);
  console.log('Grade data:', grade);
  
  // Make sure student object has the required properties
  if (!student || !student.studentId) {
    console.error('Student object is invalid:', student);
    toast.error('Student data is incomplete');
    return;
  }
  
  setSelectedStudent(student);
  setSelectedGrade(grade);
  setShowViewModal(true);
};
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Grade Management</h2>
        <p className="text-sm text-gray-500">Submit and manage student grades for your courses</p>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a course --</option>
              {assignedCourses.map(course => (
                <option key={course.id} value={course.courseCode}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <div className="flex items-end">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Grades
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              {currentCourse?.courseCode} - {currentCourse?.courseName}
            </h3>
            <p className="text-sm text-gray-500">Enrolled Students: {students.length}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students enrolled in this course yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const grade = getGradeForStudent(student.studentId);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{student.studentIdNumber}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.studentName}</td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          {grade ? `${grade.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {grade ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.gradeLetter)}`}>
                              {grade.gradeLetter}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedGrade(grade);
                                setShowSubmitModal(true);
                              }}
                              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                            >
                              {grade ? 'Edit Grade' : 'Submit Grade'}
                            </button>
                            {grade && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setSelectedGrade(grade);
                                  setShowViewModal(true);
                                }}
                                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && (
        <GradeSubmissionModal
          course={currentCourse}
          student={selectedStudent}
          existingGrade={selectedGrade}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedStudent(null);
            setSelectedGrade(null);
          }}
          onSuccess={() => {
            fetchCourseData(selectedCourse);
            setShowSubmitModal(false);
            setSelectedStudent(null);
            setSelectedGrade(null);
          }}
        />
      )}

      {/* View Modal */}
     

{showViewModal && (
  <StudentGradesView
    student={selectedStudent || {}}
    grade={selectedGrade || {}}
    course={currentCourse || {}}
    onClose={() => {
      setShowViewModal(false);
      setSelectedStudent(null);
      setSelectedGrade(null);
    }}
  />
)}
    </div>
  );
};

export default GradeManagement;