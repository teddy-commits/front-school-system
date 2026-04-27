import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, DollarSign, CreditCard, Calendar, Receipt } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  transactionId: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  amount: number;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  paymentDate: string;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const paymentMethods = ['ALL', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_MONEY', 'CASH', 'CHECK'];
  const statuses = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, selectedMethod, selectedStatus, payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const result = await financeApi.getAllPayments();
      if (result.success) {
        setPayments(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMethod !== 'ALL') {
      filtered = filtered.filter(p => p.paymentMethod === selectedMethod);
    }
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId: number, reason: string) => {
    const result = await financeApi.refundPayment(paymentId, reason);
    if (result.success) {
      toast.success('Payment refunded successfully');
      fetchPayments();
      setShowRefundModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const totalRevenue = payments.reduce((sum, p) => p.status === 'PAID' ? sum + p.amount : sum, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Payment Management</h2>
          <p className="text-sm text-gray-500">Track and manage all financial transactions</p>
        </div>
        <button onClick={fetchPayments} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p></div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Transactions</p><p className="text-2xl font-bold text-blue-600">{payments.length}</p></div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Successful Payments</p><p className="text-2xl font-bold text-purple-600">{payments.filter(p => p.status === 'PAID').length}</p></div>
            <Receipt className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">This Month</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0))}</p></div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by student name, transaction ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="px-4 py-2 border rounded-lg">
            {paymentMethods.map(m => <option key={m} value={m}>{m === 'ALL' ? 'All Methods' : m}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
            {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{payment.transactionId}</td>
                    <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{payment.studentName}</div><div className="text-xs text-gray-500">{payment.studentIdNumber}</div></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>{payment.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.receiptNumber || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setSelectedPayment(payment); setShowRefundModal(true); }} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Refund" disabled={payment.status !== 'PAID'}><Receipt className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <RefundModal payment={selectedPayment} onClose={() => setShowRefundModal(false)} onRefund={handleRefund} />
      )}
    </div>
  );
};

const RefundModal: React.FC<{ payment: Payment; onClose: () => void; onRefund: (id: number, reason: string) => void }> = ({ payment, onClose, onRefund }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b"><h2 className="text-xl font-semibold">Refund Payment</h2></div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Transaction: {payment.transactionId}</p>
          <p className="text-sm text-gray-600">Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}</p>
          <textarea placeholder="Reason for refund" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => onRefund(payment.id, reason)} className="px-4 py-2 bg-orange-600 text-white rounded-lg">Process Refund</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;