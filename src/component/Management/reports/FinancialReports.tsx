import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileText } from 'lucide-react';
import { financeApi } from '../../../api/modules/financeApi';
import toast from 'react-hot-toast';

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    let result;
    if (reportType === 'daily') result = await financeApi.getDailyReport(selectedDate);
    else if (reportType === 'monthly') result = await financeApi.getMonthlyReport(selectedYear, selectedMonth);
    else result = await financeApi.getSemesterReport(selectedSemester, selectedYear);
    if (result.success) toast.success('Report generated');
    else toast.error(result.message);
    setIsLoading(false);
  };

  return (
    <div><div className="mb-6"><h2 className="text-xl font-semibold">Financial Reports</h2><p className="text-sm text-gray-500">Generate financial statements and reports</p></div>
    <div className="bg-white rounded-lg shadow p-6 mb-6"><div className="flex flex-wrap gap-4 items-center"><div className="flex gap-2">{['daily', 'monthly', 'semester'].map(type => (<button key={type} onClick={() => setReportType(type)} className={`px-4 py-2 rounded-lg capitalize ${reportType === type ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>{type}</button>))}</div>
    {reportType === 'daily' && <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg" />}
    {reportType === 'monthly' && (<><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('default', { month: 'long' })}</option>)}</select>
    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg"><option>2024</option><option>2025</option></select></>)}
    {reportType === 'semester' && (<><select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="FALL">Fall</option><option value="SPRING">Spring</option><option value="SUMMER">Summer</option></select>
    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg"><option>2024</option><option>2025</option></select></>)}
    <button onClick={handleGenerate} disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Generate</button></div></div>
    <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center border-2 border-dashed"><div className="text-center"><BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Report preview will appear here</p><p className="text-sm text-gray-400">Select report type and click Generate</p></div></div></div>
  );
};

export default FinancialReports;