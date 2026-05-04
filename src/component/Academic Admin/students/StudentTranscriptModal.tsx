import React from 'react';
import { X, Printer, Download } from 'lucide-react';

const StudentTranscriptModal: React.FC<{ student: any; transcript: any; onClose: () => void }> = ({ student, transcript, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Academic Transcript</h2>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center mb-8"><h3 className="text-2xl font-bold text-gray-800">Admas University</h3><p className="text-gray-500">Academic Transcript</p></div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Student Name</p><p className="font-semibold">{student.fullName}</p></div>
            <div><p className="text-sm text-gray-500">Student ID</p><p className="font-semibold">{student.studentId}</p></div>
            <div><p className="text-sm text-gray-500">Department</p><p className="font-semibold">{student.department}</p></div>
            <div><p className="text-sm text-gray-500">Faculty</p><p className="font-semibold">{student.faculty}</p></div>
            <div><p className="text-sm text-gray-500">Overall CGPA</p><p className="font-semibold text-indigo-600">{transcript.overallCGPA?.toFixed(2)}</p></div>
            <div><p className="text-sm text-gray-500">Total Credits</p><p className="font-semibold">{transcript.totalCreditsEarned}</p></div>
          </div>
          {transcript.semesterGrades?.map((semester: any, idx: number) => (
            <div key={idx} className="mb-6"><h4 className="font-semibold text-gray-800 mb-3">{semester.semester} - GPA: {semester.semesterGPA?.toFixed(2)}</h4><table className="w-full border"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course Code</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course Name</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Credits</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Grade</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500">GPA</th></tr></thead><tbody>{semester.courses?.map((course: any, cidx: number) => (<tr key={cidx} className="border-t"><td className="px-4 py-2 text-sm">{course.courseCode}</td><td className="px-4 py-2 text-sm">{course.courseName}</td><td className="px-4 py-2 text-sm text-center">{course.credits}</td><td className="px-4 py-2 text-sm text-center"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.gradeLetter === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{course.gradeLetter}</span></td><td className="px-4 py-2 text-sm text-center">{course.gradePoint?.toFixed(2)}</td></tr>))}</tbody></table></div>
          ))}
        </div>
        <div className="flex justify-end p-6 border-t"><button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Close</button></div>
      </div>
    </div>
  );
};

export default StudentTranscriptModal;