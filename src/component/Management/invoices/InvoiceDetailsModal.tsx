import React from 'react';
import { X, Download, Printer, Calendar, DollarSign, User, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

interface FeeItem {
  description: string;
  amount: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  semester: string;
  academicYear: number;
  issueDate: string;
  dueDate: string;
  status: string;
  department?: string;
  fees?: FeeItem[];
}

interface InvoiceDetailsModalProps {
  invoice: Invoice;
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

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, onClose }) => {
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

  const handleDownload = async () => {
    try {
      // Check if the downloadInvoice method exists
      if (typeof financeApi.downloadInvoice !== 'function') {
        return;
      }
      
      const result = await financeApi.downloadInvoice(invoice.id) as ApiResponse<Blob>;
      if (result.success && 'data' in result) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${invoice.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Invoice downloaded successfully');
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Invoice Details</h2>
            <p className="text-sm text-gray-500 font-mono">{invoice.invoiceNumber}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" title="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" title="Download PDF">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6" id="invoice-print">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-800">Admas University</h3>
            <p className="text-gray-500">Bole Road, Addis Ababa, Ethiopia</p>
            <p className="text-gray-500">Tel: +251-111-234567 | Email: info@admas.edu.et</p>
            <h4 className="text-lg font-semibold mt-3">INVOICE</h4>
          </div>

          {/* Invoice Info */}
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-mono font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Bill To:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium">{invoice.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{invoice.studentIdNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{invoice.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Semester</p>
                <p className="font-medium">{invoice.semester} {invoice.academicYear}</p>
              </div>
            </div>
          </div>

          {/* Fee Items Table */}
          <div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.fees && invoice.fees.length > 0 ? (
                  invoice.fees.map((fee, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{fee.description}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(fee.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm text-center text-gray-500">
                      No fee items available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-600">Paid Amount</td>
                  <td className="px-4 py-2 text-sm text-right text-green-600">{formatCurrency(invoice.paidAmount)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-600">Due Amount</td>
                  <td className="px-4 py-2 text-sm text-right text-red-600">{formatCurrency(invoice.dueAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Status */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span className={`inline-flex mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium text-red-600">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>Thank you for choosing Admas University</p>
            <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
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

export default InvoiceDetailsModal;