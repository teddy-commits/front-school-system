import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, RefreshCw, X, Eye } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import SectionDetailsModal from './SectionDetailsModal';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  sectionCode: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  maxStudents: number;
  enrolledStudents: number;
  status: string;
  hasAvailableSeats: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: number;
  code: string;
  name: string;
  faculty: string;
  isActive: boolean;
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

const SectionManagement: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSectionForDetails, setSelectedSectionForDetails] = useState<Section | null>(null);

  const yearLevels = ['ALL', '1', '2', '3', '4', '5'];
  const semesters = ['ALL', 'FALL', 'SPRING', 'SUMMER'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSections();
  }, [searchTerm, selectedDepartment, selectedYearLevel, selectedSemester, sections]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAllSections(),
      fetchDepartments()
    ]);
    setIsLoading(false);
  };

  const fetchAllSections = async () => {
    const result = await sectionApi.getAllSections() as ApiResponse<Section[]>;
    if (result.success && 'data' in result) {
      setSections(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message || 'Failed to fetch sections');
    } else {
      toast.error('Failed to fetch sections');
    }
  };

  const fetchDepartments = async () => {
    const result = await departmentApi.getActiveDepartments() as ApiResponse<Department[]>;
    if (result.success && 'data' in result) {
      setDepartments(Array.isArray(result.data) ? result.data : []);
    }
  };

  const filterSections = () => {
    let filtered = [...sections];
    
    if (searchTerm) {
      filtered = filtered.filter(section =>
        section.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.sectionCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment !== 'ALL') {
      filtered = filtered.filter(section => section.departmentId.toString() === selectedDepartment);
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
      const result = await sectionApi.deleteSection(id) as ApiResponse;
      if (result.success) {
        toast.success('Section deleted successfully');
        fetchAllSections();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to delete section');
      }
    }
  };

  const handleViewDetails = (section: Section) => {
    setSelectedSectionForDetails(section);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const result = await sectionApi.updateSectionStatus(id, newStatus) as ApiResponse;
    if (result.success) {
      toast.success(`Section status updated to ${newStatus}`);
      fetchAllSections();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update status');
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
      {/* Rest of the JSX remains exactly the same */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Section Management</h2>
          <p className="text-sm text-gray-500">Manage course sections by department and year level</p>
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
            <Users className="w-8 h-8 text-green-500" />
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
              placeholder="Search by department or section code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
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
                      <div className="text-sm font-medium text-gray-900">{section.departmentCode}</div>
                      <div className="text-xs text-gray-500">{section.departmentName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {section.sectionCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(section.academicYearLevel)}`}>
                        Year {section.academicYearLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{section.enrolledStudents}/{section.maxStudents}</div>
                        <div className="text-xs text-gray-500">{getSeatStatus(section.enrolledStudents, section.maxStudents)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{section.semester} {section.academicYear}</td>
                    <td className="px-6 py-4">
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
                        <button
                          onClick={() => handleViewDetails(section)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
          departments={departments}
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
          departments={departments}
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
      {showDetailsModal && selectedSectionForDetails && (
        <SectionDetailsModal
          section={selectedSectionForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSectionForDetails(null);
          }}
          onUpdate={() => {
            fetchAllSections();
          }}
        />
      )}
    </div>
  );
};

// Create Section Modal
const CreateSectionModal: React.FC<{
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ departments, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: '',
    sectionCode: '',
    academicYearLevel: '1',
    semester: 'FALL',
    academicYear: new Date().getFullYear(),
    maxStudents: 40,
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
      departmentId: parseInt(formData.departmentId),
      maxStudents: parseInt(formData.maxStudents.toString()),
      academicYear: parseInt(formData.academicYear.toString()),
      academicYearLevel: parseInt(formData.academicYearLevel)
    }) as ApiResponse;
    
    if (result.success) {
      toast.success(`Section ${formData.sectionCode} created successfully`);
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to create section');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Create Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Level *</label>
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

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium">Note:</p>
            <p className="text-xs mt-1">
              After creating the section, you can add courses and assign instructors to this section.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
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
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ section, departments, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: section.departmentId.toString(),
    sectionCode: section.sectionCode,
    academicYearLevel: section.academicYearLevel.toString(),
    semester: section.semester,
    academicYear: section.academicYear,
    maxStudents: section.maxStudents,
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
      departmentId: parseInt(formData.departmentId),
      maxStudents: parseInt(formData.maxStudents.toString()),
      academicYear: parseInt(formData.academicYear.toString()),
      academicYearLevel: parseInt(formData.academicYearLevel)
    }) as ApiResponse;
    
    if (result.success) {
      toast.success('Section updated successfully');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update section');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Section</h2>
            <p className="text-sm text-gray-500">Section {section.sectionCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Code *</label>
            <input
              type="text"
              value={formData.sectionCode}
              onChange={(e) => setFormData({...formData, sectionCode: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="number"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
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

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
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