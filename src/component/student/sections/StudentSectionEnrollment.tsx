import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { sectionApi } from '../../../api/modules/sectionApi';
import { enrollmentApi } from '../../../api/modules/enrollmentApi';
import { courseApi } from '../../../api/modules/courseApi';
import { BookOpen, Users, Clock, MapPin, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Section {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  semester: string;
  academicYear: number;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule: string;
  room: string;
  status: string;
  hasAvailableSeats: boolean;
}

const StudentSectionEnrollment: React.FC = () => {
  const { userId } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [courses, setCourses] = useState<any[]>([]);

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    fetchData();
  }, [selectedSemester, selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAvailableSections(),
      fetchMyEnrollments(),
      fetchCourses()
    ]);
    setIsLoading(false);
  };

  const fetchAvailableSections = async () => {
    const result = await sectionApi.getOpenSections(selectedSemester, selectedYear);
    if (result.success) {
      setSections(result.data);
    }
  };

  const fetchMyEnrollments = async () => {
    const result = await enrollmentApi.getStudentSectionEnrollments(userId!);
    if (result.success) {
      setMyEnrollments(result.data.map((e: any) => e.section));
    }
  };

  const fetchCourses = async () => {
    const result = await courseApi.getAllCourses();
    if (result.success) {
      setCourses(result.data);
    }
  };

  const handleEnroll = async (sectionId: number) => {
    const result = await enrollmentApi.enrollInSection({
      studentId: userId!,
      sectionId: sectionId
    });
    
    if (result.success) {
      toast.success(result.data.message);
      fetchData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDrop = async (enrollmentId: number) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      const result = await enrollmentApi.dropSection(enrollmentId);
      if (result.success) {
        toast.success('Course dropped successfully');
        fetchData();
      } else {
        toast.error(result.message);
      }
    }
  };

  const isEnrolled = (sectionId: number) => {
    return myEnrollments.some(e => e.id === sectionId);
  };

  const getEnrollmentId = (sectionId: number) => {
    const enrollment = myEnrollments.find(e => e.id === sectionId);
    return enrollment?.id;
  };

  const filteredSections = sections.filter(section => 
    selectedCourse === 'ALL' || section.courseId.toString() === selectedCourse
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Course Registration</h2>
        <p className="text-gray-500">Select your preferred course sections for the semester</p>
      </div>

      {/* Semester Selection */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Available Sections */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Available Sections</h3>
          <p className="text-sm text-gray-500">Select a section to enroll</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sections available for this semester</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredSections.map((section) => (
              <div key={section.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {section.courseCode} - {section.courseName}
                      </h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Section {section.sectionCode}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Instructor: {section.instructorName || 'TBA'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{section.schedule || 'Schedule TBA'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{section.room || 'Room TBA'}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Seats: {section.enrolledStudents}/{section.maxStudents}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {isEnrolled(section.id) ? (
                      <div className="text-center">
                        <button
                          onClick={() => handleDrop(getEnrollmentId(section.id)!)}
                          className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Drop Course
                        </button>
                        <div className="mt-1 flex items-center text-xs text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(section.id)}
                        disabled={!section.hasAvailableSeats}
                        className={`px-4 py-2 text-sm rounded-lg transition ${
                          section.hasAvailableSeats
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {section.hasAvailableSeats ? 'Enroll' : 'Full'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Enrollments Summary */}
      {myEnrollments.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-green-50">
            <h3 className="text-lg font-semibold text-gray-800">My Enrolled Sections</h3>
            <p className="text-sm text-gray-500">Currently enrolled in {myEnrollments.length} section(s)</p>
          </div>
          <div className="divide-y">
            {myEnrollments.map((section) => (
              <div key={section.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {section.courseCode} - {section.courseName} (Section {section.sectionCode})
                  </p>
                  <p className="text-sm text-gray-500">{section.schedule} | {section.room}</p>
                </div>
                <button
                  onClick={() => handleDrop(getEnrollmentId(section.id)!)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  Drop
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSectionEnrollment;