import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, DollarSign, 
  RefreshCw, X, CheckCircle, AlertCircle, Banknote
} from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface FeeStructure {
  id: number;
  feeType: string;
  category: string;
  description: string;
  amount: number;
  department: string;
  faculty: string;
  isMandatory: boolean;
  academicYear: number;
  semester: string;
  dueDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  isActive: boolean;
}

interface Student {
  id: number;
  fullName: string;
  studentId: string;
  email: string;
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

const FeeManagement: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const feeTypes = ['ALL', 'TUITION', 'REGISTRATION', 'LIBRARY', 'LABORATORY', 'SPORTS', 'EXAMINATION', 'ID_CARD'];

  useEffect(() => {
    fetchFeeStructures();
    fetchStudents();
  }, []);

  useEffect(() => {
    filterFees();
  }, [searchTerm, selectedType, feeStructures]);

  const fetchFeeStructures = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching fee structures...');
      const result = await financeApi.getAllFeeStructures() as ApiResponse<any>;
      console.log('API Response:', result);
      
      if (result.success && 'data' in result) {
        console.log('Data received:', result.data);
        console.log('Is data an array?', Array.isArray(result.data));
        console.log('Data type:', typeof result.data);
        
        let feeData: FeeStructure[] = [];
        if (Array.isArray(result.data)) {
          feeData = result.data;
        } else if (result.data && typeof result.data === 'object') {
          if (result.data.content && Array.isArray(result.data.content)) {
            feeData = result.data.content;
          } else if (result.data.items && Array.isArray(result.data.items)) {
            feeData = result.data.items;
          } else {
            console.warn('Unexpected data structure:', result.data);
            feeData = [];
          }
        }
        
        setFeeStructures(feeData);
        toast.success(`Loaded ${feeData.length} fee structures`);
      } else if (!result.success && 'message' in result) {
        console.error('API Error:', result.message);
        toast.error(result.message || 'Failed to load fee structures');
        setFeeStructures([]);
      } else {
        toast.error('Failed to load fee structures');
        setFeeStructures([]);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      toast.error('Failed to load fee structures');
      setFeeStructures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
      if (result.success && 'data' in result) {
        setStudents(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const filterFees = () => {
    const feeArray = Array.isArray(feeStructures) ? feeStructures : [];
    let filtered = [...feeArray];
    
    if (searchTerm) {
      filtered = filtered.filter(fee =>
        fee.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(fee => fee.feeType === selectedType);
    }
    
    setFilteredFees(filtered);
  };

  const handleDelete = async (id: number, description: string) => {
    if (window.confirm(`Delete fee structure "${description}"?`)) {
      const result = await financeApi.deleteFeeStructure(id) as ApiResponse;
      if (result.success) {
        toast.success('Fee structure deleted');
        fetchFeeStructures();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to delete fee structure');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const calculateTotalRevenue = () => {
    const feeArray = Array.isArray(feeStructures) ? feeStructures : [];
    return feeArray.reduce((sum, f) => sum + (f.amount || 0), 0);
  };

  const countMandatoryFees = () => {
    const feeArray = Array.isArray(feeStructures) ? feeStructures : [];
    return feeArray.filter(f => f.isMandatory).length;
  };

  const countActiveStructures = () => {
    const feeArray = Array.isArray(feeStructures) ? feeStructures : [];
    return feeArray.filter(f => f.isActive).length;
  };

  const feeStructuresArray = Array.isArray(feeStructures) ? feeStructures : [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Fee Structure Management</h2>
          <p className="text-sm text-gray-500">Manage university fee structures and charges</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Generate Student Fee
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Fee Structure
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fee Structures</p>
              <p className="text-2xl font-bold text-gray-800">{feeStructuresArray.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue (Projected)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateTotalRevenue())}
              </p>
            </div>
            <Banknote className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mandatory Fees</p>
              <p className="text-2xl font-bold text-purple-600">
                {countMandatoryFees()}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Structures</p>
              <p className="text-2xl font-bold text-orange-600">
                {countActiveStructures()}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description, fee type or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {feeTypes.map(type => (
                <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchFeeStructures}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Fee Structures Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mandatory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fee.feeType === 'TUITION' ? 'bg-blue-100 text-blue-800' :
                        fee.feeType === 'REGISTRATION' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {fee.feeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(fee.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.department || 'ALL'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(fee.dueDate)}</td>
                    <td className="px-6 py-4">
                      {fee.isMandatory ? (
                        <span className="text-green-600 text-sm">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id, fee.description)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        
        {filteredFees.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No fee structures found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-700"
            >
              + Create your first fee structure
            </button>
          </div>
        )}
      </div>

      {/* Create Fee Structure Modal */}
      {showCreateModal && (
        <CreateFeeStructureModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchFeeStructures}
        />
      )}

      {/* Edit Fee Structure Modal */}
      {showEditModal && selectedFee && (
        <EditFeeStructureModal 
          fee={selectedFee}
          onClose={() => setShowEditModal(false)} 
          onSuccess={fetchFeeStructures}
        />
      )}

      {/* Generate Student Fee Modal */}
      {showGenerateModal && (
        <GenerateStudentFeeModal 
          students={students}
          feeStructures={feeStructuresArray}
          onClose={() => setShowGenerateModal(false)} 
          onSuccess={fetchFeeStructures}
        />
      )}
    </div>
  );
};
// Create Fee Structure Modal Component
const CreateFeeStructureModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    feeType: 'TUITION',
    category: 'SEMESTER',
    description: '',
    amount: 0,
    department: '',
    faculty: '',
    isMandatory: true,
    academicYear: new Date().getFullYear(),
    semester: 'FALL',
    dueDate: '',
    gracePeriodDays: 15,
    lateFeePercentage: 5.0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedData = {
    ...formData,
    dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : ''  // Empty string instead of undefined
  };
  
    
    const result = await financeApi.createFeeStructure(formattedData) as ApiResponse;
    if (result.success) {
      toast.success('Fee structure created');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to create fee structure');
    }
    setIsLoading(false);
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create Fee Structure</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <select name="feeType" value={formData.feeType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="TUITION">Tuition Fee</option>
                <option value="REGISTRATION">Registration Fee</option>
                <option value="LIBRARY">Library Fee</option>
                <option value="LABORATORY">Laboratory Fee</option>
                <option value="SPORTS">Sports Fee</option>
                <option value="EXAMINATION">Examination Fee</option>
                <option value="ID_CARD">ID Card Fee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="SEMESTER">Semester</option>
                <option value="ANNUAL">Annual</option>
                <option value="ONE_TIME">One Time</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" name="description" required value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" name="amount" required value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isMandatory" checked={formData.isMandatory} onChange={handleChange} className="mr-2" />
            <label className="text-sm text-gray-700">Mandatory Fee</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Fee Structure Modal
const EditFeeStructureModal: React.FC<{ fee: FeeStructure; onClose: () => void; onSuccess: () => void }> = ({ fee, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: fee.description,
    amount: fee.amount,
    isMandatory: fee.isMandatory,
    dueDate: fee.dueDate?.split('T')[0] || '',
    gracePeriodDays: fee.gracePeriodDays,
    lateFeePercentage: fee.lateFeePercentage,
    isActive: fee.isActive
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await financeApi.updateFeeStructure(fee.id, formData) as ApiResponse;
    if (result.success) {
      toast.success('Fee structure updated');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update fee structure');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Fee Structure</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isMandatory" checked={formData.isMandatory} onChange={handleChange} className="mr-2" />
            <label className="text-sm text-gray-700">Mandatory Fee</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="mr-2" />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Generate Student Fee Modal
const GenerateStudentFeeModal: React.FC<{ students: Student[]; feeStructures: FeeStructure[]; onClose: () => void; onSuccess: () => void }> = ({ students, feeStructures, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    feeStructureId: '',
    semester: 'FALL',
    academicYear: new Date().getFullYear()
  });

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.studentId || !formData.feeStructureId) {
    toast.error('Please select both student and fee structure');
    return;
  }
  
  setIsLoading(true);
  
  const result = await financeApi.generateStudentFee(
    parseInt(formData.studentId),      // Convert to number
    parseInt(formData.feeStructureId), // Convert to number
    formData.semester, 
    formData.academicYear
  ) as ApiResponse;
  
  if (result.success) {
    toast.success('Fee generated for student');
    onSuccess();
    onClose();
  } else if (!result.success && 'message' in result) {
    toast.error(result.message);
  } else {
    toast.error('Failed to generate fee');
  }
  setIsLoading(false);
};
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Student Fee</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select name="studentId" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
            <select name="feeStructureId" value={formData.feeStructureId} onChange={(e) => setFormData({...formData, feeStructureId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="">Select Fee Structure</option>
              {Array.isArray(feeStructures) && feeStructures.map(f => (
                <option key={f.id} value={f.id}>{f.description} - {formatCurrency(f.amount)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select name="semester" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input type="number" name="academicYear" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Generate</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeManagement;