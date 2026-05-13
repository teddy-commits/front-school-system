import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserManagement from './users/UserManagement';
import CourseManagement from './courses/CourseManagement';
import GradeManagement from './grades/GradeManagement';
import FeeManagement from './finance/FeeManagement';
import PaymentManagement from './finance/PaymentManagement';
import InvoiceManagement from './finance/InvoiceManagement';
import ReportsDashboard from './reports/ReportsDashboard';
import { useAuth } from '../../context/AuthContext';
import { registrationApi } from '../../api/modules/registrationApi';
import RegistrationSessionManagement from '../Academic Admin/sessions/RegistrationSessionManagement';
import DepartmentManagement from './departments/DepartmentManagement';

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalRevenue: number;
}

interface UserStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses?: number;
  totalRevenue?: number;
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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { userFullName } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user statistics from the API
      const statsResult = await registrationApi.getUserStatistics() as ApiResponse<UserStats>;
      
      if (statsResult.success && 'data' in statsResult && statsResult.data) {
        setStats({
          totalStudents: statsResult.data.totalStudents || 0,
          totalInstructors: statsResult.data.totalInstructors || 0,
          totalCourses: statsResult.data.totalCourses || 45,
          totalRevenue: statsResult.data.totalRevenue || 124567
        });
      } else {
        // Fallback to individual API calls if statistics endpoint is not available
        const studentsResult = await registrationApi.getAllStudents() as ApiResponse<any[]>;
        const instructorsResult = await registrationApi.getAllInstructors() as ApiResponse<any[]>;
        
        setStats({
          totalStudents: (studentsResult.success && 'data' in studentsResult && Array.isArray(studentsResult.data)) ? studentsResult.data.length : 0,
          totalInstructors: (instructorsResult.success && 'data' in instructorsResult && Array.isArray(instructorsResult.data)) ? instructorsResult.data.length : 0,
          totalCourses: 45,
          totalRevenue: 124567
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        totalRevenue: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'users': return 'User Management';
      case 'courses': return 'Course Management';
      case 'grades': return 'Grade Management';
      case 'fees': return 'Fee Management';
      case 'payments': return 'Payment Management';
      case 'invoices': return 'Invoice Management';
      case 'reports': return 'Reports & Analytics';
      case 'sessions': return 'Registration Sessions';
      case 'departments': return 'Department Management';
      default: return 'Dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userFullName}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userFullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {location.pathname === '/dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Students</p>
                      <p className="text-2xl font-semibold text-gray-700">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Courses</p>
                      <p className="text-2xl font-semibold text-gray-700">{stats.totalCourses}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Instructors</p>
                      <p className="text-2xl font-semibold text-gray-700">{stats.totalInstructors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-700">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      + Add New Student
                    </button>
                    <button className="w-full text-left px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                      + Create Course
                    </button>
                    <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition">
                      + Add Instructor
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">• New student registered</div>
                    <div className="text-sm text-gray-600">• Course CS101 created</div>
                    <div className="text-sm text-gray-600">• Payment received from John Doe</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">API Status:</span>
                      <span className="text-sm text-green-600">● Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Database:</span>
                      <span className="text-sm text-green-600">● Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Backup:</span>
                      <span className="text-sm text-gray-600">Today 02:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Routes>
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="sessions" element={<RegistrationSessionManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;