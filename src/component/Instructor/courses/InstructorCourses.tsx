import React, { useState } from 'react';
import { BookOpen, Users, Calendar, MapPin, Clock, Eye, ChevronRight } from 'lucide-react';
import CourseEnrollmentModal from './CourseEnrollmentModal';

interface InstructorCoursesProps {
  assignedCourses: any[];
}

const InstructorCourses: React.FC<InstructorCoursesProps> = ({ assignedCourses }) => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
        <p className="text-sm text-gray-500">View and manage all your assigned courses</p>
      </div>

      {assignedCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses assigned to you yet.</p>
          <p className="text-sm text-gray-400">Please contact the academic administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignedCourses.map((course) => (
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
                    <span>Enrolled: {course.enrolledStudents} / {course.maxStudents} students</span>
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
                  <button className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Eye className="w-4 h-4 mr-1" />
                    Manage Grades
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <CourseEnrollmentModal
          course={selectedCourse}
          onClose={() => setShowEnrollmentModal(false)}
        />
      )}
    </div>
  );
};

export default InstructorCourses;