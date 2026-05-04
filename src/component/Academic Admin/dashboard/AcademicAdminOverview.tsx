import React from 'react';
import { BookOpen, Users, GraduationCap, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AcademicAdminOverviewProps {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  isLoading: boolean;
}

const AcademicAdminOverview: React.FC<AcademicAdminOverviewProps> = ({ 
  totalCourses, 
  totalStudents, 
  totalEnrollments, 
  isLoading 
}) => {
  const stats = [
    { title: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Total Students', value: totalStudents, icon: Users, color: 'bg-green-500' },
    { title: 'Active Enrollments', value: totalEnrollments, icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Avg. Class Size', value: totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const quickActions = [
    { title: 'Create New Course', description: 'Add a new course to the curriculum', icon: BookOpen, link: '/academic-admin-dashboard/courses', color: 'bg-blue-50 text-blue-600' },
    { title: 'View Enrollments', description: 'Monitor student course registrations', icon: Users, link: '/academic-admin-dashboard/enrollments', color: 'bg-green-50 text-green-600' },
    { title: 'Student Transcripts', description: 'Generate and view student transcripts', icon: GraduationCap, link: '/academic-admin-dashboard/students', color: 'bg-purple-50 text-purple-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Academic Administrator Dashboard</h2>
        <p className="text-indigo-100">Manage courses, enrollments, and student academic records.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link} className={`${action.color} rounded-lg p-6 hover:shadow-md transition`}>
            <div className="flex items-start space-x-4">
              <action.icon className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm opacity-80 mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">New course added</p>
                <p className="text-xs text-gray-500">CS301 - Database Systems</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Student enrollment</p>
                <p className="text-xs text-gray-500">5 students enrolled in CS101</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">Yesterday</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Transcript generated</p>
                <p className="text-xs text-gray-500">John Doe requested transcript</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicAdminOverview;