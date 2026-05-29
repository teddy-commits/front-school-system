import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, userFullName, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/student-dashboard');

  if (isDashboard) return null;

  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="bg-white/10 p-2 rounded-full">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admas University</h1>
              <p className="text-xs text-blue-200">Excellence in Education</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {userFullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{userFullName?.split(' ')[0]}</span>
                  <span className="text-xs text-blue-200">({userRole})</span>
                </div>
                {userRole === 'STUDENT' ? (
                  <Link
                    to="/student-dashboard"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
               
                <Link
                  to="/login/staff"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Staff Login</span>
                </Link>
                
                <Link
                  to="/login/student"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Student Portal</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/20 py-1.5">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-blue-200">
            🎓 Empowering minds, transforming lives since 1995
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;