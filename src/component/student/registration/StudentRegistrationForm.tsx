import React, { useState, useEffect } from 'react';
import { registrationApi } from '../../../api/modules/registrationApi';
import { registrationSessionApi } from '../../../api/modules/registrationSessionApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import { Calendar, Clock, AlertCircle, XCircle, Info, Building2 } from 'lucide-react';

// Define proper types
interface Department {
  id: number;
  code: string;
  name: string;
  faculty: string;
  isActive: boolean;
}

interface SessionInfo {
  id?: number;
  semester: string;
  academicYear: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

interface NextSessionInfo {
  startDate: string;
  semester: string;
  academicYear: number;
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

interface RegistrationStatusResponse {
  isOpen: boolean;
  session?: SessionInfo;
  nextRegistrationStart?: string;
  nextSemester?: string;
  nextAcademicYear?: number;
}

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [nextSessionInfo, setNextSessionInfo] = useState<NextSessionInfo | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    departmentId: '',
    faculty: '',
    enrollmentYear: new Date().getFullYear(),
    studentType: 'REGULAR',
    dateOfBirth: '',
    nationality: '',
    emergencyContact: '',
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    checkRegistrationStatus();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    const result = await departmentApi.getActiveDepartments() as ApiResponse<Department[]>;
    if (result.success && 'data' in result) {
      setDepartments(result.data);
    } else if (!result.success && 'message' in result) {
      console.error('Failed to fetch departments:', result.message);
    }
    setLoadingDepartments(false);
  };

  const checkRegistrationStatus = async () => {
    setCheckingStatus(true);
    const result = await registrationSessionApi.checkRegistrationStatus() as ApiResponse<RegistrationStatusResponse>;
    if (result.success && 'data' in result) {
      setIsRegistrationOpen(result.data.isOpen);
      if (result.data.session) {
        setSessionInfo(result.data.session);
      }
      if (result.data.nextRegistrationStart) {
        setNextSessionInfo({
          startDate: result.data.nextRegistrationStart,
          semester: result.data.nextSemester || '',
          academicYear: result.data.nextAcademicYear || 0
        });
      }
    }
    setCheckingStatus(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'departmentId') {
      // Find selected department and auto-fill faculty
      const selectedDept = departments.find(d => d.id.toString() === value);
      if (selectedDept) {
        setFormData(prev => ({ 
          ...prev, 
          departmentId: value,
          faculty: selectedDept.faculty || ''
        }));
      } else {
        setFormData(prev => ({ ...prev, departmentId: value, faculty: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check if registration is still open before submitting
    const statusCheck = await registrationSessionApi.checkRegistrationStatus() as ApiResponse<RegistrationStatusResponse>;
    if (!statusCheck.success || !('data' in statusCheck) || !statusCheck.data.isOpen) {
      toast.error('Registration has been closed. Please contact the administration.');
      setIsRegistrationOpen(false);
      return;
    }
    
    setIsLoading(true);
    
    // Prepare data with departmentId
    const submitData = {
      ...formData,
      departmentId: parseInt(formData.departmentId),
      enrollmentYear: parseInt(formData.enrollmentYear.toString())
    };
    
    const result = await registrationApi.registerStudent(submitData) as ApiResponse<{ message: string }>;

    if (result.success && 'data' in result) {
      toast.success(result.data?.message || 'Registration successful!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        departmentId: '',
        faculty: '',
        enrollmentYear: new Date().getFullYear(),
        studentType: 'REGULAR',
        dateOfBirth: '',
        nationality: '',
        emergencyContact: '',
      });
      
      setTimeout(() => {
        navigate('/login/student');
      }, 2000);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message || 'Registration failed');
    } else {
      toast.error('Registration failed. Please try again.');
    }

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (checkingStatus) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (!isRegistrationOpen) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 bg-gradient-to-r from-red-600 to-orange-600 text-center">
                <XCircle className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Registration Closed</h2>
              </div>
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  Student registration is currently closed.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check back during the next registration period.
                </p>
                
                {nextSessionInfo && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      <p className="text-sm font-medium text-blue-800">Next Registration Period</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600">
                          {nextSessionInfo.semester} {nextSessionInfo.academicYear}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600">
                          Starts: {formatDate(nextSessionInfo.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Registration Period Banner */}
          {sessionInfo && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Registration Open: {sessionInfo.semester} {sessionInfo.academicYear}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Registration period ends on: {formatDate(sessionInfo.endDate)}
                  </p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, 
                          ((new Date().getTime() - new Date(sessionInfo.startDate).getTime()) / 
                          (new Date(sessionInfo.endDate).getTime() - new Date(sessionInfo.startDate).getTime())) * 100
                        ))}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Register now before the deadline!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="w-8 h-8 text-white mr-2" />
                <h2 className="text-2xl font-bold text-white text-center">
                  Student Registration
                </h2>
              </div>
              <p className="text-blue-100 text-center mt-2 text-sm">
                Create your account to get started
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="student@university.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a strong password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0912345678"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  {loadingDepartments ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="animate-pulse h-5 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.code} - {dept.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Type *
                  </label>
                  <select
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="REGULAR">Regular (Full-time Day)</option>
                    <option value="EXTENSION">Extension (Evening/Weekday)</option>
                    <option value="WEEKEND">Weekend Program</option>
                    <option value="DISTANCE">Distance Learning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Auto-filled from department"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Year *
                  </label>
                  <input
                    type="number"
                    name="enrollmentYear"
                    value={formData.enrollmentYear}
                    onChange={handleChange}
                    required
                    min={2000}
                    max={2030}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Ethiopian"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your address"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register Now'
                )}
              </button>
            </form>
            
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login/student" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentRegistrationForm;