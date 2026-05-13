import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';

// Define proper types
interface StudentProfile {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  enrollmentYear: number;
  department: string;
  faculty: string;
  dateOfBirth?: string;
  nationality?: string;
  studentType?: string;
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

interface FormData {
  phoneNumber: string;
  address: string;
  emergencyContact: string;
}

const StudentProfile: React.FC = () => {
  const { userId, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const result = await registrationApi.getStudentById(userId!) as ApiResponse<StudentProfile>;
      if (result.success && 'data' in result) {
        setProfile(result.data);
        setFormData({
          phoneNumber: result.data.phoneNumber || '',
          address: result.data.address || '',
          emergencyContact: result.data.emergencyContact || ''
        });
      } else if (!result.success && 'message' in result) {
        console.error('Failed to fetch profile:', result.message);
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
    const result = await registrationApi.updateStudent(userId!, formData) as ApiResponse<StudentProfile>;
    if (result.success && 'data' in result) {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
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
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
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
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile?.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{profile?.fullName || user?.fullName}</h3>
              <p className="text-emerald-600">{profile?.studentId}</p>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{profile?.fullName || user?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium">{profile?.email || user?.email}</p>
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
                    className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile?.phoneNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Enrollment Year</p>
                <p className="text-sm font-medium">{profile?.enrollmentYear}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium">{profile?.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Faculty</p>
                <p className="text-sm font-medium">{profile?.faculty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Address</p>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="text-sm border rounded px-2 py-1 w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm font-medium">{profile?.address || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Emergency Contact</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    className="text-sm border rounded px-2 py-1 w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Emergency contact number"
                  />
                ) : (
                  <p className="text-sm font-medium">{profile?.emergencyContact || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;