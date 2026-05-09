import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, Clock, MapPin, Eye, RefreshCw, X, ChevronDown } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import { courseApi } from '../../../api/modules/courseApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  academicYearLevel: number; // NEW - Year of study (1,2,3,4,5)
  semester: string;
  academicYear: number;
  instructorId: number;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule: string;
  room: string;
  status: string;
  hasAvailableSeats: boolean;
  createdAt: string;
  updatedAt: string;
}

const SectionManagement: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const yearLevels = ['ALL', '1', '2', '3', '4', '5'];
  const semesters = ['ALL', 'FALL', 'SPRING', 'SUMMER'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSections();
  }, [searchTerm, selectedCourse, selectedYearLevel, selectedSemester, sections]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAllSections(),
      fetchCourses(),
      fetchInstructors()
    ]);
    setIsLoading(false);
  };

  const fetchAllSections = async () => {
    const result = await sectionApi.getAllSections();
    if (result.success) {
      setSections(result.data);
    } else {
      toast.error(result.message || 'Failed to fetch sections');
    }
  };

  const fetchCourses = async () => {
    const result = await courseApi.getAllCourses();
    if (result.success) setCourses(result.data);
  };

  const fetchInstructors = async () => {
    const result = await registrationApi.getAllInstructors();
    if (result.success) setInstructors(result.data);
  };

  const filterSections = () => {
    let filtered = [...sections];
    
    if (searchTerm) {
      filtered = filtered.filter(section =>
        section.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCourse !== 'ALL') {
      filtered = filtered.filter(section => section.courseId.toString() === selectedCourse);
    }
    
    if (selectedYearLevel !== 'ALL') {
      filtered = filtered.filter(section => section.academicYearLevel.toString() === selectedYearLevel);
    }
    
    if (selectedSemester !== 'ALL') {
      filtered = filtered.filter(section => section.semester === selectedSemester);
    }
    
    setFilteredSections(filtered);
  };

  const handleDelete = async (id: number, sectionCode: string) => {
    if (window.confirm(`Delete section "${sectionCode}"? This will also remove all student enrollments.`)) {
      const result = await sectionApi.deleteSection(id);
      if (result.success) {
        toast.success('Section deleted successfully');
        fetchAllSections();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const result = await sectionApi.updateSectionStatus(id, newStatus);
    if (result.success) {
      toast.success(`Section status updated to ${newStatus}`);
      fetchAllSections();
    } else {
      toast.error(result.message);
    }
  };

  const handleEditClick = (section: Section) => {
    setEditingSection(section);
    setShowEditModal(true);
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

  const getSeatStatus = (enrolled: number, max: number) => {
    if (enrolled >= max) return 'FULL';
    if (enrolled >= max * 0.8) return 'ALMOST FULL';
    return 'AVAILABLE';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Section Management</h2>
          <p className="text-sm text-gray-500">Manage course sections, schedules, and instructors</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sections</p>
              <p className="text-2xl font-bold text-gray-800">{sections.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sections</p>
              <p className="text-2xl font-bold text-green-600">{sections.filter(s => s.status === 'OPEN').length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-bold text-purple-600">{sections.reduce((sum, s) => sum + s.enrolledStudents, 0)}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Full Sections</p>
              <p className="text-2xl font-bold text-orange-600">{sections.filter(s => !s.hasAvailableSeats).length}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
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
              placeholder="Search by course code, section, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
            ))}
          </select>
          <select
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
            className="px-4 py-2 border rounded-lg w-40"
          >
            {yearLevels.map(level => (
              <option key={level} value={level}>{level === 'ALL' ? 'All Years' : `Year ${level}`}</option>
            ))}
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg w-40"
          >
            {semesters.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Semesters' : s}</option>)}
          </select>
          <button
            onClick={fetchAllSections}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sections found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Create your first section
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{section.courseCode}</div>
                      <div className="text-xs text-gray-500">{section.courseName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {section.sectionCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Year {section.academicYearLevel}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{section.instructorName || 'Not Assigned'}</div>
                      <div className="text-xs text-gray-500">{section.instructorEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{section.schedule || 'TBA'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{section.room || 'TBA'}</td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{section.enrolledStudents}/{section.maxStudents}</div>
                        <div className="text-xs text-gray-500">{getSeatStatus(section.enrolledStudents, section.maxStudents)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{section.semester} {section.academicYear}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={section.status}
                          onChange={(e) => handleUpdateStatus(section.id, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 ${getStatusBadge(section.status)}`}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="FULL">FULL</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(section)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit Section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id, section.sectionCode)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Section Modal */}
      {showCreateModal && (
        <CreateSectionModal
          courses={courses}
          instructors={instructors}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAllSections();
          }}
        />
      )}

      {/* Edit Section Modal */}
      {showEditModal && editingSection && (
        <EditSectionModal
          section={editingSection}
          courses={courses}
          instructors={instructors}
          onClose={() => {
            setShowEditModal(false);
            setEditingSection(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingSection(null);
            fetchAllSections();
          }}
        />
      )}
    </div>
  );
};

// Create Section Modal
const CreateSectionModal: React.FC<{
  courses: any[];
  instructors: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ courses, instructors, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    sectionCode: '',
    academicYearLevel: '1', // NEW - Default to Year 1
    semester: 'FALL',
    academicYear: new Date().getFullYear(),
    instructorId: '',
    maxStudents: 40,
    schedule: '',
    room: '',
    status: 'OPEN'
  });

  const academicYearLevels = [
    { value: '1', label: 'Year 1' },
    { value: '2', label: 'Year 2' },
    { value: '3', label: 'Year 3' },
    { value: '4', label: 'Year 4' },
    { value: '5', label: 'Year 5' }
  ];

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const statuses = ['OPEN', 'CLOSED', 'FULL', 'CANCELLED'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await sectionApi.createSection({
      ...formData,
      courseId: parseInt(formData.courseId),
      instructorId: formData.instructorId ? parseInt(formData.instructorId) : null,
      maxStudents: parseInt(formData.maxStudents.toString()),
      academicYear: parseInt(formData.academicYear.toString()),
      academicYearLevel: parseInt(formData.academicYearLevel)
    });
    
    if (result.success) {
      toast.success(`Section ${formData.sectionCode} created for Year ${formData.academicYearLevel}`);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Create Course Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Code *</label>
              <input
                type="text"
                required
                value={formData.sectionCode}
                onChange={(e) => setFormData({...formData, sectionCode: e.target.value.toUpperCase()})}
                placeholder="e.g., A, B, 01, 02"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year Level *</label>
              <select
                value={formData.academicYearLevel}
                onChange={(e) => setFormData({...formData, academicYearLevel: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {academicYearLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input
                type="number"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <select
              value={formData.instructorId}
              onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Instructor</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>{i.fullName} ({i.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                min={5}
                max={200}
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                placeholder="e.g., Monday 10:00-12:00"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 101"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Example section info */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium">Section Information:</p>
            <p className="text-xs mt-1">
              Example: Year 3, Section 2 for CS101 means: Academic Year Level = 3, Section Code = 2
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              {isLoading ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Section Modal
const EditSectionModal: React.FC<{
  section: Section;
  courses: any[];
  instructors: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ section, courses, instructors, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: section.courseId.toString(),
    sectionCode: section.sectionCode,
    academicYearLevel: section.academicYearLevel?.toString() || '1',
    semester: section.semester,
    academicYear: section.academicYear,
    instructorId: section.instructorId?.toString() || '',
    maxStudents: section.maxStudents,
    schedule: section.schedule || '',
    room: section.room || '',
    status: section.status
  });

  const academicYearLevels = [
    { value: '1', label: 'Year 1' },
    { value: '2', label: 'Year 2' },
    { value: '3', label: 'Year 3' },
    { value: '4', label: 'Year 4' },
    { value: '5', label: 'Year 5' }
  ];

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const statuses = ['OPEN', 'CLOSED', 'FULL', 'CANCELLED'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await sectionApi.updateSection(section.id, {
      ...formData,
      courseId: parseInt(formData.courseId),
      instructorId: formData.instructorId ? parseInt(formData.instructorId) : null,
      maxStudents: parseInt(formData.maxStudents.toString()),
      academicYear: parseInt(formData.academicYear.toString()),
      academicYearLevel: parseInt(formData.academicYearLevel)
    });
    
    if (result.success) {
      toast.success('Section updated successfully');
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Edit Section</h2>
            <p className="text-sm text-gray-500">{section.courseCode} - Section {section.sectionCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              disabled
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Code *</label>
              <input
                type="text"
                required
                value={formData.sectionCode}
                onChange={(e) => setFormData({...formData, sectionCode: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year Level *</label>
              <select
                value={formData.academicYearLevel}
                onChange={(e) => setFormData({...formData, academicYearLevel: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {academicYearLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input
                type="number"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <select
              value={formData.instructorId}
              onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Instructor</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>{i.fullName} ({i.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                min={5}
                max={200}
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                placeholder="e.g., Monday 10:00-12:00"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 101"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Search icon component
const Search: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default SectionManagement;