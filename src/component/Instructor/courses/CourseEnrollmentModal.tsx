import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import toast from 'react-hot-toast';

interface CourseEnrollmentModalProps {
  course: any;
  semester: string;      // ✅ Add semester prop
  academicYear: number;  // ✅ Add academicYear prop
  onClose: () => void;
}

const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({ 
  course, 
  semester,        // ✅ Destructure semester
  academicYear,    // ✅ Destructure academicYear
  onClose 
}) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [course.id, semester, academicYear]); // ✅ Add dependencies

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      // ✅ Now semester and academicYear are defined
      const result = await enrollmentApi.getCourseEnrollments(
        course.id,        // Number - course ID
        semester,         // String - e.g., "FALL"
        academicYear      // Number - e.g., 2026
      );
      
      if (result.success) {
        setEnrollments(result.data);
      } else {
        toast.error(result.message || 'Failed to load enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrolled students');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Enrolled Students</h2>
            <p className="text-sm text-gray-500">
              {course.courseCode} - {course.courseName} | {semester} {academicYear}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students enrolled in this course yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Enroll students in this section to see them here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment, index) => (
                    <tr key={enrollment.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {enrollment.studentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {enrollment.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {enrollment.enrollmentDate 
                          ? new Date(enrollment.enrollmentDate).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          enrollment.status === 'ENROLLED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {enrollment.status || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentModal;