import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  faculty: string;
  enrollmentYear: number;
  isActive: boolean;
}

interface Fee {
  id: number;
  feeType: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  dueDate: string;
  feeStructureId?: number;
  semester?: string;
  academicYear?: number;
}

interface FeeSummary {
  totalFees: number;
  totalPaid: number;
  totalOutstanding: number;
}

interface StudentFeesViewProps {
  studentId: number;
  onClose: () => void;
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

const StudentFeesView: React.FC<StudentFeesViewProps> = ({ studentId, onClose }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
    fetchFees();
    fetchSummary();
  }, [studentId]);

  const fetchStudentData = async () => {
    const result = await registrationApi.getStudentById(studentId) as ApiResponse<Student>;
    if (result.success && 'data' in result) {
      setStudent(result.data);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    }
  };

  const fetchFees = async () => {
    const result = await financeApi.getStudentFees(studentId) as ApiResponse<Fee[]>;
    if (result.success && 'data' in result) {
      setFees(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    }
  };

  const fetchSummary = async () => {
    const result = await financeApi.getStudentFeeSummary(studentId) as ApiResponse<FeeSummary>;
    if (result.success && 'data' in result) {
      setSummary(result.data);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Student Fee Details</h2>
            <p className="text-sm text-gray-500">{student?.fullName} - {student?.studentId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Fees</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalFees)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutstanding)}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          )}

          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Student ID</p>
                <p className="text-sm font-medium">{student?.studentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{student?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium">{student?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Faculty</p>
                <p className="text-sm font-medium">{student?.faculty || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Fees Table */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Fee Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (ETB)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid (ETB)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due (ETB)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fees.length > 0 ? (
                    fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{fee.feeType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{fee.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(fee.amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(fee.paidAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">{formatCurrency(fee.dueAmount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(fee.dueDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {getStatusIcon(fee.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(fee.status)}`}>
                              {fee.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No fees found for this student
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFeesView;