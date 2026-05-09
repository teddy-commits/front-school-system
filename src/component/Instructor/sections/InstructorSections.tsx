import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { sectionApi } from '../../../api/modules/sectionApi';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { Users, Clock, MapPin, Eye, ChevronRight, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  academicYearLevel: number;  // NEW - Year of study
  semester: string;
  academicYear: number;
  enrolledStudents: number;
  maxStudents: number;
  schedule: string;
  room: string;
  status: string;
}

interface Student {
  id: number;
  studentName: string;
  studentIdNumber: string;
  email: string;
  enrollmentDate: string;
  status: string;
}

const InstructorSections: React.FC = () => {
  const { userEmail } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showStudentModal, setShowStudentModal] = useState(false);

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    fetchMySections();
  }, [selectedSemester, selectedYear]);

  const fetchMySections = async () => {
    setIsLoading(true);
    const result = await sectionApi.getMySections(selectedSemester, selectedYear);
    if (result.success) {
      setSections(result.data);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const fetchSectionStudents = async (sectionId: number) => {
    const result = await enrollmentApi.getSectionEnrollments(sectionId);
    if (result.success) {
      setStudents(result.data);
      setShowStudentModal(true);
    } else {
      toast.error(result.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-green-100 text-green-800',
      FULL: 'bg-red-100 text-red-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getYearLevelBadge = (yearLevel: number) => {
    const styles: Record<number, string> = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-indigo-100 text-indigo-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-cyan-100 text-cyan-800',
      5: 'bg-teal-100 text-teal-800'
    };
    return styles[yearLevel] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Teaching Sections</h2>
        <p className="text-sm text-gray-500">View and manage your assigned course sections</p>
      </div>

      {/* Semester Selection */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={fetchMySections}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No sections assigned to you for {selectedSemester} {selectedYear}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {section.courseCode} - {section.courseName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(section.academicYearLevel)}`}>
                        Year {section.academicYearLevel}
                      </span>
                    </div>
                    <p className="text-gray-600">Section {section.sectionCode}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(section.status)}`}>
                    {section.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Enrolled: {section.enrolledStudents} / {section.maxStudents} students</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{section.schedule || 'Schedule TBA'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{section.room || 'Room TBA'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{section.semester} {section.academicYear}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      fetchSectionStudents(section.id);
                    }}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Students ({section.enrolledStudents})
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students Modal */}
      {showStudentModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold">Enrolled Students</h2>
                <p className="text-sm text-gray-500">
                  {selectedSection.courseCode} - Section {selectedSection.sectionCode} (Year {selectedSection.academicYearLevel})
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedSection.semester} {selectedSection.academicYear} | {selectedSection.schedule} | {selectedSection.room}
                </p>
              </div>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No students enrolled in this section yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-blue-600">{student.studentIdNumber}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t">
              <button onClick={() => setShowStudentModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// X icon component
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default InstructorSections;