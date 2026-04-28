import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, User, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface Enrollment {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  instructorName: string;
  schedule: string;
  room: string;
  semester: string;
  academicYear: number;
  status: string;
}

const StudentCourses: React.FC = () => {
  const { userId } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEnrollments();
    }
  }, [userId]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const result = await enrollmentApi.getStudentEnrollments(userId!);
      if (result.success) {
        setEnrollments(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
        <p className="text-sm text-gray-500">View all your enrolled courses for the current semester</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
          <p className="text-sm text-gray-400">Please contact the academic office for assistance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{enrollment.courseCode}</h3>
                    <p className="text-gray-600">{enrollment.courseName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{enrollment.schedule || 'Schedule TBA'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{enrollment.room || 'Room TBA'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Instructor: {enrollment.instructorName || 'TBA'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{enrollment.semester} {enrollment.academicYear}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500">Credits: {enrollment.credits}</span>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;