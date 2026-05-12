import React, { useState, useEffect } from 'react';
import { X, User, BookOpen, Calendar, MapPin, Trash2, UserPlus, Plus } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import toast from 'react-hot-toast';
import AddInstructorModal from './AddInstructorModal';
import AddCourseModal from './AddCourseModal';

interface SectionDetailsModalProps {
  section: any;
  onClose: () => void;
  onUpdate: () => void;
}
// Update the interface to match DTO
interface Instructor {
  id: number;
  instructorId: number;
  instructorName: string;
  instructorEmail: string;
  department: string;
  designation: string;
  courseId: number | null;
  courseCode: string | null;
  courseName: string | null;
  assignedAt: string;
}

interface Course {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  schedule: string;
  room: string;
  addedAt: string;
}
const SectionDetailsModal: React.FC<SectionDetailsModalProps> = ({ section, onClose, onUpdate }) => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  useEffect(() => {
    fetchSectionData();
  }, [section.id]);

  const fetchSectionData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchInstructors(),
      fetchCourses()
    ]);
    setIsLoading(false);
  };

const fetchInstructors = async () => {
  const result = await sectionApi.getSectionInstructors(section.id);
  if (result.success) {
    setInstructors(result.data);
  }
};

 const fetchCourses = async () => {
  const result = await sectionApi.getSectionCourses(section.id);
  if (result.success) {
    setCourses(result.data);
  }
};

  const handleRemoveInstructor = async (instructorId: number, instructorName: string) => {
    if (window.confirm(`Remove ${instructorName} from this section?`)) {
      const result = await sectionApi.removeInstructorFromSection(instructorId);
      if (result.success) {
        toast.success('Instructor removed from section');
        fetchInstructors();
        onUpdate();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleRemoveCourse = async (courseId: number, courseName: string) => {
    if (window.confirm(`Remove ${courseName} from this section?`)) {
      const result = await sectionApi.removeCourseFromSection(courseId);
      if (result.success) {
        toast.success('Course removed from section');
        fetchCourses();
        onUpdate();
      } else {
        toast.error(result.message);
      }
    }
  };

  const getYearLevelBadge = (yearLevel: number) => {
    const styles: Record<number, string> = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-indigo-100 text-indigo-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-cyan-100 text-cyan-800',
      5: 'bg-teal-100 text-teal-800'
    };
    return styles[yearLevel] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Section Details</h2>
            <p className="text-sm text-gray-500">
              {section.departmentCode} - Section {section.sectionCode} | Year {section.academicYearLevel}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{section.departmentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Section Code</p>
                <p className="font-medium">{section.sectionCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Level</p>
                <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYearLevelBadge(section.academicYearLevel)}`}>
                  Year {section.academicYearLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Semester</p>
                <p className="font-medium">{section.semester} {section.academicYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">{section.enrolledStudents} / {section.maxStudents} students</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  section.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {section.status}
                </span>
              </div>
            </div>
          </div>

          {/* Instructors Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-500" />
                Instructors ({instructors.length}/7)
              </h3>
              {instructors.length < 7 && (
                <button
                  onClick={() => setShowAddInstructor(true)}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Instructor
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : instructors.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No instructors assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             // In the instructors list display
{instructors.map((instructor) => (
  <div key={instructor.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
    <div>
      <p className="font-medium text-gray-900">{instructor.instructorName}</p>
      <p className="text-sm text-gray-500">{instructor.instructorEmail}</p>
      <p className="text-xs text-gray-400">{instructor.department}</p>
      {instructor.courseCode && (
        <p className="text-xs text-indigo-600 mt-1">
          Teaches: {instructor.courseCode} - {instructor.courseName}
        </p>
      )}
    </div>
    <button
      onClick={() => handleRemoveInstructor(instructor.id, instructor.instructorName)}
      className="p-1 text-red-600 hover:bg-red-50 rounded"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
))}
{courses.map((course) => (
  <div key={course.id} className="bg-gray-50 rounded-lg p-3">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{course.courseCode} - {course.courseName}</p>
        <p className="text-sm text-gray-500">Credits: {course.credits}</p>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{course.schedule || 'Schedule TBA'}</span>
          <MapPin className="w-4 h-4 ml-3 mr-1" />
          <span>{course.room || 'Room TBA'}</span>
        </div>
      </div>
      <button
        onClick={() => handleRemoveCourse(course.id, course.courseName)}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
))}

              </div>
            )}
          </div>

          {/* Courses Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                Courses ({courses.length}/7)
              </h3>
              {courses.length < 7 && (
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Course
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No courses added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {courses.map((course) => (
                  <div key={course.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{course.courseCode} - {course.courseName}</p>
                        <p className="text-sm text-gray-500">Credits: {course.credits}</p>
                        {course.schedule && (
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{course.schedule}</span>
                            <MapPin className="w-4 h-4 ml-3 mr-1" />
                            <span>{course.room}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(course.id, course.courseName)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
            Close
          </button>
        </div>
      </div>

    
{showAddInstructor && (
  <AddInstructorModal
    sectionId={section.id}
    sectionName={`${section.departmentCode} - Section ${section.sectionCode}`}
    sectionCourses={courses}  // Pass the courses list
    onClose={() => setShowAddInstructor(false)}
    onSuccess={() => {
      fetchInstructors();
      onUpdate();
    }}
  />
)}

      {showAddCourse && (
        <AddCourseModal
          sectionId={section.id}
          sectionName={`${section.departmentCode} - Section ${section.sectionCode}`}
          onClose={() => setShowAddCourse(false)}
          onSuccess={() => {
            fetchCourses();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default SectionDetailsModal;