import React, { useState } from 'react';
import { X } from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface GradeSubmissionModalProps {
  course: any;
  student: any;
  existingGrade: any;
  onClose: () => void;
  onSuccess: () => void;
}

const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  course,
  student,
  existingGrade,
  onClose,
  onSuccess
}) => {
  const { userEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    score: existingGrade?.score || '',
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
    setIsLoading(true);

    const gradeData = {
      studentId: student.studentId,
      courseCode: course.courseCode,
      score: parseFloat(formData.score),
      semester: formData.semester,
      academicYear: formData.academicYear,
      remarks: formData.remarks
    };

    let result;
    if (existingGrade) {
      result = await gradeApi.updateGrade(existingGrade.id, { score: parseFloat(formData.score), remarks: formData.remarks });
    } else {
      result = await gradeApi.submitGrade(gradeData);
    }

    if (result.success) {
      toast.success(existingGrade ? 'Grade updated successfully!' : 'Grade submitted successfully!');
      onSuccess();
    } else {
      toast.error(result.message);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Course</p>
            <p className="font-semibold">{course?.courseCode} - {course?.courseName}</p>
            <p className="text-sm text-gray-600 mt-2">Student</p>
            <p className="font-semibold">{student?.studentName} ({student?.studentIdNumber})</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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