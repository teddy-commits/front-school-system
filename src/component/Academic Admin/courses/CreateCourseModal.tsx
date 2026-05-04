import React, { useState } from 'react';
import { X } from 'lucide-react';
import { courseApi } from '../../../api/modules/courseApi';
import toast from 'react-hot-toast';

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  instructors: any[];
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onSuccess, instructors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const result = await courseApi.createCourse(submitData);
    if (result.success) {
      toast.success(`Course ${formData.courseCode} created successfully!`);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
              <input type="text" name="courseCode" required value={formData.courseCode} onChange={handleChange} placeholder="e.g., CS101" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
              <input type="text" name="courseName" required value={formData.courseName} onChange={handleChange} placeholder="e.g., Introduction to Programming" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Course description, objectives, and outcomes..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
              <input type="number" name="credits" required min={1} max={6} value={formData.credits} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select name="semester" required value={formData.semester} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input type="number" name="academicYear" required value={formData.academicYear} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select name="department" required value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
              <select name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select name="instructorEmail" value={formData.instructorEmail} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Instructor</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.email}>{inst.fullName} ({inst.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input type="number" name="maxStudents" min={5} max={200} value={formData.maxStudents} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Room 101" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input type="text" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="e.g., Monday 10:00-12:00" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
              <input type="text" name="prerequisites" value={formData.prerequisites} onChange={handleChange} placeholder="e.g., CS101, MATH101" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus URL</label>
            <input type="text" name="syllabus" value={formData.syllabus} onChange={handleChange} placeholder="Link to course syllabus" className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;