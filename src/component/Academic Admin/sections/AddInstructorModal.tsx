import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import { courseApi } from '../../../api/modules/courseApi';
import toast from 'react-hot-toast';

interface AddInstructorModalProps {
  sectionId: number;
  sectionName: string;
  sectionCourses: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddInstructorModal: React.FC<AddInstructorModalProps> = ({ 
  sectionId, 
  sectionName, 
  sectionCourses, 
  onClose, 
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const result = await registrationApi.getAllInstructors();
    if (result.success) {
      setInstructors(result.data);
    }
  };

  // Filter instructors based on search term - define this BEFORE using it
  const filteredInstructors = instructors.filter(instructor =>
    instructor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInstructor = async () => {
    if (!selectedInstructor) {
      toast.error('Please select an instructor');
      return;
    }

    if (!selectedCourseId) {
      toast.error('Please select which course this instructor will teach');
      return;
    }

    setIsLoading(true);
    const result = await sectionApi.addInstructorToSection({
      sectionId,
      instructorId: selectedInstructor.id,
      courseId: parseInt(selectedCourseId)
    });

    if (result.success) {
      toast.success(`Instructor assigned to course successfully`);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Assign Instructor to Course</h2>
            <p className="text-sm text-gray-500">Section: {sectionName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Select Course *
            </label>
            {sectionCourses.length === 0 ? (
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-sm text-yellow-800">
                  No courses added to this section yet.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Please add courses first before assigning instructors.
                </p>
              </div>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a course --</option>
                {sectionCourses.map((course) => (
                  <option key={course.id} value={course.courseId}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Search Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Select Instructor *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Instructors List */}
          <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
            {filteredInstructors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No instructors match your search' : 'No instructors available'}
              </div>
            ) : (
              filteredInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  onClick={() => setSelectedInstructor(instructor)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedInstructor?.id === instructor.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{instructor.fullName}</p>
                      <p className="text-sm text-gray-500">{instructor.email}</p>
                      <p className="text-xs text-gray-400">{instructor.department || 'No department'}</p>
                    </div>
                    {selectedInstructor?.id === instructor.id && (
                      <UserPlus className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {selectedCourseId && selectedInstructor && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Will assign <strong>{selectedInstructor.fullName}</strong> to teach{' '}
                <strong>
                  {sectionCourses.find(c => c.courseId.toString() === selectedCourseId)?.courseCode}
                </strong>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddInstructor}
              disabled={!selectedInstructor || !selectedCourseId || isLoading || sectionCourses.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Assigning...' : 'Assign Instructor to Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInstructorModal;