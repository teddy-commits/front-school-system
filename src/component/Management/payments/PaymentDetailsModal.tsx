import React from 'react';
import { X, Download, Printer, Calendar, DollarSign, User, CreditCard, Building2, Smartphone, CheckCircle } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

interface PaymentDetailsModalProps {
  payment: any;
  onClose: () => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ payment, onClose }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleDownloadReceipt = async () => {
    const result = await financeApi.downloadReceipt(payment.id);
    if (result.success) {
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${payment.transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } else {
      toast.error(result.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'CREDIT_CARD':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'MOBILE_MONEY':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Payment Details</h2>
            <p className="text-sm text-gray-500 font-mono">{payment.transactionId}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={handleDownloadReceipt} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Download Receipt">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6" id="receipt-print">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-800">Admas University</h3>
            <p className="text-gray-500">Payment Receipt</p>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold">Payment Successful</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Transaction ID:</span>
              <span className="text-sm font-mono font-medium">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Receipt Number:</span>
              <span className="text-sm font-mono font-medium">{payment.receiptNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Date:</span>
              <span className="text-sm font-medium">{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Method:</span>
              <div className="flex items-center space-x-2">
                {getPaymentMethodIcon(payment.paymentMethod)}
                <span className="text-sm font-medium">{payment.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Student Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{payment.studentName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Student ID: {payment.studentIdNumber}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</span>
              </div>
              {payment.feeDescription && (
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="text-sm text-gray-500">Description:</span>
                  <span className="text-sm text-gray-600">{payment.feeDescription}</span>
                </div>
              )}
              {payment.referenceNumber && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Reference Number:</span>
                  <span className="text-sm font-mono">{payment.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {payment.remarks && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 font-medium">Remarks:</p>
              <p className="text-sm text-gray-600">{payment.remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>Thank you for your payment</p>
            <p className="mt-1">For any queries, please contact the finance office</p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;