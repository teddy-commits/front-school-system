import React from 'react';
import { X, BookOpen, Clock, Users, Calendar, MapPin, User, Mail, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CourseDetailsModalProps {
  course: any;
  onClose: () => void;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, onClose }) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">{course.courseName}</h2>
            <p className="text-sm text-gray-500 font-mono">{course.courseCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg ${getStatusBadge(course.status)}`}>
            <div className="flex items-center">
              {course.status === 'OPEN' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              <span className="font-medium">Status: {course.status}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{course.description || 'No description provided.'}</p>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3"><BookOpen className="w-5 h-5 text-indigo-500" /><div><p className="text-xs text-gray-500">Credits</p><p className="text-sm font-medium">{course.credits}</p></div></div>
            <div className="flex items-center space-x-3"><Calendar className="w-5 h-5 text-green-500" /><div><p className="text-xs text-gray-500">Semester</p><p className="text-sm font-medium">{course.semester} {course.academicYear}</p></div></div>
            <div className="flex items-center space-x-3"><Users className="w-5 h-5 text-purple-500" /><div><p className="text-xs text-gray-500">Enrollment</p><p className="text-sm font-medium">{course.enrolledStudents} / {course.maxStudents}</p></div></div>
            <div className="flex items-center space-x-3"><Clock className="w-5 h-5 text-orange-500" /><div><p className="text-xs text-gray-500">Schedule</p><p className="text-sm font-medium">{course.schedule || 'TBA'}</p></div></div>
            <div className="flex items-center space-x-3"><MapPin className="w-5 h-5 text-red-500" /><div><p className="text-xs text-gray-500">Room</p><p className="text-sm font-medium">{course.room || 'TBA'}</p></div></div>
            <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-teal-500" /><div><p className="text-xs text-gray-500">Prerequisites</p><p className="text-sm font-medium">{course.prerequisites || 'None'}</p></div></div>
          </div>

          {/* Instructor Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Instructor</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-indigo-600" /></div>
                <div><p className="font-medium text-gray-800">{course.instructorName || 'Not Assigned'}</p>{course.instructorEmail && (<div className="flex items-center space-x-1 mt-1"><Mail className="w-3 h-3 text-gray-400" /><p className="text-sm text-gray-500">{course.instructorEmail}</p></div>)}</div>
              </div>
            </div>
          </div>

          {/* Department & Faculty */}
          <div className="grid grid-cols-2 gap-4">
            <div><h3 className="text-md font-semibold text-gray-800 mb-2">Department</h3><p className="text-gray-600">{course.department || 'Not specified'}</p></div>
            <div><h3 className="text-md font-semibold text-gray-800 mb-2">Faculty</h3><p className="text-gray-600">{course.faculty || 'Not specified'}</p></div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t pt-4">
            <div><p>Created: {formatDate(course.createdAt)}</p></div>
            <div><p>Last Updated: {formatDate(course.updatedAt)}</p></div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;