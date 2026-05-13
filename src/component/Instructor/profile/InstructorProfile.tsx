import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Edit2, Save, X, Award } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

interface InstructorProfileData {
  id: number;
  fullName: string;
  email: string;
  employeeId?: string;
  phoneNumber?: string;
  address?: string;
  officeLocation?: string;
  designation?: string;
  qualification?: string;
  department?: string;
  joiningDate?: string;
  isActive?: boolean;
}

interface FormData {
  phoneNumber: string;
  address: string;
  officeLocation: string;
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

const InstructorProfile: React.FC = () => {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<InstructorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    address: '',
    officeLocation: ''
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const result = await registrationApi.getUserById(userId!) as ApiResponse<InstructorProfileData>;
      if (result.success && 'data' in result) {
        setProfile(result.data);
        setFormData({
          phoneNumber: result.data.phoneNumber || '',
          address: result.data.address || '',
          officeLocation: result.data.officeLocation || ''
        });
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    const result = await registrationApi.updateUser(userId!, formData) as ApiResponse;
    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile data not available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
          <p className="text-sm text-gray-500">View and manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.fullName?.charAt(0) || 'I'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{profile.fullName}</h3>
              <p className="text-blue-600">{profile.employeeId}</p>
              <p className="text-sm text-gray-500">{profile.designation || 'Instructor'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{profile.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="text-sm border rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.phoneNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Designation</p>
                <p className="text-sm font-medium">{profile.designation || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Qualification</p>
                <p className="text-sm font-medium">{profile.qualification || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium">{profile.department || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-medium">
                  {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Office Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                    className="text-sm border rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter office location"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.officeLocation || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Address</p>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="text-sm border rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;