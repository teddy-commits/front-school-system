import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, IdCard, Lock, Eye, EyeOff, User } from 'lucide-react';

const StudentLogin: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Students login with Student ID
    const success = await login(studentId, password, 'student');
    
    if (success) {
      navigate('/student-dashboard');
    }
    
    setIsLoading(false);
  };

  // Helper to format student ID input
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    // Auto-format: STU20240001
    if (value.length > 3 && !value.startsWith('STU')) {
      value = 'STU' + value;
    }
    setStudentId(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
          <p className="text-emerald-200">Access your academic information</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <Link
                to="/login/staff"
                className="flex-1 text-center py-4 px-6 font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                Staff Login
              </Link>
              <Link
                to="/login/student"
                className="flex-1 text-center py-4 px-6 font-medium bg-emerald-600 text-white"
              >
                Student Login
              </Link>
            </div>

            {/* Login Form */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Student</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in with your Student ID
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={studentId}
                      onChange={handleStudentIdChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                      placeholder="STU20240001"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: STU20240001 (found on your ID card)
                  </p>
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
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In to Student Portal'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-center text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Register Now
                  </Link>
                </p>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Default Student Account: STU20260001 / John@123456
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-full mb-2">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">View Grades</h3>
            <p className="text-emerald-200 text-sm">Access your academic performance</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-full mb-2">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">Course Enrollment</h3>
            <p className="text-emerald-200 text-sm">Register for courses online</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-full mb-2">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">Secure Access</h3>
            <p className="text-emerald-200 text-sm">24/7 secure portal access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;