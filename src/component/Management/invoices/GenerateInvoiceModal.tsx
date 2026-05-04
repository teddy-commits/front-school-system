import React, { useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

interface GenerateInvoiceModalProps {
  students: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ students, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    semester: 'FALL',
    academicYear: new Date().getFullYear()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await financeApi.generateInvoice(
      parseInt(formData.studentId),
      formData.semester,
      formData.academicYear
    );
    
    if (result.success) {
      toast.success('Invoice generated successfully!');
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.studentId}) - {student.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="FALL">Fall Semester</option>
                <option value="SPRING">Spring Semester</option>
                <option value="SUMMER">Summer Semester</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <select
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}-{year + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium">Note:</p>
            <p className="text-xs mt-1">Invoice will include all fees for the selected student for the specified semester.</p>
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;