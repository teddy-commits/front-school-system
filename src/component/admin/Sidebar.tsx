import React, { useEffect } from 'react';
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
  Calendar,
  Building2,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const target = event.target as HTMLElement;
      
      if (isOpen && sidebar && !sidebar.contains(target) && !target.closest('.mobile-menu-button')) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onToggle]);

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
    { path: '/dashboard/departments', icon: Building2, label: 'Departments', color: 'text-teal-500' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      <aside 
        id="sidebar"
        className={`
          fixed md:relative z-30
          w-64 md:w-64 
          bg-white shadow-lg flex flex-col
          transition-transform duration-300 ease-in-out
          h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="md:hidden absolute right-4 top-4">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 md:p-6 border-b">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <span className="text-lg md:text-xl font-bold text-gray-800">Admas Admin</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 hidden sm:block">University Management System</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onToggle();
                }
              }}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 md:px-4 md:py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0 ${item.color}`} />
              <span className="text-xs md:text-sm font-medium truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 md:px-4 md:py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium">Logout</span>
          </button>
          
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t text-center">
            <p className="text-xs text-gray-400">Admas University</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;