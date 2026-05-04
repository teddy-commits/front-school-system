import React, { useState } from 'react';
import { Search, Eye, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import { registrationApi } from '../../../api/modules/registrationApi';
import toast from 'react-hot-toast';
import StudentFeesView from '../fees/StudentFeesView';

const StudentFeeSummary: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForView, setSelectedStudentForView] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchStudents = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    setIsSearching(true);
    const result = await registrationApi.searchStudents(searchTerm);
    if (result.success) {
      setStudents(result.data);
      if (result.data.length === 0) {
        toast.info('No students found');
      }
    } else {
      toast.error(result.message);
    }
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudents();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Student Fee Summary</h2>
        <p className="text-sm text-gray-500">Search students and view detailed fee information</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students Found</p>
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Students</p>
              <p className="text-2xl font-bold text-green-600">{students.filter(s => s.isActive).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{new Set(students.map(s => s.department)).size}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={searchStudents}
            disabled={isSearching}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Search by student name or student ID (e.g., STU20240001)
        </p>
      </div>

      {/* Results Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{s.studentId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.faculty || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudentForView(s)}
                        className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Fee Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {students.length === 0 && searchTerm && !isSearching && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No students found matching "{searchTerm}"</p>
          <p className="text-sm text-gray-400 mt-2">Try searching by name or student ID</p>
        </div>
      )}

      {/* Student Fees View Modal */}
      {selectedStudentForView && (
        <StudentFeesView
          studentId={selectedStudentForView.id}
          onClose={() => setSelectedStudentForView(null)}
        />
      )}
    </div>
  );
};

export default StudentFeeSummary;