import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Filter } from 'lucide-react';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import CreateUserModal from './CreateUserModal';
import UserDetailsModal from './UserDetailsModal';

interface User {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  isActive: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL user types
      const [instructorsResult, adminsResult, managementResult] = await Promise.all([
        registrationApi.getAllInstructors(),
        // Add these API calls if they exist, or create them
        registrationApi.getAcademicAdministrators?.() || Promise.resolve({ success: true, data: [] }),
        registrationApi.getManagementStaff?.() || Promise.resolve({ success: true, data: [] }),
      ]);
      
      let allUsers: User[] = [];
      
      if (instructorsResult.success) {
        allUsers = [...allUsers, ...instructorsResult.data];
      }
      if (adminsResult.success) {
        allUsers = [...allUsers, ...adminsResult.data];
      }
      if (managementResult.success) {
        allUsers = [...allUsers, ...managementResult.data];
      }
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  };

  const handleDeactivate = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      const result = await registrationApi.deactivateStudent(id);
      if (result.success) {
        toast.success('User deactivated successfully');
        fetchUsers();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleActivate = async (id: number) => {
    const result = await registrationApi.activateStudent(id);
    if (result.success) {
      toast.success('User activated successfully');
      fetchUsers();
    } else {
      toast.error(result.message);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const roles = ['ALL', 'STUDENT', 'INSTRUCTOR', 'ACADEMIC_ADMINISTRATOR', 'MANAGEMENT', 'ADMIN'];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500">Manage all users in the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-64">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role === 'ALL' ? 'All Roles' : role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.userId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'INSTRUCTOR' ? 'bg-green-100 text-green-800' :
                      user.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.department || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Deactivate"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Activate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onSuccess={fetchUsers} />
      )}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  );
};

export default UserManagement;