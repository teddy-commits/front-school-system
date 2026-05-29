import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, RefreshCw, X, 
  Building2, CheckCircle, XCircle, Eye, 
  Mail, Phone, MapPin, User, Info
} from 'lucide-react';
import { departmentApi } from '../../../api/modules/departmentApi';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  faculty: string;
  headOfDepartment: string;
  headEmail: string;
  contactPhone: string;
  officeLocation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  faculty: string;
  headOfDepartment: string;
  headEmail: string;
  contactPhone: string;
  officeLocation: string;
  isActive: boolean;
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

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    faculty: '',
    headOfDepartment: '',
    headEmail: '',
    contactPhone: '',
    officeLocation: '',
    isActive: true
  });

  const faculties = [
    'Faculty of Computing and Informatics',
    'Faculty of Engineering',
    'Faculty of Business and Economics',
    'Faculty of Science',
    'Faculty of Arts and Humanities'
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [searchTerm, selectedStatus, departments]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    const result = await departmentApi.getAllDepartments() as ApiResponse<Department[]>;
    if (result.success && 'data' in result) {
      setDepartments(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch departments');
    }
    setIsLoading(false);
  };

  const filterDepartments = () => {
    let filtered = [...departments];
    
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(dept => 
        selectedStatus === 'ACTIVE' ? dept.isActive : !dept.isActive
      );
    }
    
    setFilteredDepartments(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await departmentApi.createDepartment(formData) as ApiResponse;
    if (result.success) {
      toast.success('Department created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchDepartments();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to create department');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    
    const result = await departmentApi.updateDepartment(selectedDepartment.id, formData) as ApiResponse;
    if (result.success) {
      toast.success('Department updated successfully');
      setShowEditModal(false);
      setSelectedDepartment(null);
      resetForm();
      fetchDepartments();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update department');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Delete department "${name}"? This action cannot be undone.`)) {
      const result = await departmentApi.deleteDepartment(id) as ApiResponse;
      if (result.success) {
        toast.success('Department deleted successfully');
        fetchDepartments();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to delete department');
      }
    }
  };

  const handleActivate = async (id: number) => {
    const result = await departmentApi.activateDepartment(id) as ApiResponse;
    if (result.success) {
      toast.success('Department activated');
      fetchDepartments();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to activate department');
    }
  };

  const handleDeactivate = async (id: number) => {
    const result = await departmentApi.deactivateDepartment(id) as ApiResponse;
    if (result.success) {
      toast.success('Department deactivated');
      fetchDepartments();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to deactivate department');
    }
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      description: department.description || '',
      faculty: department.faculty || '',
      headOfDepartment: department.headOfDepartment || '',
      headEmail: department.headEmail || '',
      contactPhone: department.contactPhone || '',
      officeLocation: department.officeLocation || '',
      isActive: department.isActive
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (department: Department) => {
    setSelectedDepartment(department);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      faculty: '',
      headOfDepartment: '',
      headEmail: '',
      contactPhone: '',
      officeLocation: '',
      isActive: true
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'code') {
      const upperValue = value.toUpperCase().replace(/[^A-Z]/g, '');
      const limitedValue = upperValue.slice(0, 5);
      setFormData({ ...formData, [name]: limitedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Department Management</h2>
          <p className="text-sm text-gray-500">Manage university departments and their information</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-2xl font-bold text-gray-800">{departments.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Departments</p>
              <p className="text-2xl font-bold text-green-600">{departments.filter(d => d.isActive).length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faculties</p>
              <p className="text-2xl font-bold text-purple-600">{new Set(departments.map(d => d.faculty)).size}</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Departments</p>
              <p className="text-2xl font-bold text-red-600">{departments.filter(d => !d.isActive).length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
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
              placeholder="Search by name, code or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg w-40 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={fetchDepartments}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head of Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-mono font-semibold bg-gray-100 text-gray-700 rounded">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{dept.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.faculty || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{dept.headOfDepartment || '-'}</div>
                      {dept.headEmail && <div className="text-xs text-gray-500">{dept.headEmail}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {dept.contactPhone && <div className="text-sm text-gray-600">{dept.contactPhone}</div>}
                      {dept.officeLocation && <div className="text-xs text-gray-400">{dept.officeLocation}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dept.isActive)}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(dept)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {dept.isActive ? (
                          <button
                            onClick={() => handleDeactivate(dept.id)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition"
                            title="Deactivate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(dept.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
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
        
        {filteredDepartments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No departments found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add your first department
            </button>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Add New Department</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., CS, ENG, TEDU"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Department description..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                  <input
                    type="text"
                    name="headOfDepartment"
                    value={formData.headOfDepartment}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head Email</label>
                  <input
                    type="email"
                    name="headEmail"
                    value={formData.headEmail}
                    onChange={handleChange}
                    placeholder="hod@university.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                  <input
                    type="text"
                    name="officeLocation"
                    value={formData.officeLocation}
                    onChange={handleChange}
                    placeholder="Building, Room number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2 w-4 h-4 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Edit Department</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                  <input type="text" name="headOfDepartment" value={formData.headOfDepartment} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head Email</label>
                  <input type="email" name="headEmail" value={formData.headEmail} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                  <input type="text" name="officeLocation" value={formData.officeLocation} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="mr-2 w-4 h-4 rounded focus:ring-indigo-500" />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Department Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Department Code</p>
                  <p className="text-lg font-mono font-bold text-indigo-600">{selectedDepartment.code}</p>
                </div>
                <Building2 className="w-8 h-8 text-indigo-500" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="text-sm text-gray-500">Name:</span> <span className="text-sm font-medium">{selectedDepartment.name}</span></p>
                  <p><span className="text-sm text-gray-500">Description:</span> <span className="text-sm">{selectedDepartment.description || 'N/A'}</span></p>
                  <p><span className="text-sm text-gray-500">Faculty:</span> <span className="text-sm">{selectedDepartment.faculty || 'N/A'}</span></p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center"><User className="w-4 h-4 text-gray-400 mr-2" /><span className="text-sm">Head: {selectedDepartment.headOfDepartment || 'Not assigned'}</span></div>
                  <div className="flex items-center"><Mail className="w-4 h-4 text-gray-400 mr-2" /><span className="text-sm">{selectedDepartment.headEmail || 'No email'}</span></div>
                  <div className="flex items-center"><Phone className="w-4 h-4 text-gray-400 mr-2" /><span className="text-sm">{selectedDepartment.contactPhone || 'No phone'}</span></div>
                  <div className="flex items-center"><MapPin className="w-4 h-4 text-gray-400 mr-2" /><span className="text-sm">{selectedDepartment.officeLocation || 'No location'}</span></div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Status Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-32">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedDepartment.isActive)}`}>
                      {selectedDepartment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-32">Created:</span>
                    <span className="text-sm">{new Date(selectedDepartment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-32">Last Updated:</span>
                    <span className="text-sm">{new Date(selectedDepartment.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;