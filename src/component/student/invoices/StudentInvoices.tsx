import React, { useState, useEffect } from 'react';
import { Receipt, Download, Eye, Banknote } from 'lucide-react';
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
        setInvoices(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error(result.message || 'Failed to load invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Format as Ethiopian Birr (ETB)
  const formatCurrency = (amount: number) => {
    return `ETB ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
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
      case 'PAID':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'PARTIAL':
        return '⚠️';
      case 'OVERDUE':
        return '❌';
      default:
        return '📄';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Open invoice details or navigate to invoice page
    console.log('Viewing invoice:', invoice.invoiceNumber);
    toast.success(`Viewing invoice ${invoice.invoiceNumber}`);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // Download invoice as PDF
    console.log('Downloading invoice:', invoice.invoiceNumber);
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
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
        <h2 className="text-xl font-semibold text-gray-800">Invoices (ETB)</h2>
        <p className="text-sm text-gray-500">View and download your semester invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices available.</p>
          <p className="text-sm text-gray-400 mt-2">
            Your semester invoices will appear here once generated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition border border-gray-100"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice #</p>
                    <p className="font-mono font-semibold text-gray-800 mt-1">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                    {getStatusIcon(invoice.status)} {invoice.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Semester</span>
                  <span className="text-sm font-medium text-gray-800">
                    {invoice.semester} {invoice.academicYear}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Issue Date</span>
                  <span className="text-sm text-gray-700">{formatDate(invoice.issueDate)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className={`text-sm font-medium ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>

                {/* Amounts */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                    <span className="font-bold text-gray-800">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Paid
                    </span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span> Due
                    </span>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(invoice.dueAmount)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button 
                    onClick={() => handleViewInvoice(invoice)}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(invoice)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
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