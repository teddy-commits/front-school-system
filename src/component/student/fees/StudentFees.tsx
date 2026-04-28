import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import FeePaymentModal from './FeePaymentModal';

interface Fee {
  id: number;
  feeType: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  dueDate: string;
}

const StudentFees: React.FC = () => {
  const { userId } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  useEffect(() => {
    if (userId) {
      fetchFees();
      fetchSummary();
    }
  }, [userId]);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const result = await financeApi.getStudentFees(userId!);
      if (result.success) {
        setFees(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const result = await financeApi.getStudentFeeSummary(userId!);
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fee Status</h2>
        <p className="text-sm text-gray-500">View your fee breakdown and make payments</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Fees</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalFees)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutstanding)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{fee.feeType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{fee.description}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(fee.amount)}</td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(fee.paidAmount)}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">{formatCurrency(fee.dueAmount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(fee.dueDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(fee.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(fee.status)}`}>
                        {fee.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {fee.status !== 'PAID' && (
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setShowPaymentModal(true);
                        }}
                        className="flex items-center justify-center px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Pay Now
                      </button>
                    )}
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <FeePaymentModal
          fee={selectedFee}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            fetchFees();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
};

export default StudentFees;