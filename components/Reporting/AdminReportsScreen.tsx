
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { Student, Grade } from '../../types'; // Grade might not be directly used here but good for consistency
import PlaceholderContent from '../Shared/PlaceholderContent';

type AdminReportType = '' | 'studentAttendanceSummary' | 'overallGradeDistribution' | 'teacherLoadReport';

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  grade: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalDaysRecorded: number;
  attendancePercentage: number;
}

const AdminReportsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedReport, setSelectedReport] = useState<AdminReportType>('');

  if (!context) return <PlaceholderContent title="Loading Report Data..." />;

  const { students } = context;

  const studentAttendanceSummaryData = useMemo((): AttendanceSummary[] => {
    if (selectedReport !== 'studentAttendanceSummary') return [];
    return students.map(student => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      student.attendance.forEach(att => {
        if (att.status === 'present') totalPresent++;
        else if (att.status === 'absent') totalAbsent++;
        else if (att.status === 'late') totalLate++;
      });
      const totalDaysRecorded = totalPresent + totalAbsent + totalLate;
      const attendancePercentage = totalDaysRecorded > 0 ? ((totalPresent + totalLate * 0.5) / totalDaysRecorded) * 100 : 0; // Late counts as half present for percentage
      return {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        totalPresent,
        totalAbsent,
        totalLate,
        totalDaysRecorded,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
      };
    }).sort((a,b) => a.studentName.localeCompare(b.studentName));
  }, [students, selectedReport]);

  const overallSchoolAttendance = useMemo(() => {
    if (selectedReport !== 'studentAttendanceSummary' || studentAttendanceSummaryData.length === 0) return 0;
    const totalPercentageSum = studentAttendanceSummaryData.reduce((sum, item) => sum + item.attendancePercentage, 0);
    return parseFloat((totalPercentageSum / studentAttendanceSummaryData.length).toFixed(1));
  }, [studentAttendanceSummaryData, selectedReport]);


  const reportOptions: { value: AdminReportType; label: string }[] = [
    { value: '', label: 'Select a Report' },
    { value: 'studentAttendanceSummary', label: 'Student Attendance Summary' },
    { value: 'overallGradeDistribution', label: 'Overall Grade Distribution (Placeholder)' },
    { value: 'teacherLoadReport', label: 'Teacher Load Report (Placeholder)' },
  ];

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'studentAttendanceSummary':
        return (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Student Attendance Summary</h3>
            {studentAttendanceSummaryData.length === 0 ? (
              <p className="text-gray-500">No attendance data available for students.</p>
            ) : (
              <>
                <div className="mb-4 text-right">
                    <p className="text-md font-semibold text-gray-700">Overall School Attendance: 
                        <span className={`ml-2 ${overallSchoolAttendance >= 80 ? 'text-green-600' : overallSchoolAttendance >=60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {overallSchoolAttendance}%
                        </span>
                    </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentAttendanceSummaryData.map(summary => (
                        <tr key={summary.studentId}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{summary.studentName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{summary.grade}</td>
                          <td className="px-4 py-2 text-center whitespace-nowrap text-sm text-green-600 font-semibold">{summary.totalPresent}</td>
                          <td className="px-4 py-2 text-center whitespace-nowrap text-sm text-red-600 font-semibold">{summary.totalAbsent}</td>
                          <td className="px-4 py-2 text-center whitespace-nowrap text-sm text-yellow-600 font-semibold">{summary.totalLate}</td>
                          <td className="px-4 py-2 text-center whitespace-nowrap text-sm font-semibold">{summary.attendancePercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      case 'overallGradeDistribution':
      case 'teacherLoadReport':
        return <PlaceholderContent title={reportOptions.find(opt => opt.value === selectedReport)?.label || 'Report'} message="This report is not yet implemented." />;
      default:
        return <p className="mt-6 text-gray-500">Please select a report type from the dropdown to view data.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Reports</h1>
      
      <div className="mb-6 max-w-md">
        <label htmlFor="report-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Report:
        </label>
        <select
          id="report-select"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value as AdminReportType)}
          className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          {reportOptions.map(option => (
            <option key={option.value} value={option.value} disabled={option.value === ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {renderSelectedReport()}
    </div>
  );
};

export default AdminReportsScreen;
