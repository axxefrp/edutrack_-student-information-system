import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { User, UserRole, Student } from '../../types';
import Button from '../Shared/Button';

type SortableParentKey = 'parentUsername' | 'studentName' | 'studentGrade';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableParentKey;
  direction: SortDirection;
}

const AdminParentManagement: React.FC = () => {
  const context = useContext(AppContext);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'parentUsername', direction: 'ascending' });

  if (!context) return null;

  const { users, students, deleteParentUser } = context;

  const getStudentName = (studentId?: string): string => {
    if (!studentId) return 'N/A';
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentGrade = (studentId?: string): number | string => {
    if (!studentId) return 'N/A';
    const student = students.find(s => s.id === studentId);
    return student ? student.grade : 'N/A';
  };

  const sortedParentUsers = useMemo(() => {
    let mappedParents = users
      .filter(user => user.role === UserRole.PARENT)
      .map(parentUser => ({
        ...parentUser,
        parentUsername: parentUser.username,
        studentName: getStudentName(parentUser.studentId),
        studentGrade: getStudentGrade(parentUser.studentId),
      }));

    if (sortConfig !== null) {
      mappedParents.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'studentGrade') {
          const gradeA = typeof aValue === 'number' ? aValue : Infinity; // Treat 'N/A' or non-numbers as last
          const gradeB = typeof bValue === 'number' ? bValue : Infinity;
          return sortConfig.direction === 'ascending' ? gradeA - gradeB : gradeB - gradeA;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return mappedParents;
  }, [users, students, sortConfig]);

  const requestSort = (key: SortableParentKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableParentKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };

  const handleDeleteParent = (parentUser: User) => {
    const studentNameForAlert = getStudentName(parentUser.studentId);
    if (window.confirm(`Are you sure you want to delete parent account "${parentUser.username}"? This will unlink them from student "${studentNameForAlert}".`)) {
      deleteParentUser(parentUser.uid);
    }
  };

  const SortableHeader: React.FC<{ sortKey: SortableParentKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
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
        <h1 className="text-2xl font-semibold text-gray-800">Manage Parent Accounts</h1>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="parentUsername" label="Parent Username" />
              <SortableHeader sortKey="studentName" label="Linked Student Name" />
              <SortableHeader sortKey="studentGrade" label="Student Grade" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedParentUsers.map((parentUser) => (
              <tr key={parentUser.uid} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parentUser.parentUsername}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parentUser.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parentUser.studentGrade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button onClick={() => handleDeleteParent(parentUser)} variant="danger" size="sm">Delete</Button>
                </td>
              </tr>
            ))}
            {sortedParentUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No parent accounts found. Parents can register via the registration page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminParentManagement;