import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Receipt,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
    { path: '/dashboard/users', icon: Users, label: 'User Management', color: 'text-green-500' },
    { path: '/dashboard/courses', icon: BookOpen, label: 'Course Management', color: 'text-purple-500' },
    { path: '/dashboard/grades', icon: GraduationCap, label: 'Grade Management', color: 'text-yellow-500' },
    { path: '/dashboard/sessions', icon: Calendar, label: 'Registration Periods', color: 'text-teal-500' },
    { path: '/dashboard/fees', icon: DollarSign, label: 'Fee Structure', color: 'text-red-500' },
    { path: '/dashboard/payments', icon: CreditCard, label: 'Payment Management', color: 'text-indigo-500' },
    { path: '/dashboard/invoices', icon: Receipt, label: 'Invoice Management', color: 'text-orange-500' },
    { path: '/dashboard/reports', icon: BarChart3, label: 'Reports', color: 'text-pink-500' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">Admas Admin</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">University Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </button>
        
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-400">Admas University</p>
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;