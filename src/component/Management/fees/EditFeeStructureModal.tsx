import React, { useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

interface FeeStructure {
  id: number;
  feeType: string;
  category: string;
  description: string;
  amount: number;
  department: string;
  faculty: string;
  isMandatory: boolean;
  academicYear: number;
  semester: string;
  dueDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  isActive: boolean;
}

interface EditFeeStructureModalProps {
  fee: FeeStructure;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  description: string;
  amount: number;
  isMandatory: boolean;
  dueDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  isActive: boolean;
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

const EditFeeStructureModal: React.FC<EditFeeStructureModalProps> = ({ fee, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    description: fee.description,
    amount: fee.amount,
    isMandatory: fee.isMandatory,
    dueDate: fee.dueDate?.split('T')[0] || '',
    gracePeriodDays: fee.gracePeriodDays,
    lateFeePercentage: fee.lateFeePercentage,
    isActive: fee.isActive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const submitData = {
      ...formData,
      amount: Number(formData.amount),
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : undefined  // Changed null to undefined
    };
    
    const result = await financeApi.updateFeeStructure(fee.id, submitData) as ApiResponse;
    
    if (result.success) {
      toast.success('Fee structure updated successfully');
      onSuccess();
      onClose();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update fee structure');
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                     type === 'number' ? parseFloat(value) : value;
    setFormData({ ...formData, [name]: newValue });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Edit Fee Structure</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isMandatory"
              checked={formData.isMandatory}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Mandatory Fee</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Days)</label>
              <input
                type="number"
                name="gracePeriodDays"
                value={formData.gracePeriodDays}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee (%)</label>
              <input
                type="number"
                name="lateFeePercentage"
                value={formData.lateFeePercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          
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
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFeeStructureModal;