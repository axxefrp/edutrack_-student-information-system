import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../App';
import { Student } from '../../types';

type SortableLeaderboardKey = 'name' | 'grade' | 'points';
type SortDirection = 'ascending' | 'descending';

interface LeaderboardSortConfig {
  key: SortableLeaderboardKey;
  direction: SortDirection;
}

const StudentLeaderboardScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [sortConfig, setSortConfig] = useState<LeaderboardSortConfig | null>({ key: 'points', direction: 'descending' });

  if (!context || !context.currentUser || !context.currentUser.studentId) {
    return <div className="p-6 text-gray-700">Loading student data or not authorized...</div>;
  }
  const { students, currentUser } = context;
  const currentStudentId = currentUser.studentId;

  const leaderboardData = useMemo(() => {
    let sortableStudents = [...students];

    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableStudents.map((student, index) => ({
      ...student,
      rank: index + 1, 
    }));
  }, [students, sortConfig]);

  const requestSort = (key: SortableLeaderboardKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
        if (key === 'points') direction = 'descending'; 
        else direction = 'ascending'; 
    }
    
    if (!sortConfig || sortConfig.key !== key) {
        if (key === 'points') direction = 'descending';
        else direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortableLeaderboardKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>; 
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };
  
  const SortableHeader: React.FC<{ sortKey: SortableLeaderboardKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
    <th 
        scope="col" 
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
        onClick={() => requestSort(sortKey)}
        title={`Sort by ${label}`}
        aria-sort={sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
        <div className="flex items-center">
            {label}
            {getSortIndicator(sortKey)}
        </div>
    </th>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">School Leaderboard</h1>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <SortableHeader sortKey="name" label="Student Name" />
              <SortableHeader sortKey="grade" label="Grade" />
              <SortableHeader sortKey="points" label="Points" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardData.map((student) => (
              <tr 
                key={student.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  student.id === currentStudentId ? 'bg-primary-100 font-semibold' : ''
                } ${
                  (sortConfig?.key === 'points' && sortConfig.direction === 'descending') ? 
                  (student.rank === 1 && student.id !== currentStudentId ? 'bg-yellow-100' : 
                   student.rank === 1 && student.id === currentStudentId ? 'bg-yellow-200 font-bold' :
                   student.rank === 2 && student.id !== currentStudentId ? 'bg-gray-200' :
                   student.rank === 2 && student.id === currentStudentId ? 'bg-gray-300 font-semibold' :
                   student.rank === 3 && student.id !== currentStudentId ? 'bg-orange-100' : 
                   student.rank === 3 && student.id === currentStudentId ? 'bg-orange-200 font-semibold' : '')
                  : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {sortConfig?.key === 'points' && sortConfig.direction === 'descending' ? student.rank : '-'}
                  {student.id === currentStudentId && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${student.id === currentStudentId ? 'text-primary-700' : 'text-gray-900'}`}>{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${student.id === currentStudentId ? 'text-primary-700' : 'text-green-600'}`}>{student.points}</td>
              </tr>
            ))}
            {leaderboardData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No students found to display on the leaderboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        Leaderboard is based on total points. Click column headers to sort. Your position is highlighted.
      </p>
    </div>
  );
};

export default StudentLeaderboardScreen;