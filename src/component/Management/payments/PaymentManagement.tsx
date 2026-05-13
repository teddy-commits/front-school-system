import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, DollarSign, CreditCard, Calendar, Receipt, X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import ProcessPaymentModal from './ProcessPaymentModal';
import PaymentDetailsModal from './PaymentDetailsModal';

interface Payment {
  id: number;
  transactionId: string;
  studentId: number;
  studentName: string;
  amount: number;
  paymentMethod: string;
  studentIdNumber: string;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  paymentDate: string;
  feeDescription: string;
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

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const paymentMethods = ['ALL', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_MONEY', 'CASH', 'CHECK'];

  useEffect(() => { 
    fetchPayments(); 
    fetchStudents(); 
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, selectedMethod, payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    const result = await financeApi.getAllPayments() as ApiResponse<Payment[]>;
    if (result.success && 'data' in result) {
      setPayments(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch payments');
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

  const filterPayments = () => {
    let filtered = [...payments];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedMethod !== 'ALL') {
      filtered = filtered.filter(p => p.paymentMethod === selectedMethod);
    }
    setFilteredPayments(filtered);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = async (paymentId: number, transactionId: string) => {
    try {
      const result = await financeApi.downloadReceipt(paymentId) as ApiResponse<Blob>;
      if (result.success && 'data' in result) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${transactionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Receipt downloaded successfully');
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };
  
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Payment Management</h2>
          <p className="text-sm text-gray-500">Track and manage all transactions</p>
        </div>
        <button 
          onClick={() => setShowPaymentModal(true)} 
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Process Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(payments
                  .filter(p => {
                    try {
                      return new Date(p.paymentDate).getMonth() === new Date().getMonth();
                    } catch {
                      return false;
                    }
                  })
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
                )}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
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
              placeholder="Search by student name or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-4 py-2 border rounded-lg w-48 focus:ring-2 focus:ring-emerald-500"
          >
            {paymentMethods.map(m => <option key={m} value={m}>{m === 'ALL' ? 'All Methods' : m}</option>)}
          </select>
          <button 
            onClick={fetchPayments} 
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{p.transactionId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.studentName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-green-600">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(p.paymentDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(p.id, p.transactionId)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                          title="Download Receipt"
                        >
                          <Receipt className="w-4 h-4" />
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

      {showPaymentModal && (
        <ProcessPaymentModal 
          students={students} 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={fetchPayments} 
        />
      )}
      
      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal 
          payment={selectedPayment} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  );
};

export default PaymentManagement;