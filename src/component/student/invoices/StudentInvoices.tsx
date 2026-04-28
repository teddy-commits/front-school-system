import React, { useState, useEffect } from 'react';
import { Receipt, Download, Eye } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  semester: string;
  academicYear: number;
  issueDate: string;
  dueDate: string;
  status: string;
}

const StudentInvoices: React.FC = () => {
  const { userId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchInvoices();
    }
  }, [userId]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const result = await financeApi.getStudentInvoices(userId!);
      if (result.success) {
        setInvoices(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
        <p className="text-sm text-gray-500">View and download your semester invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Invoice #</p>
                    <p className="font-mono font-semibold text-gray-800">{invoice.invoiceNumber}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Semester:</span>
                  <span className="text-sm font-medium">{invoice.semester} {invoice.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Issue Date:</span>
                  <span className="text-sm">{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="text-sm text-red-600">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total Amount:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Paid:</span>
                  <span className="text-sm text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Due:</span>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(invoice.dueAmount)}</span>
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button className="flex items-center px-3 py-1.5 text-sm text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="flex items-center px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInvoices;