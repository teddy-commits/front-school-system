import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  fullName: string;
  studentId: string;
  email?: string;
}

interface ProcessPaymentModalProps {
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentData {
  studentId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  bankName: string;
  mobileNumber: string;
  remarks: string;
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

const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({ students, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    referenceNumber: '',
    bankName: '',
    mobileNumber: '',
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    setIsLoading(true);
    
    const paymentData: PaymentData = {
      studentId: parseInt(formData.studentId),
      amount: amountValue,
      paymentMethod: paymentMethod,
      referenceNumber: formData.referenceNumber,
      bankName: formData.bankName,
      mobileNumber: formData.mobileNumber,
      remarks: formData.remarks
    };
    
    const result = await financeApi.processPayment(paymentData) as ApiResponse;
    
    if (result.success) {
      toast.success('Payment processed successfully');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Payment failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const getPaymentMethodIcon = (method: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`;
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard className={iconClass} />;
      case 'BANK_TRANSFER': return <Building2 className={iconClass} />;
      case 'MOBILE_MONEY': return <Smartphone className={iconClass} />;
      default: return <CreditCard className={iconClass} />;
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(num);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Process Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.amount)}</p>
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.studentId || !formData.amount || parseFloat(formData.amount) <= 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessPaymentModal;