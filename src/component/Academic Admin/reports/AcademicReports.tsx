import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicReports: React.FC = () => {
  const [reportType, setReportType] = useState('enrollment');
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div><h2 className="text-xl font-semibold text-gray-800">Academic Reports</h2><p className="text-sm text-gray-500">Generate and export academic reports</p></div>
        <button onClick={handleExport} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"><Download className="w-4 h-4 mr-2" />Export Report</button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2"><Filter className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">Report Type:</span></div>
          <div className="flex gap-2">
            {[
              { id: 'enrollment', label: 'Enrollment Report' },
              { id: 'grade', label: 'Grade Distribution' },
              { id: 'course', label: 'Course Statistics' }
            ].map(type => (
              <button key={type.id} onClick={() => setReportType(type.id)} className={`px-4 py-2 rounded-lg capitalize transition ${reportType === type.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{type.label}</button>
            ))}
          </div>
          <div className="h-8 w-px bg-gray-300 mx-2" />
          <div className="flex gap-3">
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="FALL">Fall</option><option value="SPRING">Spring</option><option value="SUMMER">Summer</option></select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg"><option value={2024}>2024</option><option value={2025}>2025</option></select>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Generate</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg"><div className="text-center"><BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Report preview will appear here</p><p className="text-sm text-gray-400">Select report type and click Generate</p></div></div>
      </div>
    </div>
  );
};

export default AcademicReports;