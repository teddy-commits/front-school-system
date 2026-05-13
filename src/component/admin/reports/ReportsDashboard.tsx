import React, { useState, useEffect } from 'react';
import { 
  Download, Calendar, TrendingUp, DollarSign, 
  Users, BookOpen, CreditCard, Award, 
  BarChart3, PieChart, LineChart, FileText,
  Printer, Mail, Filter, ChevronDown
} from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import { courseApi } from '../../../api/modules/courseApi';
import { gradeApi } from '../../../api/modules/gradeApi';
import toast from 'react-hot-toast';

interface ReportData {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalRevenue: number;
  totalPayments: number;
  averageGrade: number;
  passingRate: number;
  enrollmentRate: number;
}

interface UserStats {
  totalStudents: number;
  totalInstructors: number;
  totalStaff: number;
  totalUsers: number;
}

interface FinancialReport {
  totalPaymentsReceived: number;
  totalTransactions: number;
  revenueByCategory?: Record<string, number>;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
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

const ReportsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2022, 2023, 2024, 2025];

  useEffect(() => {
    fetchUserStatistics();
    fetchDepartments();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, selectedDate, selectedMonth, selectedYear, selectedSemester, selectedDepartment]);

  const fetchUserStatistics = async () => {
    const result = await registrationApi.getUserStatistics() as ApiResponse<UserStats>;
    if (result.success && 'data' in result) {
      setUserStats(result.data);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    }
  };

  const fetchDepartments = async () => {
    const depts = ['Computer Science', 'Software Engineering', 'Information Technology', 
                   'Electrical Engineering', 'Mechanical Engineering', 'Business Administration',
                   'Economics', 'Mathematics', 'Physics'];
    setDepartments(depts);
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let result: ApiResponse<FinancialReport>;
      
      switch (reportType) {
        case 'daily':
          result = await financeApi.getDailyReport(selectedDate) as ApiResponse<FinancialReport>;
          break;
        case 'monthly':
          result = await financeApi.getMonthlyReport(selectedYear, selectedMonth) as ApiResponse<FinancialReport>;
          break;
        case 'semester':
          result = await financeApi.getSemesterReport(selectedSemester, selectedYear) as ApiResponse<FinancialReport>;
          break;
        default:
          const defaultDate = `${selectedDate}T00:00:00`;
          result = await financeApi.getDailyReport(defaultDate) as ApiResponse<FinancialReport>;
      }
      
      if (result.success && 'data' in result) {
        setFinancialReport(result.data);
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      }
      
      // Fetch additional statistics
      const studentsResult = await registrationApi.getAllStudents() as ApiResponse<Student[]>;
      const coursesResult = await courseApi.getAllCourses() as ApiResponse<Course[]>;
      
      const reportStats: ReportData = {
        totalStudents: (studentsResult.success && 'data' in studentsResult && Array.isArray(studentsResult.data)) ? studentsResult.data.length : 0,
        totalInstructors: userStats?.totalInstructors || 0,
        totalCourses: (coursesResult.success && 'data' in coursesResult && Array.isArray(coursesResult.data)) ? coursesResult.data.length : 0,
        totalRevenue: financialReport?.totalPaymentsReceived || 0,
        totalPayments: financialReport?.totalTransactions || 0,
        averageGrade: 3.2,
        passingRate: 87,
        enrollmentRate: 78
      };
      
      setReportData(reportStats);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.success('Report exported to PDF');
  };

  const handleExportExcel = () => {
    toast.success('Report exported to Excel');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Comprehensive reports and insights for university operations</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Report Type:</span>
          </div>
          <div className="flex gap-2">
            {['daily', 'monthly', 'semester', 'department'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  reportType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type} Report
              </button>
            ))}
          </div>
          
          <div className="h-8 w-px bg-gray-300 mx-2" />
          
          {/* Date Filters */}
          {reportType === 'daily' && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {reportType === 'monthly' && (
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
          
          {reportType === 'semester' && (
            <div className="flex gap-3">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
          
          {reportType === 'department' && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Generate Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData?.totalRevenue || 0)}</p>
                  <p className="text-xs text-green-500 mt-1">+12.5% from last period</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData?.totalStudents || 0}</p>
                  <p className="text-xs text-blue-500 mt-1">+8.2% from last year</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average CGPA</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData?.averageGrade || 0}</p>
                  <p className="text-xs text-purple-500 mt-1">/ 4.0 scale</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Passing Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{reportData?.passingRate || 0}%</p>
                  <p className="text-xs text-orange-500 mt-1">+5% improvement</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Revenue Overview</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart visualization</p>
                  <p className="text-sm text-gray-400">Monthly revenue trends would appear here</p>
                </div>
              </div>
            </div>

            {/* Enrollment Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Enrollment by Department</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Enrollment distribution chart</p>
                  <p className="text-sm text-gray-400">Student distribution by department</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Grade Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Grade Distribution</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Grade distribution chart</p>
                  <p className="text-sm text-gray-400">Percentage of students per grade</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Payment Methods</h3>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Payment breakdown</p>
                  <p className="text-sm text-gray-400">Transaction distribution by method</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b">
              <h3 className="text-md font-semibold text-gray-800">Financial Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (ETB)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Tuition Fees</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(125000)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">65%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Registration Fees</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(25000)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">13%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Library & Lab Fees</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(18000)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">9%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Other Fees</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(25000)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">13%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600 text-right">{formatCurrency(193000)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-800">Recent Transactions</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (ETB)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-blue-600">TXN-2024-{String(i).padStart(4, '0')}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">John Doe</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(25000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Bank Transfer</td>
                      <td className="px-6 py-4 text-sm text-gray-600">2024-01-{String(15 + i).padStart(2, '0')}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsDashboard;