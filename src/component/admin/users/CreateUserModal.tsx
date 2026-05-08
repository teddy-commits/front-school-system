import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { registrationApi } from '../../../api/modules/registrationApi';
import { departmentApi } from '../../../api/modules/departmentApi';
import toast from 'react-hot-toast';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  id: number;
  code: string;
  name: string;
  faculty: string;
  isActive: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('INSTRUCTOR');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    designation: '',
    departmentId: '',
    faculty: '',
    qualification: '',
    position: '',
    salary: ''
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    const result = await departmentApi.getActiveDepartments();
    if (result.success) {
      setDepartments(result.data);
    } else {
      console.error('Failed to fetch departments:', result.message);
    }
    setLoadingDepartments(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'departmentId') {
      // Find selected department and auto-fill faculty
      const selectedDept = departments.find(d => d.id.toString() === value);
      if (selectedDept) {
        setFormData({ 
          ...formData, 
          departmentId: value,
          faculty: selectedDept.faculty || ''
        });
      } else {
        setFormData({ ...formData, departmentId: value, faculty: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare data for API
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      designation: formData.designation,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
      faculty: formData.faculty,
      qualification: formData.qualification,
      position: formData.position,
      salary: formData.salary ? parseFloat(formData.salary) : null
    };

    let result;
    switch (userType) {
      case 'INSTRUCTOR':
        // Validate department for instructor
        if (!submitData.departmentId) {
          toast.error('Department is required for Instructor');
          setIsLoading(false);
          return;
        }
        result = await registrationApi.createInstructor(submitData);
        break;
      case 'ACADEMIC_ADMINISTRATOR':
        // Remove departmentId for Academic Administrator (not needed)
        const { departmentId, ...academicData } = submitData;
        result = await registrationApi.createAcademicAdministrator(academicData);
        break;
      case 'MANAGEMENT':
        // Remove departmentId for Management (not needed)
        const { departmentId: deptId, ...managementData } = submitData;
        result = await registrationApi.createManagementStaff(managementData);
        break;
      default:
        result = { success: false, message: 'Invalid user type' };
    }

    if (result.success) {
      toast.success(`${userType} created successfully!`);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  // Check if department should be required
  const isDepartmentRequired = () => {
    return userType === 'INSTRUCTOR';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ACADEMIC_ADMINISTRATOR">Academic Administrator</option>
              <option value="MANAGEMENT">Management Staff</option>
            </select>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Instructor Fields */}
          {userType === 'INSTRUCTOR' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g., Professor, Assistant Professor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., PhD, Masters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Department Selection - Required for INSTRUCTOR only */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  {loadingDepartments ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="animate-pulse h-5 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <select
                      name="departmentId"
                      required
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
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
              </div>
            </>
          )}

          {/* Academic Administrator Fields - No Department */}
          {userType === 'ACADEMIC_ADMINISTRATOR' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g., Registrar, Dean, HOD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., PhD, Masters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </>
          )}

          {/* Management Fields - No Department */}
          {userType === 'MANAGEMENT' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Finance Director, HR Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;