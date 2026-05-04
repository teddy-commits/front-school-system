import React from 'react';
import { BookOpen, Users, Award, TrendingUp, Clock, CheckCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InstructorOverviewProps {
  assignedCourses: any[];
  totalStudents: number;
  isLoading: boolean;
}

const InstructorOverview: React.FC<InstructorOverviewProps> = ({ 
  assignedCourses, 
  totalStudents, 
  isLoading 
}) => {
  const stats = [
    { title: 'Courses Teaching', value: assignedCourses.length, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Total Students', value: totalStudents, icon: Users, color: 'bg-green-500' },
    { title: 'Avg. Class Size', value: assignedCourses.length > 0 ? Math.round(totalStudents / assignedCourses.length) : 0, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Courses Completed', value: assignedCourses.filter(c => c.status === 'COMPLETED').length, icon: Award, color: 'bg-orange-500' },
  ];

  const pendingActions = [
    { title: 'Grades Pending Submission', count: 0, icon: Clock, color: 'text-yellow-600', link: '/instructor-dashboard/grades' },
    { title: 'Courses In Progress', count: assignedCourses.filter(c => c.status === 'IN_PROGRESS').length, icon: CheckCircle, color: 'text-blue-600', link: '/instructor-dashboard/courses' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back, Instructor! 👋</h2>
        <p className="text-blue-100">Manage your courses, submit grades, and track student progress.</p>
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

      {/* Quick Actions & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Pending Actions</h3>
          </div>
          <div className="divide-y">
            {pendingActions.map((action, idx) => (
              <Link key={idx} to={action.link} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <action.icon className={`w-5 h-5 ${action.color} mr-3`} />
                  <span className="text-gray-700">{action.title}</span>
                </div>
                <span className="font-semibold text-gray-800">{action.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Quick Links</h3>
          </div>
          <div className="p-4 space-y-3">
            <Link to="/instructor-dashboard/grades" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Submit Grades</p>
                <p className="text-xs text-gray-500">Enter or update student grades</p>
              </div>
            </Link>
            <Link to="/instructor-dashboard/courses" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <BookOpen className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">View Courses</p>
                <p className="text-xs text-gray-500">See your assigned courses</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Current Courses Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-gray-800">Current Courses</h3>
          <Link to="/instructor-dashboard/courses" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        <div className="divide-y">
          {assignedCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{course.courseCode} - {course.courseName}</p>
                <p className="text-sm text-gray-500">{course.semester} {course.academicYear}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                course.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                course.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.status}
              </span>
            </div>
          ))}
          {assignedCourses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No courses assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorOverview;