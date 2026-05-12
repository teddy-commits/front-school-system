import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  BarChart3, 
  LogOut,
  UserCheck,
  Layers,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AcademicAdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/academic-admin-dashboard/overview', icon: LayoutDashboard, label: 'Overview', color: 'text-indigo-500' },
    { path: '/academic-admin-dashboard/courses', icon: BookOpen, label: 'Course Management', color: 'text-blue-500' },
     { path: '/academic-admin-dashboard/sections', icon: Layers, label: 'Section Management', color: 'text-indigo-500' }, 
     { path: '/academic-admin-dashboard/section-enrollment', icon: UserPlus, label: 'Section Enrollment', color: 'text-purple-500' },
    { path: '/academic-admin-dashboard/enrollments', icon: Users, label: 'Enrollment Management', color: 'text-green-500' },
    { path: '/academic-admin-dashboard/students', icon: GraduationCap, label: 'Student Management', color: 'text-purple-500' },
    { path: '/academic-admin-dashboard/reports', icon: BarChart3, label: 'Academic Reports', color: 'text-orange-500' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-800">Academic Admin</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Admas University</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

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
          <p className="text-xs text-gray-400">Academic Admin Portal v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default AcademicAdminSidebar;