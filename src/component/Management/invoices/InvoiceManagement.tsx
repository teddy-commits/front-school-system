import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, FileText, Download, Plus } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import GenerateInvoiceModal from './GenerateInvoiceModal';
import InvoiceDetailsModal from './InvoiceDetailsModal';

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
  items?: any[];
}

interface Student {
  id: number;
  fullName: string;
  studentId: string;
  email: string;
  department: string;
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

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

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
    const result = await financeApi.getAllInvoices() as ApiResponse<Invoice[]>;
    if (result.success && 'data' in result) {
      setInvoices(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch invoices');
    }
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const result = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
    if (result.success && 'data' in result) {
      setStudents(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(inv => inv.status === selectedStatus);
    }
    setFilteredInvoices(filtered);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

 const handleDownload = async (invoiceId: number, invoiceNumber: string) => {
  try {
    const result = await financeApi.downloadInvoice(invoiceId) as ApiResponse<Blob>;
    if (result.success && 'data' in result) {
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to download invoice');
    }
  } catch (error) {
    console.error('Error downloading invoice:', error);
    toast.error('Failed to download invoice');
  }
};
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Invoice Management</h2>
          <p className="text-sm text-gray-500">View, manage and download student invoices</p>
        </div>
        <button 
          onClick={() => setShowGenerateModal(true)} 
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0))}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.dueAmount || 0), 0))}
              </p>
            </div>
            <FileText className="w-8 h-8 text-red-500" />
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
              placeholder="Search by invoice number or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg w-40 focus:ring-2 focus:ring-emerald-500"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
          </select>
          <button 
            onClick={fetchInvoices} 
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.studentName}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(inv.dueAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.semester} {inv.academicYear}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(inv)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
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
          onSuccess={fetchInvoices} 
        />
      )}
      
      {showDetailsModal && selectedInvoice && (
        <InvoiceDetailsModal 
          invoice={selectedInvoice} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  );
};

export default InvoiceManagement;