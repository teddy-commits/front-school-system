import React, { useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

const EditFeeStructureModal: React.FC<{ fee: any; onClose: () => void; onSuccess: () => void }> = ({ fee, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: fee.description, amount: fee.amount, isMandatory: fee.isMandatory,
    dueDate: fee.dueDate?.split('T')[0] || '', gracePeriodDays: fee.gracePeriodDays, lateFeePercentage: fee.lateFeePercentage, isActive: fee.isActive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const submitData = { ...formData, amount: Number(formData.amount), dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null };
    const result = await financeApi.updateFeeStructure(fee.id, submitData);
    if (result.success) { toast.success('Fee structure updated'); onSuccess(); onClose(); }
    else toast.error(result.message);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md"><div className="flex justify-between p-6 border-b"><h2>Edit Fee Structure</h2><button onClick={onClose}><X /></button></div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label>Description</label><input type="text" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label>Amount</label><input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label>Due Date</label><input type="date" name="dueDate" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div className="flex items-center"><input type="checkbox" checked={formData.isMandatory} onChange={(e) => setFormData({...formData, isMandatory: e.target.checked})} className="mr-2" /><label>Mandatory Fee</label></div>
        <div className="flex items-center"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="mr-2" /><label>Active</label></div>
        <div className="flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Save</button></div>
      </form></div>
    </div>
  );
};

export default EditFeeStructureModal;