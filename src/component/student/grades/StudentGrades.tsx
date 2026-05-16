import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Download, FileText } from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface Grade {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  score: number;
  gradeLetter: string;
  gradePoint: number;
  semester: string;
  academicYear: number;
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

const StudentGrades: React.FC = () => {
  const { userId } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedGrades, setGroupedGrades] = useState<Record<string, Grade[]>>({});

  useEffect(() => {
    if (userId) {
      fetchGrades();
      fetchCGPA();
    }
  }, [userId]);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const result = await gradeApi.getStudentGrades(userId!) as ApiResponse<Grade[]>;
      if (result.success && 'data' in result) {
        setGrades(result.data);
        // Group by semester
        const grouped = result.data.reduce((acc: Record<string, Grade[]>, grade: Grade) => {
          const key = `${grade.semester} ${grade.academicYear}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(grade);
          return acc;
        }, {});
        setGroupedGrades(grouped);
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to load grades');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCGPA = async () => {
    try {
      const result = await gradeApi.getStudentCGPA(userId!) as ApiResponse<number>;
      if (result.success && 'data' in result) {
        setCgpa(result.data);
      }
    } catch (error) {
      console.error('Error fetching CGPA:', error);
    }
  };

  const calculateSemesterGPA = (semesterGrades: Grade[]) => {
    let totalPoints = 0;
    let totalCredits = 0;
    semesterGrades.forEach(grade => {
      totalPoints += grade.gradePoint * grade.credits;
      totalCredits += grade.credits;
    });
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const getGradeColor = (gradeLetter: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'A-': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'C-': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return colors[gradeLetter] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Grades</h2>
        <p className="text-sm text-gray-500">View your academic performance and CGPA</p>
      </div>

      {/* CGPA Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-emerald-100">Current CGPA</p>
            <p className="text-4xl font-bold">{cgpa.toFixed(2)}</p>
            <p className="text-sm text-emerald-100 mt-1">out of 4.0</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Grades by Semester */}
      {Object.entries(groupedGrades).map(([semester, semesterGrades]) => {
        const semesterGPA = calculateSemesterGPA(semesterGrades);
        return (
          <div key={semester} className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{semester}</h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Semester GPA: {semesterGPA.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {semesterGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.courseCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{grade.courseName}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">{grade.credits}</td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">{grade.score}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.gradeLetter)}`}>
                          {grade.gradeLetter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">{grade.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {grades.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No grades available yet.</p>
          <p className="text-sm text-gray-400">Grades will appear here once published by instructors.</p>
        </div>
      )}

      {/* Download Transcript Button */}
      {grades.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Download className="w-4 h-4 mr-2" />
            Download Transcript
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;