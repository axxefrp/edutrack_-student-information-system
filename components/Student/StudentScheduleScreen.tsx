
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Teacher } from '../../types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const MOCK_PERIODS = ['Period 1 (9:00 AM)', 'Period 2 (10:00 AM)', 'Period 3 (11:00 AM)', 'Period 4 (1:00 PM)', 'Period 5 (2:00 PM)'];

interface ScheduleSlot {
  classId?: string;
  className?: string;
  teacherName?: string;
}

const StudentScheduleScreen: React.FC = () => {
  const context = useContext(AppContext);

  if (!context || !context.currentUser || !context.currentUser.studentId) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-700">
        Loading student data or not authorized...
      </div>
    );
  }

  const { currentUser, schoolClasses, teachers } = context;
  const studentId = currentUser.studentId;

  const enrolledClasses = useMemo(() => {
    return schoolClasses.filter(sc => sc.studentIds.includes(studentId));
  }, [schoolClasses, studentId]);

  const scheduleGrid: ScheduleSlot[][] = useMemo(() => {
    const grid: ScheduleSlot[][] = Array(MOCK_PERIODS.length)
      .fill(null)
      .map(() => Array(DAYS_OF_WEEK.length).fill({}));

    let classIndex = 0;
    for (let dayIndex = 0; dayIndex < DAYS_OF_WEEK.length; dayIndex++) {
      for (let periodIndex = 0; periodIndex < MOCK_PERIODS.length; periodIndex++) {
        if (classIndex < enrolledClasses.length) {
          const currentClass = enrolledClasses[classIndex % enrolledClasses.length]; // Cycle through classes if more slots than classes
          const teacher = teachers.find(t => t.id === currentClass.teacherId);
          
          // Basic distribution: try to fill slots, avoid putting same class back-to-back on same day if possible
          // This is a very naive distribution. A real system would have complex scheduling logic.
          // For mock, just fill them. If we want variety, we can make this more complex or pre-define mock slots.
          grid[periodIndex][dayIndex] = {
            classId: currentClass.id,
            className: currentClass.name,
            teacherName: teacher ? teacher.name : 'N/A',
          };
          classIndex++; // Move to next class for next slot, simplistic distribution
        } else {
          // If all classes are scheduled at least once, subsequent slots remain empty or could be 'Free Period'
          grid[periodIndex][dayIndex] = {}; // Empty slot
        }
      }
    }
    // Simple shuffle to make it look a bit more "random" - very basic for mock
    // This is just to avoid the same class in all slots if few classes
    if (enrolledClasses.length > 0 && enrolledClasses.length < MOCK_PERIODS.length * DAYS_OF_WEEK.length) {
        let flatSlots: ScheduleSlot[] = [];
        enrolledClasses.forEach(ec => {
            const teacher = teachers.find(t => t.id === ec.teacherId);
            flatSlots.push({
                 classId: ec.id,
                 className: ec.name,
                 teacherName: teacher ? teacher.name : 'N/A',
            });
        });
        // Fill remaining slots with empty or "Free Period"
        const totalSlots = MOCK_PERIODS.length * DAYS_OF_WEEK.length;
        while(flatSlots.length < totalSlots) {
            flatSlots.push({}); // Empty
        }
        // Shuffle the flat list of slots (Fisher-Yates shuffle)
        for (let i = flatSlots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flatSlots[i], flatSlots[j]] = [flatSlots[j], flatSlots[i]];
        }
        // Reconstruct the grid
        let k = 0;
        for (let p = 0; p < MOCK_PERIODS.length; p++) {
            for (let d = 0; d < DAYS_OF_WEEK.length; d++) {
                grid[p][d] = flatSlots[k++];
            }
        }
    }


    return grid;
  }, [enrolledClasses, teachers]);

  if (enrolledClasses.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Weekly Schedule</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25M3 18.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008Z" />
            </svg>
          <p className="text-xl text-gray-600">You are not currently enrolled in any classes.</p>
          <p className="text-sm text-gray-400 mt-2">Your schedule will appear here once you are assigned to classes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Weekly Schedule</h1>
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider border-r border-gray-200 w-1/6">
                Period
              </th>
              {DAYS_OF_WEEK.map(day => (
                <th
                  key={day}
                  className="px-3 py-3 text-center text-xs font-semibold text-primary-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0 w-1/5"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_PERIODS.map((period, periodIndex) => (
              <tr key={period} className="divide-x divide-gray-200">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-200 align-top h-24">
                  {period}
                </td>
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const slot = scheduleGrid[periodIndex]?.[dayIndex];
                  return (
                    <td key={`${day}-${period}`} className="px-3 py-3 text-sm text-gray-700 align-top h-24">
                      {slot && slot.className ? (
                        <div className="bg-secondary-50 p-2 rounded-md h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                          <div>
                            <p className="font-semibold text-secondary-700 truncate" title={slot.className}>{slot.className}</p>
                            <p className="text-xs text-gray-500 truncate" title={slot.teacherName}>
                                {slot.teacherName}
                            </p>
                          </div>
                           {/* Add mock room number or other details if needed later */}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs italic h-full flex items-center justify-center">
                          Free Period
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <p className="text-xs text-center text-gray-500 mt-4">
        * This is a mock schedule for demonstration purposes. Actual class times and teachers may vary.
      </p>
    </div>
  );
};

export default StudentScheduleScreen;
