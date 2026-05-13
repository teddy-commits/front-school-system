import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Mail, User } from 'lucide-react';
import { sectionApi } from '../../../api/modules/sectionApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  department?: string;
  isActive?: boolean;
}

interface AddInstructorModalProps {
  sectionId: number;
  sectionName: string;
  currentInstructorEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

// API Response types
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

const AddInstructorModal: React.FC<AddInstructorModalProps> = ({ 
  sectionId, 
  sectionName, 
  currentInstructorEmail, 
  onClose, 
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const result = await registrationApi.getAllInstructors() as ApiResponse<Instructor[]>;
    if (result.success && 'data' in result) {
      setInstructors(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch instructors');
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleAssign = async () => {
  if (!selectedInstructor) {
    toast.error('Please select an instructor');
    return;
  }

  setIsLoading(true);
  
  // ✅ Fix: Pass an object with sectionId and instructorId (as number, NOT email)
  const result = await sectionApi.addInstructorToSection({
    sectionId: sectionId,
    instructorId: selectedInstructor.id  // Use id, not email
  }) as ApiResponse;

  if (result.success) {
    toast.success(`Instructor ${selectedInstructor.fullName} assigned to section ${sectionName}`);
    onSuccess();
    onClose();
  } else if (!result.success && 'message' in result) {
    toast.error(result.message);
  } else {
    toast.error('Failed to assign instructor');
  }
  setIsLoading(false);
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Assign Instructor</h2>
            <p className="text-sm text-gray-500">Section: {sectionName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Instructor Info */}
          {currentInstructorEmail && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-800">Current Instructor:</p>
              <p className="text-sm text-blue-600">{currentInstructorEmail}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Instructors List */}
          <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
            {filteredInstructors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No instructors found</p>
              </div>
            ) : (
              filteredInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  onClick={() => setSelectedInstructor(instructor)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedInstructor?.id === instructor.id 
                      ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="font-medium text-gray-900">{instructor.fullName}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Mail className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500">{instructor.email}</p>
                      </div>
                      {instructor.department && (
                        <p className="text-xs text-gray-400 mt-1">{instructor.department}</p>
                      )}
                    </div>
                    {selectedInstructor?.id === instructor.id && (
                      <UserPlus className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedInstructor || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Assigning...' : 'Assign Instructor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInstructorModal;