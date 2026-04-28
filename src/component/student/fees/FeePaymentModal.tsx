import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface FeePaymentModalProps {
  fee: any;
  onClose: () => void;
  onSuccess: () => void;
}

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
    setIsLoading(true);

    const paymentData = {
      studentId: userId,
      feeId: fee.id,
      amount: formData.amount,
      paymentMethod: paymentMethod,
      referenceNumber: formData.referenceNumber,
      bankName: formData.bankName,
      mobileNumber: formData.mobileNumber,
      remarks: formData.remarks
    };

    const result = await financeApi.processPayment(paymentData);
    if (result.success) {
      toast.success('Payment processed successfully!');
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Make Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Payment for</p>
            <p className="font-semibold">{fee.description}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Due Amount:</span>
              <span className="font-bold text-red-600">{formatCurrency(fee.dueAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-lg border-2 text-center transition ${
                  paymentMethod === 'CREDIT_CARD' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <CreditCard className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'CREDIT_CARD' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-3 rounded-lg border-2 text-center transition ${
                  paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <Building2 className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'BANK_TRANSFER' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs">Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
                className={`p-3 rounded-lg border-2 text-center transition ${
                  paymentMethod === 'MOBILE_MONEY' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <Smartphone className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'MOBILE_MONEY' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs">Mobile</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
              max={fee.dueAmount}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {(paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CREDIT_CARD') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter transaction reference"
                required
              />
            </div>
          )}

          {paymentMethod === 'BANK_TRANSFER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter bank name"
              />
            </div>
          )}

          {paymentMethod === 'MOBILE_MONEY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter mobile number"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Any additional notes"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeePaymentModal;