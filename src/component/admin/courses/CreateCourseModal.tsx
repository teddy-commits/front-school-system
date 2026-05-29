// src/component/admin/courses/CreateCourseModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import toast from 'react-hot-toast';

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  department?: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  faculty: string;
  headOfDepartment?: string;
  headEmail?: string;
  contactPhone?: string;
  officeLocation?: string;
  isActive?: boolean;
}

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  instructors: Instructor[];
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  
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

  const uniqueFaculties = useMemo(() => {
    const faculties = new Set<string>();
    departments.forEach(dept => {
      if (dept.faculty && dept.faculty.trim()) {
        faculties.add(dept.faculty);
      }
    });
    return Array.from(faculties).sort();
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    if (!selectedFaculty) return [];
    return departments.filter(dept => dept.faculty === selectedFaculty);
  }, [departments, selectedFaculty]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoadingData(true);
    try {
      const result = await departmentApi.getAllDepartments() as ApiResponse<Department[]>;
      if (result.success && 'data' in result) {
        setDepartments(result.data);
      } else {
        toast.error('Failed to load departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const faculty = e.target.value;
    setSelectedFaculty(faculty);
    setFormData({ 
      ...formData, 
      faculty: faculty,
      department: '' 
    });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentName = e.target.value;
    setFormData({ ...formData, department: departmentName });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    
    if (!formData.courseName.trim()) {
      toast.error('Please enter a course name');
      return;
    }
    
    if (formData.credits <= 0) {
      toast.error('Please enter a valid number of credits');
      return;
    }

    if (!formData.faculty) {
      toast.error('Please select a faculty');
      return;
    }

    if (!formData.department) {
      toast.error('Please select a department');
      return;
    }
    
    setIsLoading(true);

    const submitData = {
      courseCode: formData.courseCode,
      courseName: formData.courseName,
      description: formData.description || undefined,
      credits: Number(formData.credits),
      department: formData.department,
      faculty: formData.faculty,
      semester: formData.semester,
      academicYear: Number(formData.academicYear),
      status: formData.status,
      instructorEmail: formData.instructorEmail || undefined,
      maxStudents: Number(formData.maxStudents),
      prerequisites: formData.prerequisites || undefined,
      syllabus: formData.syllabus || undefined,
      room: formData.room || undefined,
      schedule: formData.schedule || undefined
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

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading departments...</span>
          </div>
        </div>
      </div>
    );
  }

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                name="semester"
                required
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
              <select
                name="faculty"
                required
                value={formData.faculty}
                onChange={handleFacultyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Faculty</option>
                {uniqueFaculties.map(faculty => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
              {uniqueFaculties.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No faculties found. Please add faculty information to departments first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleDepartmentChange}
                disabled={!formData.faculty || filteredDepartments.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.faculty ? 'Select Faculty First' : 
                   filteredDepartments.length === 0 ? 'No departments available' : 
                   'Select Department'}
                </option>
                {filteredDepartments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} {dept.code && `(${dept.code})`}
                  </option>
                ))}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                placeholder="e.g., Room 101, CS Building"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                placeholder="e.g., Monday 10:00-12:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              placeholder="e.g., CS101, MATH101"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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