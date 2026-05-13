import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, DollarSign, BookOpen, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gradeApi } from '../../../api/modules/gradeApi';
import { financeApi } from '../../../api/modules/financeApi';
import { useAuth } from '../../../context/AuthContext';

// Define proper types
interface Grade {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  score: number;
  gradeLetter: string;
  gradePoint: number;
  semester: string;
  academicYear: number;
}

interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  paymentDate: string;
  feeDescription: string;
}

interface StudentOverviewProps {
  cgpa: number;
  totalOutstanding: number;
  enrolledCourses: number;
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

const StudentOverview: React.FC<StudentOverviewProps> = ({ 
  cgpa, 
  totalOutstanding, 
  enrolledCourses 
}) => {
  const { userId } = useAuth();
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetchRecentData();
    }
  }, [userId]);

  const fetchRecentData = async () => {
    try {
      const gradesResult = await gradeApi.getStudentGrades(userId!) as ApiResponse<Grade[]>;
      if (gradesResult.success && 'data' in gradesResult && Array.isArray(gradesResult.data)) {
        setRecentGrades(gradesResult.data.slice(0, 3));
      }

      const paymentsResult = await financeApi.getStudentPayments(userId!) as ApiResponse<Payment[]>;
      if (paymentsResult.success && 'data' in paymentsResult && Array.isArray(paymentsResult.data)) {
        setRecentPayments(paymentsResult.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const stats = [
    { title: 'Current CGPA', value: cgpa.toFixed(2), icon: TrendingUp, color: 'bg-emerald-500', max: '4.0' },
    { title: 'Courses Enrolled', value: enrolledCourses, icon: BookOpen, color: 'bg-blue-500', max: '' },
    { title: 'Outstanding Fees', value: `ETB ${totalOutstanding.toLocaleString()}`, icon: DollarSign, color: 'bg-red-500', max: '' },
    { title: 'Total Credits', value: '24', icon: Award, color: 'bg-purple-500', max: '120' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back! 👋</h2>
        <p className="text-emerald-100">Track your academic progress, view grades, and manage your fees all in one place.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                {stat.max && <p className="text-xs text-gray-400">Max: {stat.max}</p>}
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Grades & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-800">Recent Grades</h3>
            <Link to="/student-dashboard/grades" className="text-sm text-emerald-600 hover:text-emerald-700">
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{grade.courseCode}</p>
                    <p className="text-sm text-gray-500">{grade.courseName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      grade.gradeLetter === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {grade.gradeLetter}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Score: {grade.score}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No grades available yet</div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-800">Recent Payments</h3>
            <Link to="/student-dashboard/payments" className="text-sm text-emerald-600 hover:text-emerald-700">
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{payment.transactionId}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                    <span className="text-xs text-green-600">{payment.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No payments recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/student-dashboard/courses" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">View Courses</p>
              <p className="text-xs text-gray-500">See your enrolled courses</p>
            </div>
          </Link>
          <Link to="/student-dashboard/grades" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
            <Award className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">Check Grades</p>
              <p className="text-xs text-gray-500">View your academic performance</p>
            </div>
          </Link>
          <Link to="/student-dashboard/fees" className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition">
            <DollarSign className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">Pay Fees</p>
              <p className="text-xs text-gray-500">Clear outstanding balances</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;