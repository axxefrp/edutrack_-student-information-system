
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { Student as StudentType, PointTransaction, Grade } from '../../types'; 

type SortableGradeKey = 'subjectOrAssignmentName' | 'score' | 'maxScore' | 'dateAssigned' | 'className';
type SortDirection = 'ascending' | 'descending';

interface GradeSortConfig {
  key: SortableGradeKey;
  direction: SortDirection;
}

interface StudentProfilePageProps {
  studentId: string;
  section?: 'profile' | 'points' | 'grades' | 'attendance';
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ studentId, section = 'profile' }) => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'profile' | 'points' | 'grades' | 'attendance'>(section);
  const [gradeSortConfig, setGradeSortConfig] = useState<GradeSortConfig | null>({ key: 'dateAssigned', direction: 'descending' });

  if (!context) return null;

  const student = context.students.find(s => s.id === studentId);
  const pointsHistory = context.pointTransactions.filter(pt => pt.studentId === studentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const getClassName = (classId: string): string => {
    const sc = context.schoolClasses.find(c => c.id === classId);
    return sc ? sc.name : 'N/A';
  };
  
  const sortedStudentGrades = useMemo(() => {
    let mappedGrades = context.grades
      .filter(g => g.studentId === studentId)
      .map(grade => ({
        ...grade,
        className: getClassName(grade.classId),
      }));

    if (gradeSortConfig !== null) {
      mappedGrades.sort((a, b) => {
        let aValue = a[gradeSortConfig.key];
        let bValue = b[gradeSortConfig.key];

        // Handle numeric conversion for 'score' and 'maxScore'
        if (gradeSortConfig.key === 'score') {
            // For scores that might be letter grades or numeric
            const numA = parseFloat(aValue as string);
            const numB = parseFloat(bValue as string);
            const isANumeric = !isNaN(numA);
            const isBNumeric = !isNaN(numB);

            if (isANumeric && isBNumeric) {
                aValue = numA;
                bValue = numB;
            } else if (isANumeric && !isBNumeric) { // numbers before strings
                return -1; 
            } else if (!isANumeric && isBNumeric) { // strings after numbers
                return 1;
            } else { // both are strings (letter grades)
                // Default to string comparison
            }
        } else if (gradeSortConfig.key === 'maxScore') {
          const numA = parseFloat(aValue as string);
          const numB = parseFloat(bValue as string);
          // Treat non-numeric or empty maxScore as potentially lower or higher based on sort direction
          aValue = isNaN(numA) ? (gradeSortConfig.direction === 'ascending' ? Infinity : -Infinity) : numA;
          bValue = isNaN(numB) ? (gradeSortConfig.direction === 'ascending' ? Infinity : -Infinity) : numB;
        } else if (gradeSortConfig.key === 'dateAssigned') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
        }


        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return gradeSortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        // Fallback to string comparison if types are mixed or both are strings
        const stringA = String(aValue).toLowerCase();
        const stringB = String(bValue).toLowerCase();
        return gradeSortConfig.direction === 'ascending' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
      });
    }
    return mappedGrades;
  }, [context.grades, studentId, gradeSortConfig, context.schoolClasses]);


  const requestGradeSort = (key: SortableGradeKey) => {
    let direction: SortDirection = 'ascending';
    if (gradeSortConfig && gradeSortConfig.key === key && gradeSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setGradeSortConfig({ key, direction });
  };

  const getGradeSortIndicator = (key: SortableGradeKey) => {
    if (!gradeSortConfig || gradeSortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return gradeSortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };


  if (!student) {
    return <div className="p-6 text-center text-red-600">Student data not found.</div>;
  }
  
  const TabButton: React.FC<{tabName: 'profile' | 'points' | 'grades' | 'attendance', label: string}> = ({tabName, label}) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-primary-100 hover:text-primary-600'}`}
    >
        {label}
    </button>
  );
  
  const GradeSortableHeader: React.FC<{ sortKey: SortableGradeKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
    <th 
        scope="col" 
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
        onClick={() => requestGradeSort(sortKey)}
        title={`Sort by ${label}`}
        aria-sort={gradeSortConfig?.key === sortKey ? (gradeSortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
        <div className="flex items-center">
            {label}
            {getGradeSortIndicator(sortKey)}
        </div>
    </th>
  );


  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <img 
            src={`https://picsum.photos/seed/${student.id}/150/150`} // Placeholder image
            alt={student.name}
            className="w-32 h-32 rounded-full object-cover mr-0 md:mr-8 mb-4 md:mb-0 border-4 border-primary-300"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-gray-600 text-lg">Grade: {student.grade}</p>
            <p className="text-secondary-600 font-semibold text-xl mt-1">Total Points: {student.points}</p>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-2 -mb-px">
                <TabButton tabName="profile" label="Profile Overview" />
                <TabButton tabName="points" label="Points History" />
                <TabButton tabName="grades" label="Grades" />
                <TabButton tabName="attendance" label="Attendance" />
            </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Basic Information</h2>
            <p><strong>ID:</strong> {student.id}</p>
            {/* More profile details can be added here */}
            <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Summary</h2>
            <p className="text-gray-600">This section provides a general overview of {student.name}'s profile, including basic information and key metrics. Detailed records for points, grades, and attendance can be found in their respective tabs.</p>
          </div>
        )}

        {activeTab === 'points' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Points History ({pointsHistory.length})</h2>
            {pointsHistory.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {pointsHistory.map((pt: PointTransaction) => (
                  <li key={pt.id} className="p-4 bg-green-50 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-700">{pt.reason}</p>
                      <p className="text-xs text-gray-500">Awarded on: {new Date(pt.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xl font-bold text-green-600">+{pt.points}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No points awarded yet.</p>
            )}
          </div>
        )}
        
        {activeTab === 'grades' && (
             <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Grades ({sortedStudentGrades.length})</h2>
                 {sortedStudentGrades.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <GradeSortableHeader sortKey="subjectOrAssignmentName" label="Subject/Assignment" />
                                <GradeSortableHeader sortKey="score" label="Score" />
                                <GradeSortableHeader sortKey="maxScore" label="Max Score" />
                                <GradeSortableHeader sortKey="dateAssigned" label="Date Assigned" />
                                <GradeSortableHeader sortKey="className" label="Class" />
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStudentGrades.map((grade: Grade & { className: string }) => {
                            return (
                                <tr key={grade.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.subjectOrAssignmentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{grade.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.maxScore || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(grade.dateAssigned).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.className}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">{grade.teacherComments || '-'}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
                ) : (
                <p className="text-gray-500">No grades recorded yet.</p>
                )}
            </div>
        )}
        {activeTab === 'attendance' && (
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Attendance Record</h2>
                {student.attendance.length > 0 ? (
                     <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {student.attendance.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((att, idx) => (
                            <li key={idx} className={`p-3 rounded-md flex justify-between items-center ${att.status === 'present' ? 'bg-green-100 text-green-800' : att.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                <span>{new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="font-semibold capitalize">{att.status}</span>
                            </li>
                        ))}
                     </ul>
                ): (
                    <p className="text-gray-500">No attendance records found.</p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default StudentProfilePage;
