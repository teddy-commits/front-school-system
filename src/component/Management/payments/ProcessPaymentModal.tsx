import React, { useState } from 'react';
import { X, CreditCard, Building2, Smartphone } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

const ProcessPaymentModal: React.FC<{ students: any[]; onClose: () => void; onSuccess: () => void }> = ({ students, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [formData, setFormData] = useState({ studentId: '', amount: '', referenceNumber: '', bankName: '', mobileNumber: '', remarks: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await financeApi.processPayment({ ...formData, amount: parseFloat(formData.amount), paymentMethod });
    if (result.success) { toast.success('Payment processed'); onSuccess(); onClose(); }
    else toast.error(result.message);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg w-full max-w-md"><div className="flex justify-between p-6 border-b"><h2>Process Payment</h2><button onClick={onClose}><X /></button></div>
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Student</option>{students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}</select>
      <input type="number" placeholder="Amount" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
      <div className="grid grid-cols-3 gap-2">{/* Payment method buttons */}</div>
      <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white py-2 rounded-lg">Process Payment</button>
    </form></div></div>
  );
};

export default ProcessPaymentModal;