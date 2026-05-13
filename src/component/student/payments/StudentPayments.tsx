import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Banknote, Receipt } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  paymentDate: string;
  feeDescription: string;
}

const StudentPayments: React.FC = () => {
  const { userId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const result = await financeApi.getStudentPayments(userId!);
      if (result.success) {
        setPayments(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error(result.message || 'Failed to load payment history');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Format as Ethiopian Birr (ETB)
  const formatCurrency = (amount: number) => {
    return `ETB ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodDisplay = (method: string) => {
    return method?.replace(/_/g, ' ') || 'N/A';
  };

  const handleDownloadReceipt = (payment: Payment) => {
    if (payment.receiptNumber) {
      console.log('Downloading receipt:', payment.receiptNumber);
      toast.success(`Downloading receipt ${payment.receiptNumber}`);
    } else {
      toast.error('No receipt available for this payment');
    }
  };

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
        <h2 className="text-xl font-semibold text-gray-800">Payment History (ETB)</h2>
        <p className="text-sm text-gray-500">View all your past transactions and receipts</p>
      </div>

      {/* Total Paid Card */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <Banknote className="w-8 h-8 text-green-500" />
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No payment history found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Your payment transactions will appear here once you make a payment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (ETB)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">
                      {payment.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.feeDescription || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getPaymentMethodDisplay(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDownloadReceipt(payment)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title={payment.receiptNumber ? 'Download Receipt' : 'No receipt available'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;