import React from 'react';
import { X, Award, Calendar, User, BookOpen } from 'lucide-react';

interface StudentGradesViewProps {
  student: any;
  grade: any;
  course: any;
  onClose: () => void;
}

const StudentGradesView: React.FC<StudentGradesViewProps> = ({ student, grade, course, onClose }) => {
  // Debug: Log what we received
  console.log('StudentGradesView - Received props:', { student, grade, course });

  // Early return if student is undefined
  if (!student) {
    console.error('StudentGradesView: student prop is undefined');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-lg p-6">
          <div className="text-center">
            <p className="text-red-600">Error: Student data not available</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Safely access properties with fallbacks
  const studentName = student.studentName || student.fullName || 'Unknown Student';
  const studentIdNumber = student.studentIdNumber || student.studentId || student.userId || 'N/A';
  const courseCode = course?.courseCode || 'N/A';
  const courseName = course?.courseName || 'Unknown Course';
  const gradeLetter = grade?.gradeLetter || 'N/A';
  const score = grade?.score || 0;
  const gradePoint = grade?.gradePoint || 0;
  const semester = grade?.semester || 'N/A';
  const academicYear = grade?.academicYear || '';
  const gradedBy = grade?.gradedBy?.split('@')[0] || '-';
  const gradedDate = grade?.gradedDate ? new Date(grade.gradedDate).toLocaleDateString() : 'N/A';
  const remarks = grade?.remarks;

  const getGradeColor = (letter: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600',
      'A': 'text-green-600',
      'A-': 'text-green-600',
      'B+': 'text-blue-600',
      'B': 'text-blue-600',
      'B-': 'text-blue-600',
      'C+': 'text-yellow-600',
      'C': 'text-yellow-600',
      'C-': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600',
    };
    return colors[letter] || 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Grade Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold">{studentName}</p>
                <p className="text-sm text-gray-500">ID: {studentIdNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-semibold">{courseCode} - {courseName}</p>
              </div>
            </div>
          </div>

          {/* Grade Info */}
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
              <Award className={`w-12 h-12 ${getGradeColor(gradeLetter)}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{gradeLetter}</h3>
            <p className="text-gray-500 mt-1">Score: {score}%</p>
            <p className="text-gray-500">GPA: {gradePoint.toFixed(2)}</p>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Semester:</span>
              <span className="text-sm font-medium">{semester} {academicYear}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Graded By:</span>
              <span className="text-sm font-medium">{gradedBy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Graded Date:</span>
              <span className="text-sm font-medium">{gradedDate}</span>
            </div>
            {remarks && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Remarks:</p>
                <p className="text-sm text-gray-600">{remarks}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
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

export default StudentGradesView;