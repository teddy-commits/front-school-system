import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  User, 
  LogOut,
  TrendingUp,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface InstructorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ isOpen, onToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('instructor-sidebar');
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
    { path: '/instructor-dashboard/overview', icon: LayoutDashboard, label: 'Overview', color: 'text-blue-500' },
    { path: '/instructor-dashboard/courses', icon: BookOpen, label: 'My Courses', color: 'text-green-500' },
    { path: '/instructor-dashboard/sections', icon: Layers, label: 'My Sections', color: 'text-indigo-500' }, 
    { path: '/instructor-dashboard/grades', icon: GraduationCap, label: 'Grade Management', color: 'text-purple-500' },
    { path: '/instructor-dashboard/profile', icon: User, label: 'My Profile', color: 'text-gray-500' },
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
        id="instructor-sidebar"
        className={`
          fixed md:relative z-30
          w-64 md:w-64 
          bg-white shadow-lg flex flex-col
          transition-transform duration-300 ease-in-out
          h-full overflow-y-auto
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

        <div className="p-4 md:p-6 border-b">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <span className="text-lg md:text-xl font-bold text-gray-800">Instructor Portal</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 hidden sm:block">Admas University</p>
        </div>

        <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
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
            <p className="text-xs text-gray-400">Instructor Portal v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;