import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { sectionApi } from '../../../api/modules/sectionApi';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  RefreshCw,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  UserPlus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  instructorName: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule: string;
  room: string;
  status: string;
  hasAvailableSeats: boolean;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  faculty: string;
  academicYearLevel: number;
  isActive: boolean;
}

interface EnrolledStudent {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  email: string;
  enrollmentDate: string;
  status: string;
}

const AdminSectionEnrollment: React.FC = () => {
  const { userEmail } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('ALL');

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];
  const yearLevels = ['ALL', '1', '2', '3', '4', '5'];

  useEffect(() => {
    fetchSections();
  }, [selectedSemester, selectedYear]);

  useEffect(() => {
    if (selectedSection) {
      fetchEnrolledStudents();
    }
  }, [selectedSection]);

  useEffect(() => {
    filterAvailableStudents();
  }, [searchTerm, selectedYearLevel, availableStudents]);

  const fetchSections = async () => {
    setIsLoading(true);
    const result = await sectionApi.getSectionsBySemester(selectedSemester, selectedYear);
    if (result.success) {
      setSections(result.data);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const fetchEnrolledStudents = async () => {
    if (!selectedSection) return;
    const result = await enrollmentApi.getSectionEnrollments(selectedSection.id);
    if (result.success) {
      setEnrolledStudents(result.data);
    } else {
      toast.error(result.message);
    }
  };

  const fetchAvailableStudents = async () => {
    const result = await registrationApi.getAllStudents();
    if (result.success) {
      // Filter out students already enrolled in this section
      const enrolledIds = enrolledStudents.map(s => s.studentId);
      const available = result.data.filter(
        (student: any) => !enrolledIds.includes(student.id) && student.isActive
      );
      setAvailableStudents(available);
      setFilteredAvailableStudents(available);
    } else {
      toast.error(result.message);
    }
  };

  const filterAvailableStudents = () => {
    let filtered = [...availableStudents];
    
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedYearLevel !== 'ALL') {
      filtered = filtered.filter(student => 
        student.academicYearLevel?.toString() === selectedYearLevel
      );
    }
    
    setFilteredAvailableStudents(filtered);
  };

  const handleAddStudent = async (studentId: number) => {
    if (!selectedSection) return;
    
    const result = await enrollmentApi.enrollInSection({
      studentId: studentId,
      sectionId: selectedSection.id
    });
    
    if (result.success) {
      toast.success('Student added to section successfully');
      fetchEnrolledStudents();
      fetchAvailableStudents();
      setShowAddModal(false);
      setSearchTerm('');
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveStudent = async (enrollmentId: number, studentName: string) => {
    if (window.confirm(`Remove ${studentName} from this section?`)) {
      const result = await enrollmentApi.dropSection(enrollmentId);
      if (result.success) {
        toast.success('Student removed from section');
        fetchEnrolledStudents();
        fetchAvailableStudents();
      } else {
        toast.error(result.message);
      }
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

  const openAddModal = async () => {
    await fetchAvailableStudents();
    setShowAddModal(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Section Enrollment Management</h2>
        <p className="text-sm text-gray-500">Assign students to course sections</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={fetchSections}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sections List */}
      {!selectedSection ? (
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => setSelectedSection(section)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-indigo-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
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
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.semester} {section.academicYear}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.schedule || 'TBA'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.room || 'TBA'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{section.enrolledStudents} / {section.maxStudents} students</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="flex items-center text-indigo-600 text-sm">
                  Manage Enrollments <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
          {sections.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sections available for {selectedSemester} {selectedYear}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedSection(null);
              setEnrolledStudents([]);
            }}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Sections
          </button>

          {/* Section Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedSection.courseCode} - {selectedSection.courseName}</h2>
                <p className="text-indigo-100 mt-1">
                  Section {selectedSection.sectionCode} | Year {selectedSection.academicYearLevel}
                </p>
                <div className="flex gap-4 mt-3 text-sm text-indigo-100">
                  <span>{selectedSection.semester} {selectedSection.academicYear}</span>
                  <span>{selectedSection.schedule || 'Schedule TBA'}</span>
                  <span>{selectedSection.room || 'Room TBA'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{enrolledStudents.length}</div>
                <div className="text-sm text-indigo-100">Enrolled Students</div>
                <div className="text-sm text-indigo-100">Max: {selectedSection.maxStudents}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Enrolled Students</h3>
            {selectedSection.hasAvailableSeats && (
              <button
                onClick={openAddModal}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </button>
            )}
          </div>

          {/* Enrolled Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrolledStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-indigo-600">{student.studentIdNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRemoveStudent(student.id, student.studentName)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {enrolledStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No students enrolled in this section</p>
                <button
                  onClick={openAddModal}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add your first student
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold">Add Students to Section</h2>
                <p className="text-sm text-gray-500">
                  {selectedSection?.courseCode} - Section {selectedSection?.sectionCode}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={selectedYearLevel}
                  onChange={(e) => setSelectedYearLevel(e.target.value)}
                  className="px-4 py-2 border rounded-lg w-40"
                >
                  {yearLevels.map(level => (
                    <option key={level} value={level}>{level === 'ALL' ? 'All Years' : `Year ${level}`}</option>
                  ))}
                </select>
              </div>

              {/* Available Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAvailableStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-indigo-600">{student.studentId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.department}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(student.academicYearLevel)}`}>
                            Year {student.academicYearLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleAddStudent(student.id)}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            Add to Section
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAvailableStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No students available to add</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSectionEnrollment;