import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, User, IdCard } from 'lucide-react';

const StaffLogin: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'id'>('email');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(loginIdentifier, password, 'staff');
    
    if (success) {
      const userRole = localStorage.getItem('userRole');
      
      const instructorRoles = ['INSTRUCTOR', 'PROFESSOR', 'SENIOR_INSTRUCTOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR'];
      const academicAdminRoles = ['ACADEMIC_ADMINISTRATOR', 'HOD', 'DEAN', 'REGISTRAR'];
      const managementRoles = ['MANAGEMENT', 'FINANCE_MANAGER', 'HR_MANAGER'];
      
      if (instructorRoles.includes(userRole || '')) {
        navigate('/instructor-dashboard/overview');
      } else if (academicAdminRoles.includes(userRole || '')) {
        navigate('/academic-admin-dashboard/overview');
      } else if (managementRoles.includes(userRole || '')) {
        navigate('/management-dashboard/overview');
      } else {
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">University Management System</h1>
          <p className="text-blue-200">Staff & Administrator Portal</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b">
              <Link
                to="/login/staff"
                className="flex-1 text-center py-4 px-6 font-medium bg-blue-600 text-white"
              >
                Staff Login
              </Link>
              <Link
                to="/login/student"
                className="flex-1 text-center py-4 px-6 font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                Student Login
              </Link>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in to access your staff dashboard
                </p>
              </div>

              <div className="mb-4 bg-gray-100 rounded-lg p-1 flex">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('id')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'id'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <IdCard className="w-4 h-4 inline mr-2" />
                  Staff ID
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginMethod === 'email' ? 'Email Address' : 'Staff ID'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginMethod === 'email' ? (
                        <Mail className="h-5 w-5 text-gray-400" />
                      ) : (
                        <IdCard className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      type={loginMethod === 'email' ? 'email' : 'text'}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={loginMethod === 'email' ? 'admin@university.com' : 'STF-2024-001'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-center text-gray-500">
                  Default Staff Accounts:
                </p>
                <p className="text-xs text-center text-gray-400 mt-1">
                  Email: admin@university.com | ID: STF-2024-001 | Password: admin123
                </p>
                <p className="text-xs text-center text-gray-400">
                  Email: john.smith@university.com | ID: STF-2024-002 | Password: John@123456
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;