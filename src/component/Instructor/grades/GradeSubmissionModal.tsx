import React, { useState } from 'react';
import { X } from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface Course {
  id?: number;
  courseCode: string;
  courseName: string;
  semester?: string;
  academicYear?: number;
  credits?: number;
}

interface Student {
  studentId: number;
  studentName?: string;
  studentIdNumber?: string;
  fullName?: string;
  email?: string;
}

interface ExistingGrade {
  id: number;
  score: number;
  remarks?: string;
  gradeLetter?: string;
  gradePoint?: number;
}

interface GradeSubmissionModalProps {
  course: Course | null;
  student: Student | null;
  existingGrade: ExistingGrade | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  score: string;
  semester: string;
  academicYear: number;
  remarks: string;
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

const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  course,
  student,
  existingGrade,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth(); // Changed from userEmail to user
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    score: existingGrade?.score?.toString() || '',
    semester: course?.semester || 'FALL',
    academicYear: course?.academicYear || new Date().getFullYear(),
    remarks: existingGrade?.remarks || ''
  });

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 77) return 'B+';
    if (score >= 73) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 67) return 'C+';
    if (score >= 63) return 'C';
    if (score >= 60) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !student) {
      toast.error('Missing course or student information');
      return;
    }
    
    setIsLoading(true);

    const scoreValue = parseFloat(formData.score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      toast.error('Please enter a valid score between 0 and 100');
      setIsLoading(false);
      return;
    }

    const gradeData = {
      studentId: student.studentId,
      courseCode: course.courseCode,
      score: scoreValue,
      semester: formData.semester,
      academicYear: formData.academicYear,
      remarks: formData.remarks
    };

    let result: ApiResponse;
    if (existingGrade) {
      result = await gradeApi.updateGrade(existingGrade.id, { 
        score: scoreValue, 
        remarks: formData.remarks 
      }) as ApiResponse;
    } else {
      result = await gradeApi.submitGrade(gradeData) as ApiResponse;
    }

    if (result.success) {
      toast.success(existingGrade ? 'Grade updated successfully!' : 'Grade submitted successfully!');
      onSuccess();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to save grade');
    }
    setIsLoading(false);
  };

  const gradeLetter = formData.score ? getGradeLetter(parseFloat(formData.score)) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {existingGrade ? 'Edit Grade' : 'Submit Grade'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Course</p>
            <p className="font-semibold">{course?.courseCode} - {course?.courseName}</p>
            <p className="text-sm text-gray-600 mt-2">Student</p>
            <p className="font-semibold">{student?.studentName || student?.fullName} ({student?.studentIdNumber || student?.studentId})</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.score}
              onChange={(e) => setFormData({...formData, score: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.score && (
              <p className="text-sm mt-1">
                Grade: <span className="font-semibold">{gradeLetter}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="number"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Additional comments about the student's performance"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (existingGrade ? 'Update Grade' : 'Submit Grade')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeSubmissionModal;