import React, { useState, useEffect } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import { courseApi } from '../../../api/modules/courseApi';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  status?: string;
}

interface AddCourseModalProps {
  sectionId: number;
  sectionName: string;
  onClose: () => void;
  onSuccess: () => void;
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

const AddCourseModal: React.FC<AddCourseModalProps> = ({ sectionId, sectionName, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [schedule, setSchedule] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const result = await courseApi.getAllCourses() as ApiResponse<Course[]>;
    if (result.success && 'data' in result) {
      setCourses(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch courses');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    setIsLoading(true);
    const result = await sectionApi.addCourseToSection({
      sectionId,
      courseId: selectedCourse.id,
      schedule,
      room
    }) as ApiResponse;

    if (result.success) {
      toast.success('Course added to section successfully');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to add course to section');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Add Course to Section</h2>
            <p className="text-sm text-gray-500">Section: {sectionName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Courses List */}
          <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                  selectedCourse?.id === course.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{course.courseCode} - {course.courseName}</p>
                    <p className="text-sm text-gray-500">Credits: {course.credits} | Department: {course.department}</p>
                  </div>
                  {selectedCourse?.id === course.id && (
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {courses.length === 0 ? 'Loading courses...' : 'No courses found'}
              </div>
            )}
          </div>

          {/* Schedule & Room (if course selected) */}
          {selectedCourse && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g., Monday 10:00-12:00"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., Room 101"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCourse}
              disabled={!selectedCourse || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourseModal;