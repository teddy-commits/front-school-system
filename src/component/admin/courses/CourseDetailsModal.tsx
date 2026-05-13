import React from 'react';
import { X, BookOpen, Calendar, Clock, MapPin, User, Mail, Phone, Users, DollarSign } from 'lucide-react';

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

interface CourseDetailsModalProps {
  course: Course;
  onClose: () => void;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, onClose }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      OPEN: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeatStatus = (enrolled: number, max: number) => {
    if (enrolled >= max) return { text: 'Full', color: 'text-red-600' };
    if (enrolled >= max * 0.8) return { text: 'Almost Full', color: 'text-yellow-600' };
    return { text: 'Available', color: 'text-green-600' };
  };

  const seatStatus = getSeatStatus(course.enrolledStudents, course.maxStudents);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Course Details</h2>
            <p className="text-sm text-gray-500 font-mono">{course.courseCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{course.courseName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                  {course.status}
                </span>
                <span className="text-sm text-gray-500">Credits: {course.credits}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{course.enrolledStudents}/{course.maxStudents}</div>
              <div className="text-xs text-gray-500">Enrolled Students</div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{course.description || 'No description provided.'}</p>
          </div>

          {/* Course Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Semester</p>
                <p className="text-sm font-medium">{course.semester} {course.academicYear}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Schedule</p>
                <p className="text-sm font-medium">{course.schedule || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Room</p>
                <p className="text-sm font-medium">{course.room || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Seat Availability</p>
                <p className={`text-sm font-medium ${seatStatus.color}`}>{seatStatus.text}</p>
              </div>
            </div>
          </div>

          {/* Department & Faculty */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm font-medium">{course.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Faculty</p>
              <p className="text-sm font-medium">{course.faculty}</p>
            </div>
          </div>

          {/* Instructor Information */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Instructor Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Instructor Name</p>
                  <p className="text-sm font-medium">{course.instructorName || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{course.instructorEmail || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {course.prerequisites && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Prerequisites</h4>
              <p className="text-sm text-gray-600">{course.prerequisites}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 text-xs text-gray-400">
            <p>Created: {formatDate(course.createdAt)}</p>
            <p className="mt-1">Last Updated: {formatDate(course.updatedAt)}</p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;