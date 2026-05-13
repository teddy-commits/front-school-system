import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileText } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

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

interface ReportData {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  transactionCount: number;
  // Add other properties as needed
}

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    let result: ApiResponse<ReportData>;
    
    if (reportType === 'daily') {
      result = await financeApi.getDailyReport(selectedDate) as ApiResponse<ReportData>;
    } else if (reportType === 'monthly') {
      result = await financeApi.getMonthlyReport(selectedYear, selectedMonth) as ApiResponse<ReportData>;
    } else {
      result = await financeApi.getSemesterReport(selectedSemester, selectedYear) as ApiResponse<ReportData>;
    }
    
    if (result.success && 'data' in result) {
      toast.success('Report generated successfully');
      setReportData(result.data);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to generate report');
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Financial Reports</h2>
        <p className="text-sm text-gray-500">Generate financial statements and reports</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {['daily', 'monthly', 'semester'].map(type => (
              <button 
                key={type} 
                onClick={() => setReportType(type)} 
                className={`px-4 py-2 rounded-lg capitalize ${reportType === type ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {reportType === 'daily' && (
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="px-3 py-2 border rounded-lg" 
            />
          )}
          
          {reportType === 'monthly' && (
            <>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="px-3 py-2 border rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m-1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                className="px-3 py-2 border rounded-lg"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </>
          )}
          
          {reportType === 'semester' && (
            <>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)} 
                className="px-3 py-2 border rounded-lg"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                className="px-3 py-2 border rounded-lg"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </>
          )}
          
          <button 
            onClick={handleGenerate} 
            disabled={isLoading} 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      
      {/* Report Preview */}
      {reportData ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Report Summary</h3>
            <button className="flex items-center px-3 py-1 text-sm text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition">
              <Download className="w-4 h-4 mr-1" />
              Download PDF
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.totalPayments)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(reportData.pendingPayments)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.transactionCount}</p>
            </div>
          </div>
          
          {/* Add more detailed report content here */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center">
              Report generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 h-96 flex items-center justify-center border-2 border-dashed">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Report preview will appear here</p>
            <p className="text-sm text-gray-400">Select report type and click Generate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;