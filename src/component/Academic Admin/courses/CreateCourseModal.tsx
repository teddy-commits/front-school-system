import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import toast from 'react-hot-toast';

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  instructors: Instructor[];
}

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  department?: string;
}

interface Department {
  id: number;
  code: string;
  name: string;
  faculty: string;
  isActive: boolean;
}

interface FormData {
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

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onSuccess, instructors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 3,
    department: '',
    faculty: '',
    semester: 'FALL',
    academicYear: new Date().getFullYear(),
    status: 'DRAFT',
    instructorEmail: '',
    maxStudents: 50,
    prerequisites: '',
    syllabus: '',
    room: '',
    schedule: ''
  });

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const statuses = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    const result = await departmentApi.getActiveDepartments() as ApiResponse<Department[]>;
    if (result.success && 'data' in result) {
      setDepartments(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      console.error('Failed to fetch departments:', result.message);
      toast.error('Failed to load departments');
    } else {
      toast.error('Failed to load departments');
    }
    setLoadingDepartments(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'department') {
      // Find selected department and auto-fill faculty
      const selectedDept = departments.find(d => d.name === value);
      if (selectedDept) {
        setFormData({ 
          ...formData, 
          department: value,
          faculty: selectedDept.faculty || ''
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

    const result = await courseApi.createCourse(submitData) as ApiResponse;
    if (result.success) {
      toast.success(`Course ${formData.courseCode} created successfully!`);
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to create course');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
              <input 
                type="text" 
                name="courseCode" 
                required 
                value={formData.courseCode} 
                onChange={handleChange} 
                placeholder="e.g., CS101" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
              <input 
                type="text" 
                name="courseName" 
                required 
                value={formData.courseName} 
                onChange={handleChange} 
                placeholder="e.g., Introduction to Programming" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Course description, objectives, and outcomes..." 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
              <input 
                type="number" 
                name="credits" 
                required 
                min={1} 
                max={6} 
                value={formData.credits} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select 
                name="semester" 
                required 
                value={formData.semester} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input 
                type="number" 
                name="academicYear" 
                required 
                value={formData.academicYear} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              {loadingDepartments ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="animate-pulse h-5 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <select 
                  name="department" 
                  required 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
              <input 
                type="text" 
                name="faculty" 
                required 
                value={formData.faculty} 
                onChange={handleChange} 
                disabled 
                className="w-full px-3 py-2 border rounded-lg bg-gray-50" 
                placeholder="Auto-filled from department"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input 
                type="text" 
                name="room" 
                value={formData.room} 
                onChange={handleChange} 
                placeholder="e.g., Room 101" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input 
                type="text" 
                name="schedule" 
                value={formData.schedule} 
                onChange={handleChange} 
                placeholder="e.g., Monday 10:00-12:00" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
              <input 
                type="text" 
                name="prerequisites" 
                value={formData.prerequisites} 
                onChange={handleChange} 
                placeholder="e.g., CS101, MATH101" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
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
              {isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;