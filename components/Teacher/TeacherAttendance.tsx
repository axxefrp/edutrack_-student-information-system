
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { Student } from '../../types';
import Button from '../Shared/Button';

const TeacherAttendance: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (context) {
      const initialStatuses: Record<string, 'present' | 'absent' | 'late'> = {};
      context.students.forEach(student => {
        const todaysAttendance = student.attendance.find(att => att.date === selectedDate);
        initialStatuses[student.id] = todaysAttendance ? todaysAttendance.status : 'present'; // Default to present if no record
      });
      setAttendanceStatuses(initialStatuses);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, context?.students]);


  if (!context) return null;
  const { students, markAttendance } = context;

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const newStatuses: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach(student => {
        newStatuses[student.id] = 'present';
    });
    setAttendanceStatuses(newStatuses);
  };

  const handleSubmitAttendance = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      Object.entries(attendanceStatuses).forEach(([studentId, status]) => {
        markAttendance(studentId, selectedDate, status);
      });
      setIsSubmitting(false);
      context.addNotificationDirectly("Attendance Submitted", `Attendance for ${selectedDate} has been successfully recorded.`, "success");
    }, 1000); // Simulate API call
  };
  
  const getButtonClass = (currentStatus: 'present' | 'absent' | 'late', buttonStatus: 'present' | 'absent' | 'late') => {
    if (currentStatus === buttonStatus) {
      if (buttonStatus === 'present') return 'bg-green-500 hover:bg-green-600 text-white';
      if (buttonStatus === 'absent') return 'bg-red-500 hover:bg-red-600 text-white';
      if (buttonStatus === 'late') return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Mark Attendance</h1>
        <div className="flex items-center gap-2">
            <label htmlFor="attendance-date" className="text-sm font-medium text-gray-700">Date:</label>
            <input 
                type="date" 
                id="attendance-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
            />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex justify-center space-x-2">
                    <Button 
                        size="sm" 
                        className={`w-20 ${getButtonClass(attendanceStatuses[student.id], 'present')}`}
                        onClick={() => handleStatusChange(student.id, 'present')}
                        disabled={isSubmitting}>Present</Button>
                    <Button 
                        size="sm" 
                        className={`w-20 ${getButtonClass(attendanceStatuses[student.id], 'absent')}`}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        disabled={isSubmitting}>Absent</Button>
                    <Button 
                        size="sm" 
                        className={`w-20 ${getButtonClass(attendanceStatuses[student.id], 'late')}`}
                        onClick={() => handleStatusChange(student.id, 'late')}
                        disabled={isSubmitting}>Late</Button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        No students available to mark attendance.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {students.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-3">
            <Button 
                onClick={handleMarkAllPresent} 
                variant="secondary" 
                size="md"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
            >
                Mark All Present
            </Button>
            <Button 
                onClick={handleSubmitAttendance} 
                variant="primary" 
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
            >
                Submit All Attendance
            </Button>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
