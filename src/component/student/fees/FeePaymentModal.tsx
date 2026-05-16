import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone, Banknote } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

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

interface FeePaymentModalProps {
  fee: Fee;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentData {
  studentId: number;
  feeId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  bankName: string;
  mobileNumber: string;
  remarks: string;
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

const FeePaymentModal: React.FC<FeePaymentModalProps> = ({ fee, onClose, onSuccess }) => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [formData, setFormData] = useState({
    amount: fee.dueAmount,
    referenceNumber: '',
    bankName: '',
    mobileNumber: '',
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (formData.amount > fee.dueAmount) {
      toast.error('Amount cannot exceed the due amount');
      return;
    }
    
    setIsLoading(true);

    const paymentData: PaymentData = {
      studentId: userId, 
      feeId: fee.id,
      amount: formData.amount,
      paymentMethod: paymentMethod,
      referenceNumber: formData.referenceNumber,
      bankName: formData.bankName,
      mobileNumber: formData.mobileNumber,
      remarks: formData.remarks
    };

    const result = await financeApi.processPayment(paymentData) as ApiResponse;
    if (result.success) {
      toast.success('Payment processed successfully!');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message || 'Payment failed');
    } else {
      toast.error('Payment failed. Please try again.');
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getPaymentMethodIcon = (method: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`;
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard className={iconClass} />;
      case 'BANK_TRANSFER': return <Building2 className={iconClass} />;
      case 'MOBILE_MONEY': return <Smartphone className={iconClass} />;
      case 'CASH': return <Banknote className={iconClass} />;
      default: return <CreditCard className={iconClass} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Make Payment (ETB)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fee Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm text-gray-500">Payment for</p>
              <p className="font-semibold text-gray-900">{fee.description}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Due Amount:</span>
              <span className="font-bold text-red-600 text-lg">{formatCurrency(fee.dueAmount)}</span>
            </div>
            {fee.paidAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Already Paid:</span>
                <span className="text-green-600">{formatCurrency(fee.paidAmount)}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['CREDIT_CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    paymentMethod === method 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getPaymentMethodIcon(method, paymentMethod === method)}
                  <span className="text-xs font-medium">
                    {method === 'CREDIT_CARD' ? 'Card' : 
                     method === 'BANK_TRANSFER' ? 'Bank' : 'Mobile'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay (ETB)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">ETB</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                max={fee.dueAmount}
                min="0"
                step="0.01"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(fee.dueAmount)}
            </p>
          </div>

          {/* Reference Number */}
          {(paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CREDIT_CARD') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter transaction reference"
                required
              />
            </div>
          )}

          {/* Bank Name */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Commercial Bank of Ethiopia"
              />
            </div>
          )}

          {/* Mobile Number */}
          {paymentMethod === 'MOBILE_MONEY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., +251 9XX XXX XXX"
                required
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || formData.amount <= 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : `Pay ${formatCurrency(formData.amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeePaymentModal;