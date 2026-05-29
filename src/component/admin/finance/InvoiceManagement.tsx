import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, FileText, Download, AlertCircle, Banknote } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  semester: string;
  academicYear: number;
  issueDate: string;
  dueDate: string;
  status: string;
}

interface Student {
  id: number;
  fullName: string;
  studentId: string;
  email: string;
  department: string;
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

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [students, setStudents] = useState<Student[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const statuses = ['ALL', 'PAID', 'PENDING', 'PARTIAL', 'OVERDUE'];

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, selectedStatus, invoices]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const result = await financeApi.getAllInvoices() as ApiResponse<Invoice[]>;
      if (result.success && 'data' in result) {
        setInvoices(Array.isArray(result.data) ? result.data : []);
      } else if (!result.success && 'message' in result) {
        toast.error(result.message || 'Failed to load invoices');
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
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

  const filterInvoices = () => {
    let filtered = [...invoices];
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(i => i.status === selectedStatus);
    }
    setFilteredInvoices(filtered);
  };

  const handleGenerateInvoice = async (studentId: number, semester: string, academicYear: number) => {
    const result = await financeApi.generateInvoice(studentId, semester, academicYear) as ApiResponse;
    if (result.success) { 
      toast.success('Invoice generated successfully'); 
      fetchInvoices(); 
      setShowGenerateModal(false); 
    } else if (!result.success && 'message' in result) {
      toast.error(result.message || 'Failed to generate invoice');
    } else {
      toast.error('Failed to generate invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.dueAmount || 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Invoice Management (ETB)</h2>
          <p className="text-sm text-gray-500">Manage student invoices and payments</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowGenerateModal(true)} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </button>
          <button 
            onClick={fetchInvoices} 
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Amount</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue Invoices</p>
              <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
            </div>
            <Banknote className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by student name or invoice #..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)} 
            className="px-4 py-2 border rounded-lg w-40 focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invoices found</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              + Generate your first invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (ETB)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid (ETB)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due (ETB)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inv.studentName}</div>
                      <div className="text-xs text-gray-500">{inv.studentIdNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      {formatCurrency(inv.dueAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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

      {showGenerateModal && (
        <GenerateInvoiceModal 
          students={students} 
          onClose={() => setShowGenerateModal(false)} 
          onGenerate={handleGenerateInvoice} 
        />
      )}
    </div>
  );
};
const GenerateInvoiceModal: React.FC<{ 
  students: Student[]; 
  onClose: () => void; 
  onGenerate: (studentId: number, semester: string, year: number) => void 
}> = ({ students, onClose, onGenerate }) => {
  const [formData, setFormData] = useState({ 
    studentId: '', 
    semester: 'FALL', 
    academicYear: new Date().getFullYear() 
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    setIsGenerating(true);
    onGenerate(parseInt(formData.studentId), formData.semester, formData.academicYear);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Invoice (ETB)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <select 
              value={formData.studentId} 
              onChange={(e) => setFormData({...formData, studentId: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select 
              value={formData.semester} 
              onChange={(e) => setFormData({...formData, semester: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="FALL">Fall Semester</option>
              <option value="SPRING">Spring Semester</option>
              <option value="SUMMER">Summer Semester</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input 
              type="number" 
              value={formData.academicYear} 
              onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value) || new Date().getFullYear()})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="2020"
              max="2030"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !formData.studentId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;