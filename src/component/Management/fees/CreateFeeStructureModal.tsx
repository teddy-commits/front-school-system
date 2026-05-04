import React, { useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

const CreateFeeStructureModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    feeType: 'TUITION', category: 'SEMESTER', description: '', amount: 0, department: '', faculty: '',
    isMandatory: true, academicYear: new Date().getFullYear(), semester: 'FALL', dueDate: '', gracePeriodDays: 15, lateFeePercentage: 5.0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const submitData = { ...formData, amount: Number(formData.amount), dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null };
    const result = await financeApi.createFeeStructure(submitData);
    if (result.success) { toast.success('Fee structure created'); onSuccess(); onClose(); }
    else toast.error(result.message);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b"><h2 className="text-xl font-semibold">Create Fee Structure</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label>Fee Type</label><select name="feeType" value={formData.feeType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"><option value="TUITION">Tuition Fee</option><option value="REGISTRATION">Registration Fee</option><option value="LIBRARY">Library Fee</option><option value="LABORATORY">Laboratory Fee</option><option value="SPORTS">Sports Fee</option><option value="EXAMINATION">Examination Fee</option></select></div>
          <div><label>Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"><option value="SEMESTER">Semester</option><option value="ANNUAL">Annual</option><option value="ONE_TIME">One Time</option></select></div></div>
          <div><label>Description</label><input type="text" name="description" required value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label>Amount</label><input type="number" name="amount" required value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label>Due Date</label><input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label>Academic Year</label><input type="number" name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label>Semester</label><select name="semester" value={formData.semester} onChange={handleChange}><option value="FALL">Fall</option><option value="SPRING">Spring</option><option value="SUMMER">Summer</option></select></div></div>
          <div className="flex items-center"><input type="checkbox" name="isMandatory" checked={formData.isMandatory} onChange={handleChange} className="mr-2" /><label>Mandatory Fee</label></div>
          <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Create</button></div>
        </form>
      </div>
    </div>
  );
};

export default CreateFeeStructureModal;