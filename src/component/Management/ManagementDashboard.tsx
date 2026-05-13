import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ManagementSidebar from './ManagementSidebar';
import ManagementOverview from './dashboard/ManagementOverview';
import FeeStructureManagement from './fees/FeeStructureManagement';
import PaymentManagement from './payments/PaymentManagement';
import InvoiceManagement from './invoices/InvoiceManagement';
import FinancialReports from './reports/FinancialReports';
import StudentFeeSummary from './students/StudentFeeSummary';
import { useAuth } from '../../context/AuthContext';
import { financeApi } from '../../api/modules/financeApi';
import { registrationApi } from '../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  amount: number;
  status: string;
  transactionId: string;
  studentName: string;
  paymentMethod: string;
  paymentDate: string;
}

interface OverdueFee {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  dueDate: string;
  feeType: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOutstanding: number;
  totalTransactions: number;
  overdueCount: number;
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

const ManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOutstanding: 0,
    totalTransactions: 0,
    overdueCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const paymentsResult = await financeApi.getAllPayments() as ApiResponse<Payment[]>;
      const overdueResult = await financeApi.getOverdueFees() as ApiResponse<OverdueFee[]>;
      
      if (paymentsResult.success && 'data' in paymentsResult && Array.isArray(paymentsResult.data)) {
        const totalPaid = paymentsResult.data.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
        setStats(prev => ({ 
          ...prev, 
          totalRevenue: totalPaid, 
          totalTransactions: paymentsResult.data.length 
        }));
      } else if (!paymentsResult.success && 'message' in paymentsResult) {
        toast.error(paymentsResult.message);
      }
      
      if (overdueResult.success && 'data' in overdueResult && Array.isArray(overdueResult.data)) {
        setStats(prev => ({ 
          ...prev, 
          overdueCount: overdueResult.data.length 
        }));
      } else if (!overdueResult.success && 'message' in overdueResult) {
        toast.error(overdueResult.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'overview': return 'Dashboard';
      case 'fee-structures': return 'Fee Structure Management';
      case 'payments': return 'Payment Management';
      case 'invoices': return 'Invoice Management';
      case 'reports': return 'Financial Reports';
      case 'student-fees': return 'Student Fee Summary';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ManagementSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Management</p>
              </div>
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.fullName?.charAt(0) || 'M'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="overview" element={<ManagementOverview stats={stats} isLoading={isLoading} />} />
            <Route path="fee-structures" element={<FeeStructureManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="student-fees" element={<StudentFeeSummary />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ManagementDashboard;