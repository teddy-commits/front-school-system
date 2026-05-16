import React, { useState } from 'react';
import { X } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import toast from 'react-hot-toast';

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
  instructorEmail: string;
  maxStudents: number;
  prerequisites: string;
  syllabus?: string;
  room: string;
  schedule: string;
}

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  department?: string;
}

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
  instructors: Instructor[];
}

interface FormData {
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  semester: string;
  academicYear: number;
  status: string;
  instructorEmail: string;
  maxStudents: number;
  prerequisites: string;
  syllabus: string;
  room: string;
  schedule: string;
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

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSuccess, instructors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    courseName: course.courseName,
    description: course.description || '',
    credits: course.credits,
    department: course.department,
    faculty: course.faculty,
    semester: course.semester,
    academicYear: course.academicYear,
    status: course.status,
    instructorEmail: course.instructorEmail || '',
    maxStudents: course.maxStudents,
    prerequisites: course.prerequisites || '',
    syllabus: course.syllabus || '',
    room: course.room || '',
    schedule: course.schedule || ''
  });

  const departments = [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Business Administration', 'Economics', 'Mathematics', 'Physics', 'Chemistry'
  ];

  const faculties = [
    'Faculty of Computing and Informatics',
    'Faculty of Engineering',
    'Faculty of Business and Economics',
    'Faculty of Science',
    'Faculty of Arts and Humanities'
  ];

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const statuses = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const submitData = {
      ...formData,
      credits: Number(formData.credits),
      academicYear: Number(formData.academicYear),
      maxStudents: Number(formData.maxStudents)
    };

    const result = await courseApi.updateCourse(course.id, submitData) as ApiResponse;
    if (result.success) {
      toast.success(`Course ${course.courseCode} updated successfully!`);
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update course');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Edit Course</h2>
            <p className="text-sm text-gray-500 font-mono">{course.courseCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
              <input 
                type="text" 
                name="courseName" 
                required 
                value={formData.courseName} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input 
                type="number" 
                name="credits" 
                min={1} 
                max={6} 
                value={formData.credits} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select 
                name="semester" 
                value={formData.semester} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input 
                type="number" 
                name="academicYear" 
                value={formData.academicYear} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
              <select 
                name="faculty" 
                value={formData.faculty} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select 
                name="instructorEmail" 
                value={formData.instructorEmail} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Instructor</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.email}>
                    {inst.fullName} ({inst.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input 
                type="number" 
                name="maxStudents" 
                min={5} 
                max={200} 
                value={formData.maxStudents} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input 
                type="text" 
                name="room" 
                value={formData.room} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input 
                type="text" 
                name="schedule" 
                value={formData.schedule} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
            <input 
              type="text" 
              name="prerequisites" 
              value={formData.prerequisites} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus URL</label>
            <input 
              type="text" 
              name="syllabus" 
              value={formData.syllabus} 
              onChange={handleChange} 
              placeholder="Link to course syllabus" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;