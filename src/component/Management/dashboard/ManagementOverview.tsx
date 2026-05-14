import React from 'react';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ManagementOverviewProps {
  stats: {
    totalRevenue: number;
    totalOutstanding: number;
    totalTransactions: number;
    overdueCount: number;
  };
  isLoading: boolean;
}

const ManagementOverview: React.FC<ManagementOverviewProps> = ({ stats, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500', change: '+12%' },
    { title: 'Outstanding Fees', value: formatCurrency(stats.totalOutstanding), icon: TrendingUp, color: 'bg-yellow-500', change: '-5%' },
    { title: 'Transactions', value: stats.totalTransactions, icon: CreditCard, color: 'bg-blue-500', change: '+8%' },
    { title: 'Overdue Accounts', value: stats.overdueCount, icon: AlertCircle, color: 'bg-red-500', change: '+2%' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Financial Dashboard</h2>
        <p className="text-emerald-100">Monitor revenue, payments, and financial performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{stat.title}</p><p className="text-2xl font-bold text-gray-800">{stat.value}</p></div>
              <div className={`${stat.color} p-3 rounded-full`}><stat.icon className="w-6 h-6 text-white" /></div>
            </div>
            <div className="mt-2"><span className="text-xs text-green-600">{stat.change}</span><span className="text-xs text-gray-400 ml-1">from last month</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Quick Actions</h3></div>
          <div className="p-4 space-y-3">
            <Link to="/management-dashboard/fee-structures" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <DollarSign className="w-5 h-5 text-blue-600 mr-3" /><div><p className="font-medium text-gray-800">Manage Fee Structures</p><p className="text-xs text-gray-500">Create and update fee structures</p></div>
            </Link>
            <Link to="/management-dashboard/payments" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <CreditCard className="w-5 h-5 text-green-600 mr-3" /><div><p className="font-medium text-gray-800">Process Payments</p><p className="text-xs text-gray-500">Record student payments</p></div>
            </Link>
            <Link to="/management-dashboard/reports" className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
              <Receipt className="w-5 h-5 text-orange-600 mr-3" /><div><p className="font-medium text-gray-800">Financial Reports</p><p className="text-xs text-gray-500">Generate financial statements</p></div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Recent Activity</h3></div>
          <div className="divide-y">
            <div className="p-4"><div className="flex justify-between"><span className="text-sm text-gray-600">New payment received</span><span className="text-xs text-gray-400">2 min ago</span></div><p className="text-xs text-gray-500 mt-1">Student: John Doe - ETB 25,000.00</p></div>
            <div className="p-4"><div className="flex justify-between"><span className="text-sm text-gray-600">Invoice generated</span><span className="text-xs text-gray-400">1 hour ago</span></div><p className="text-xs text-gray-500 mt-1">Semester: Fall 2024</p></div>
            <div className="p-4"><div className="flex justify-between"><span className="text-sm text-gray-600">Fee structure updated</span><span className="text-xs text-gray-400">3 hours ago</span></div><p className="text-xs text-gray-500 mt-1">Tuition fee updated</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementOverview;