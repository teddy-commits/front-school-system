import React, { useState } from 'react';
import { X } from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import toast from 'react-hot-toast';

interface GradeEditModalProps {
  grade: any;
  course: any;
  student: any;
  onClose: () => void;
  onSuccess: () => void;
}

const GradeEditModal: React.FC<GradeEditModalProps> = ({ grade, course, student, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(grade.score.toString());
  const [remarks, setRemarks] = useState(grade.remarks || '');

  const getGradeLetter = (scoreNum: number) => {
    if (scoreNum >= 90) return 'A+';
    if (scoreNum >= 85) return 'A';
    if (scoreNum >= 80) return 'A-';
    if (scoreNum >= 77) return 'B+';
    if (scoreNum >= 73) return 'B';
    if (scoreNum >= 70) return 'B-';
    if (scoreNum >= 67) return 'C+';
    if (scoreNum >= 63) return 'C';
    if (scoreNum >= 60) return 'C-';
    if (scoreNum >= 50) return 'D';
    return 'F';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await gradeApi.updateGrade(grade.id, { 
      score: parseFloat(score), 
      remarks 
    });

    if (result.success) {
      toast.success('Grade updated successfully!');
      onSuccess();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const gradeLetter = score ? getGradeLetter(parseFloat(score)) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Grade</h2>
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
            <p className="text-sm text-gray-600 mt-2">Current Grade</p>
            <p className="font-semibold">{grade.gradeLetter} ({grade.score}%)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {score && (
              <p className="text-sm mt-1">
                Grade: <span className="font-semibold">{gradeLetter}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Additional comments..."
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeEditModal;