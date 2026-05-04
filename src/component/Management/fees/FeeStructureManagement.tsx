import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, DollarSign, CheckCircle, AlertCircle, X } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';
import CreateFeeStructureModal from './CreateFeeStructureModal';
import EditFeeStructureModal from './EditFeeStructureModal';

interface FeeStructure {
  id: number;
  feeType: string;
  category: string;
  description: string;
  amount: number;
  department: string;
  faculty: string;
  isMandatory: boolean;
  academicYear: number;
  semester: string;
  dueDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  isActive: boolean;
}

const FeeStructureManagement: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null);

  const feeTypes = ['ALL', 'TUITION', 'REGISTRATION', 'LIBRARY', 'LABORATORY', 'SPORTS', 'EXAMINATION', 'ID_CARD'];

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    filterFees();
  }, [searchTerm, selectedType, feeStructures]);

  const fetchFeeStructures = async () => {
    setIsLoading(true);
    const result = await financeApi.getAllFeeStructures();
    if (result.success) setFeeStructures(result.data);
    else toast.error(result.message);
    setIsLoading(false);
  };

  const filterFees = () => {
    let filtered = [...feeStructures];
    if (searchTerm) filtered = filtered.filter(f => f.description.toLowerCase().includes(searchTerm.toLowerCase()) || f.feeType.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedType !== 'ALL') filtered = filtered.filter(f => f.feeType === selectedType);
    setFilteredFees(filtered);
  };

  const handleDelete = async (id: number, description: string) => {
    if (window.confirm(`Delete fee structure "${description}"?`)) {
      const result = await financeApi.deleteFeeStructure(id);
      if (result.success) { toast.success('Fee structure deleted'); fetchFeeStructures(); }
      else toast.error(result.message);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString() : 'Not set';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-xl font-semibold text-gray-800">Fee Structure Management</h2><p className="text-sm text-gray-500">Manage university fee structures and charges</p></div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"><Plus className="w-4 h-4 mr-2" />Create Fee Structure</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-500">Total Structures</p><p className="text-2xl font-bold text-gray-800">{feeStructures.length}</p></div><DollarSign className="w-8 h-8 text-blue-500" /></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-500">Projected Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(feeStructures.reduce((sum, f) => sum + f.amount, 0))}</p></div><DollarSign className="w-8 h-8 text-green-500" /></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-500">Mandatory Fees</p><p className="text-2xl font-bold text-purple-600">{feeStructures.filter(f => f.isMandatory).length}</p></div><CheckCircle className="w-8 h-8 text-purple-500" /></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-500">Active Structures</p><p className="text-2xl font-bold text-orange-600">{feeStructures.filter(f => f.isActive).length}</p></div><AlertCircle className="w-8 h-8 text-orange-500" /></div></div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search by description, fee type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2 border rounded-lg w-48">{feeTypes.map(type => <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type}</option>)}</select>
          <button onClick={fetchFeeStructures} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div> :
          <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mandatory</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">{filteredFees.map((fee) => (<tr key={fee.id} className="hover:bg-gray-50"><td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.feeType === 'TUITION' ? 'bg-blue-100 text-blue-800' : fee.feeType === 'REGISTRATION' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{fee.feeType}</span></td>
            <td className="px-6 py-4 text-sm text-gray-900">{fee.description}</td><td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">{formatCurrency(fee.amount)}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{fee.department || 'ALL'}</td><td className="px-6 py-4 text-sm text-gray-600">{formatDate(fee.dueDate)}</td>
            <td className="px-6 py-4 text-center">{fee.isMandatory ? <span className="text-green-600 text-sm">Yes</span> : <span className="text-gray-400 text-sm">No</span>}</td>
            <td className="px-6 py-4 text-center"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{fee.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="px-6 py-4 text-center"><div className="flex justify-center space-x-2"><button onClick={() => { setSelectedFee(fee); setShowEditModal(true); }} className="p-1 text-green-600 hover:bg-green-50 rounded"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(fee.id, fee.description)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody></table></div>}
      </div>

      {showCreateModal && <CreateFeeStructureModal onClose={() => setShowCreateModal(false)} onSuccess={fetchFeeStructures} />}
      {showEditModal && selectedFee && <EditFeeStructureModal fee={selectedFee} onClose={() => setShowEditModal(false)} onSuccess={fetchFeeStructures} />}
    </div>
  );
};

export default FeeStructureManagement;