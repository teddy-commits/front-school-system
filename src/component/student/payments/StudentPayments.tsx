import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Receipt } from 'lucide-react';
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
        setPayments(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    return status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
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
        <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
        <p className="text-sm text-gray-500">View all your past transactions and receipts</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No payment history found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.feeDescription}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-emerald-600 hover:text-emerald-700" title="Download Receipt">
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