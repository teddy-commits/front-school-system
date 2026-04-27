import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, RefreshCw, 
  Award, TrendingUp, Users, BarChart3,
  Edit, FileText, Printer, X
} from 'lucide-react';
import { gradeApi } from '../../../api/modules/gradeApi';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  courseCode: string;
  courseName: string;
  score: number;
  gradeLetter: string;
  gradePoint: number;
  semester: string;
  academicYear: number;
  remarks: string;
  gradedBy: string;
  gradedDate: string;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  department: string;
  semester: string;
  academicYear: number;
  instructorName: string;
}

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any>(null);

  const semesters = ['ALL', 'FALL', 'SPRING', 'SUMMER'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterGrades();
  }, [searchTerm, selectedCourse, selectedSemester, grades]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const coursesResult = await courseApi.getAllCourses();
      if (coursesResult.success) setCourses(coursesResult.data);

      const studentsResult = await registrationApi.getAllStudents();
      if (studentsResult.success) setStudents(studentsResult.data);

      setGrades([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = [...grades];
    
    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.studentIdNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCourse !== 'ALL') {
      filtered = filtered.filter(g => g.courseCode === selectedCourse);
    }
    
    if (selectedSemester !== 'ALL') {
      filtered = filtered.filter(g => g.semester === selectedSemester);
    }
    
    setFilteredGrades(filtered);
  };

  const fetchCourseGrades = async (courseCode: string) => {
    setIsLoading(true);
    const result = await gradeApi.getCourseGrades(courseCode);
    if (result.success) {
      setGrades(result.data);
      const scores = result.data.map(g => g.score);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const gradeDistribution = result.data.reduce((acc, g) => {
        acc[g.gradeLetter] = (acc[g.gradeLetter] || 0) + 1;
        return acc;
      }, {});
      setCourseStats({ avgScore, gradeDistribution, totalStudents: scores.length });
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const handleSubmitGrade = async (gradeData: any) => {
    const result = await gradeApi.submitGrade(gradeData);
    if (result.success) {
      toast.success('Grade submitted successfully');
      setShowSubmitModal(false);
      if (selectedCourse !== 'ALL') fetchCourseGrades(selectedCourse);
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateGrade = async (gradeId: number, data: any) => {
    const result = await gradeApi.updateGrade(gradeId, data);
    if (result.success) {
      toast.success('Grade updated successfully');
      setShowEditModal(false);
      if (selectedCourse !== 'ALL') fetchCourseGrades(selectedCourse);
    } else {
      toast.error(result.message);
    }
  };

  const handleViewTranscript = async (studentId: number) => {
    const result = await gradeApi.getStudentTranscript(studentId);
    if (result.success) {
      setTranscriptData(result.data);
      setShowTranscriptModal(true);
    } else {
      toast.error(result.message);
    }
  };

  const getGradeColor = (gradeLetter: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'A-': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'B-': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'C-': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[gradeLetter] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Grade Management</h2>
          <p className="text-sm text-gray-500">Manage student grades, view transcripts, and publish results</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Grade
          </button>
          <button onClick={fetchData} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Grades</p>
              <p className="text-2xl font-bold text-gray-800">{grades.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-green-600">
                {courseStats ? courseStats.avgScore.toFixed(1) : '-'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Passing Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {grades.length > 0 
                  ? ((grades.filter(g => g.gradeLetter !== 'F').length / grades.length) * 100).toFixed(1)
                  : '-'
                }%
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(grades.map(g => g.studentId)).size}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, ID or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-64">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                if (e.target.value !== 'ALL') fetchCourseGrades(e.target.value);
                else setGrades([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.courseCode}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {semesters.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Semesters' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      {courseStats && courseStats.gradeDistribution && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Grade Distribution</h3>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(courseStats.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getGradeColor(grade)}`}>
                  <span className="font-bold">{grade}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{count as number}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{grade.studentIdNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{grade.studentName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{grade.courseCode}</div>
                      <div className="text-xs text-gray-500">{grade.courseName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.score}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.gradeLetter)}`}>
                        {grade.gradeLetter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{grade.gradePoint.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{grade.semester} {grade.academicYear}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit Grade"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewTranscript(grade.studentId)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Transcript"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredGrades.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No grades found. Select a course or submit grades.</p>
          </div>
        )}
      </div>

      {/* Submit Grade Modal */}
      {showSubmitModal && (
        <SubmitGradeModal
          courses={courses}
          students={students}
          onSubmit={handleSubmitGrade}
          onClose={() => setShowSubmitModal(false)}
        />
      )}

      {/* Edit Grade Modal */}
      {showEditModal && selectedGrade && (
        <EditGradeModal
          grade={selectedGrade}
          onUpdate={handleUpdateGrade}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Transcript Modal */}
      {showTranscriptModal && transcriptData && (
        <TranscriptModal
          transcript={transcriptData}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}
    </div>
  );
};

// Submit Grade Modal Component
const SubmitGradeModal: React.FC<{
  courses: Course[];
  students: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ courses, students, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseCode: '',
    score: '',
    semester: 'FALL',
    academicYear: new Date().getFullYear(),
    remarks: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, score: parseFloat(formData.score) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Submit Grade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select required value={formData.courseCode} onChange={(e) => setFormData({...formData, courseCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.courseCode}>{c.courseCode} - {c.courseName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score (%)</label>
            <input type="number" min="0" max="100" step="0.01" required value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            {formData.score && <p className="text-sm mt-1">Grade: <span className="font-semibold">{getGradeLetter(parseFloat(formData.score))}</span></p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input type="number" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea rows={2} value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Optional remarks" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Submit Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Grade Modal
const EditGradeModal: React.FC<{ grade: Grade; onUpdate: (id: number, data: any) => void; onClose: () => void }> = ({ grade, onUpdate, onClose }) => {
  const [score, setScore] = useState(grade.score.toString());
  const [remarks, setRemarks] = useState(grade.remarks || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(grade.id, { score: parseFloat(score), remarks });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Grade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Student</label><input type="text" value={grade.studentName} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label><input type="text" value={`${grade.courseCode} - ${grade.courseName}`} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Grade</label><input type="text" value={grade.gradeLetter} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Score (%)</label><input type="number" min="0" max="100" step="0.01" required value={score} onChange={(e) => setScore(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label><textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Update Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transcript Modal Component
const TranscriptModal: React.FC<{ transcript: any; onClose: () => void }> = ({ transcript, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Academic Transcript</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6" id="transcript-content">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Admas University</h3>
            <p className="text-gray-500">Academic Transcript</p>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Student Name</p><p className="font-semibold">{transcript.studentName}</p></div>
              <div><p className="text-sm text-gray-500">Student ID</p><p className="font-semibold">{transcript.studentId}</p></div>
              <div><p className="text-sm text-gray-500">Department</p><p className="font-semibold">{transcript.department}</p></div>
              <div><p className="text-sm text-gray-500">Faculty</p><p className="font-semibold">{transcript.faculty}</p></div>
              <div><p className="text-sm text-gray-500">Overall CGPA</p><p className="font-semibold text-blue-600">{transcript.overallCGPA?.toFixed(2)}</p></div>
              <div><p className="text-sm text-gray-500">Total Credits Earned</p><p className="font-semibold">{transcript.totalCreditsEarned}</p></div>
            </div>
          </div>
          {transcript.semesterGrades?.map((semester: any, idx: number) => (
            <div key={idx} className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">{semester.semester} - GPA: {semester.semesterGPA?.toFixed(2)}</h4>
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course Name</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Credits</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Grade</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.courses?.map((course: any, cidx: number) => (
                    <tr key={cidx} className="border-t">
                      <td className="px-4 py-2 text-sm">{course.courseCode}</td>
                      <td className="px-4 py-2 text-sm">{course.courseName}</td>
                      <td className="px-4 py-2 text-sm text-center">{course.credits}</td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.gradeLetter === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {course.gradeLetter}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-center">{course.gradePoint?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;