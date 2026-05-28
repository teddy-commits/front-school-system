import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, Clock, RefreshCw, X, 
  CheckCircle, AlertCircle, Eye, EyeOff, Save, CalendarDays
} from 'lucide-react';
import { registrationSessionApi } from '../../../api/modules/registrationSessionApi';
import toast from 'react-hot-toast';

interface Session {
  id: number;
  semester: string;
  academicYear: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrentlyOpen: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
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

// Mapping between UI display and backend values
const semesterMapping = {
  'Semester 1': 'FALL',
  'Semester 2': 'SPRING',
  'Semester 3': 'SUMMER'
};

// Reverse mapping for displaying backend values in UI
const reverseSemesterMapping: Record<string, string> = {
  'FALL': 'Semester 1',
  'SPRING': 'Semester 2',
  'SUMMER': 'Semester 3'
};

const RegistrationSessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    semester: 'Semester 1', // UI uses Semester 1,2,3
    academicYear: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    description: ''
  });

  // UI display options
  const uiSemesters = ['Semester 1', 'Semester 2', 'Semester 3'];
  const years = [2024, 2025, 2026, 2027];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    const result = await registrationSessionApi.getAllSessions() as ApiResponse<Session[]>;
    if (result.success && 'data' in result) {
      setSessions(Array.isArray(result.data) ? result.data : []);
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to fetch sessions');
    }
    setIsLoading(false);
  };

  // Convert UI semester to backend semester before sending
  const getBackendSemester = (uiSemester: string): string => {
    return semesterMapping[uiSemester as keyof typeof semesterMapping] || 'FALL';
  };

  // Convert backend semester to UI semester for display
  const getUISemester = (backendSemester: string): string => {
    return reverseSemesterMapping[backendSemester] || backendSemester;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend
    const backendData = {
      ...formData,
      semester: getBackendSemester(formData.semester)
    };
    
    const result = await registrationSessionApi.createSession(backendData) as ApiResponse;
    if (result.success) {
      toast.success('Registration session created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchSessions();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to create session');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    
    // Prepare data for backend
    const backendData = {
      ...formData,
      semester: getBackendSemester(formData.semester)
    };
    
    const result = await registrationSessionApi.updateSession(editingSession.id, backendData) as ApiResponse;
    if (result.success) {
      toast.success('Registration session updated successfully');
      setEditingSession(null);
      resetForm();
      fetchSessions();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to update session');
    }
  };

  const handleCloseSession = async (id: number) => {
    if (window.confirm('Are you sure you want to close this registration session?')) {
      const result = await registrationSessionApi.closeSession(id) as ApiResponse;
      if (result.success) {
        toast.success('Registration session closed');
        fetchSessions();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to close session');
      }
    }
  };

  const handleActivateSession = async (id: number) => {
    const result = await registrationSessionApi.activateSession(id) as ApiResponse;
    if (result.success) {
      toast.success('Registration session activated');
      fetchSessions();
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Failed to activate session');
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (window.confirm('Delete this session permanently? This action cannot be undone.')) {
      const result = await registrationSessionApi.deleteSession(id) as ApiResponse;
      if (result.success) {
        toast.success('Session deleted successfully');
        fetchSessions();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      } else {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleEditClick = (session: Session) => {
    setEditingSession(session);
    setFormData({
      semester: getUISemester(session.semester), // Convert backend to UI format
      academicYear: session.academicYear,
      startDate: session.startDate.split('T')[0],
      endDate: session.endDate.split('T')[0],
      description: session.description || ''
    });
  };

  const resetForm = () => {
    setFormData({
      semester: 'Semester 1',
      academicYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const isSessionActive = (session: Session) => {
    const now = new Date();
    return session.isActive && new Date(session.startDate) <= now && new Date(session.endDate) >= now;
  };

  const getStatusBadge = (session: Session) => {
    if (isSessionActive(session)) {
      return { text: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (session.isActive && new Date(session.startDate) > new Date()) {
      return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else {
      return { text: 'Closed', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const currentActiveSession = sessions.find(isSessionActive);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Registration Period Management</h2>
          <p className="text-sm text-gray-500">Control when student registration is open</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Registration Period
        </button>
      </div>

      {/* Current Status Card */}
      <div className={`rounded-lg p-4 mb-6 border ${
        currentActiveSession 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {currentActiveSession ? (
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">Current Registration Status</p>
              <p className="text-lg font-bold">
                {currentActiveSession ? 'OPEN' : 'CLOSED'}
              </p>
              {currentActiveSession && (
                <p className="text-sm text-gray-600">
                  {getUISemester(currentActiveSession.semester)} {currentActiveSession.academicYear}
                </p>
              )}
            </div>
          </div>
          <button onClick={fetchSessions} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {currentActiveSession && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Registration Period</span>
              <span>Deadline: {new Date(currentActiveSession.endDate).toLocaleDateString()}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.max(0, 
                    ((new Date().getTime() - new Date(currentActiveSession.startDate).getTime()) / 
                    (new Date(currentActiveSession.endDate).getTime() - new Date(currentActiveSession.startDate).getTime())) * 100
                  ))}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => {
                  const status = getStatusBadge(session);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {getUISemester(session.semester)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{session.academicYear}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(session.startDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(session.endDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {session.description || '-'}
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(session)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {session.isActive && !isSessionActive(session) && (
                            <button
                              onClick={() => handleActivateSession(session.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Activate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {session.isActive && (
                            <button
                              onClick={() => handleCloseSession(session.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Close"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {sessions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No registration sessions created yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Create your first registration period
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSession) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {editingSession ? 'Edit Registration Period' : 'Create Registration Period'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSession(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingSession ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {uiSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <select
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Semester 1 Registration Period"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium">Note:</p>
                <p className="text-xs mt-1">Students can only register during the specified date range when the session is active.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSession(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingSession ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// XCircle component for the close action
const XCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default RegistrationSessionManagement;