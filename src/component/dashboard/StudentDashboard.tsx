import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, BookOpen, CreditCard, Calendar, 
  Award, Bell, LogOut, User, TrendingUp 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user, logout, userFullName, userLoginId } = useAuth();

  const stats = [
    { title: 'Current GPA', value: '3.75', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Credits Earned', value: '84', icon: Award, color: 'bg-blue-500' },
    { title: 'Courses', value: '6', icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Due Fees', value: '$0', icon: CreditCard, color: 'bg-yellow-500' },
  ];

  const recentCourses = [
    { code: 'CS101', name: 'Introduction to Programming', grade: 'A', credits: 3 },
    { code: 'CS201', name: 'Data Structures', grade: 'A-', credits: 3 },
    { code: 'MATH101', name: 'Calculus I', grade: 'B+', credits: 4 },
  ];

  const menuItems = [
    { title: 'My Courses', icon: BookOpen, path: '/my-courses' },
    { title: 'My Grades', icon: GraduationCap, path: '/my-grades' },
    { title: 'Fee Status', icon: CreditCard, path: '/fee-status' },
    { title: 'Academic Calendar', icon: Calendar, path: '/calendar' },
    { title: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center">
            <GraduationCap className="w-8 h-8 text-emerald-600" />
            <h1 className="text-xl font-bold text-gray-800 ml-2">Student Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{userFullName}</p>
                <p className="text-xs text-gray-500">ID: {userLoginId}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">
                  {userFullName?.charAt(0)}
                </span>
              </div>
              <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5 text-emerald-600 mr-3" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome, {userFullName}!</h2>
            <p className="text-emerald-100">Your academic journey continues. Track your progress and stay updated.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Current Courses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentCourses.map((course) => (
                    <tr key={course.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.credits}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.grade === 'A' ? 'bg-green-100 text-green-800' :
                          course.grade === 'A-' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;