import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { Teacher, UserRole, User as UserType, SchoolClass } from '../../types'; 
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortableTeacherKey = 'name' | 'subject';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableTeacherKey;
  direction: SortDirection;
}

const AdminTeacherManagement: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [assignedClassesToEditingTeacher, setAssignedClassesToEditingTeacher] = useState<SchoolClass[]>([]);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [userSelectError, setUserSelectError] = useState('');

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [uniqueSubjectsForFilter, setUniqueSubjectsForFilter] = useState<string[]>([]);


  useEffect(() => {
    if (context && context.users) {
        const linkedUserIds = context.teachers.map(t => t.userId);
        const unlinkedPotentialTeacherUsers = context.users.filter(
            user => user.role === UserRole.TEACHER && !linkedUserIds.includes(user.uid)
        );
        setAvailableUsers(unlinkedPotentialTeacherUsers);
        if (!editingTeacher && unlinkedPotentialTeacherUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(unlinkedPotentialTeacherUsers[0].uid);
        }

        if (editingTeacher) {
            const classesForTeacher = context.schoolClasses.filter(sc => sc.teacherId === editingTeacher.id);
            setAssignedClassesToEditingTeacher(classesForTeacher);
        } else {
            setAssignedClassesToEditingTeacher([]);
        }
        
        const distinctSubjects = Array.from(new Set(context.teachers.map(t => t.subject))).sort();
        setUniqueSubjectsForFilter(distinctSubjects);
    }
  }, [context, editingTeacher, selectedUserId]);


  if (!context) return null;

  const { teachers, addTeacher, updateTeacher, deleteTeacher, schoolClasses, subjects: allSubjects } = context;

  const getSubjectName = (subjectId?: string | null): string => {
    if (!subjectId) return 'N/A';
    const subject = allSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const sortedAndFilteredTeachers = useMemo(() => {
    let processableTeachers = [...teachers];

    // Apply filter
    if (filterSubject) {
      processableTeachers = processableTeachers.filter(teacher => teacher.subject === filterSubject);
    }

    // Apply sort
    if (sortConfig !== null) {
      processableTeachers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processableTeachers;
  }, [teachers, sortConfig, filterSubject]);

  const requestSort = (key: SortableTeacherKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableTeacherKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>; 
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError('');
    setSubjectError('');
    setUserSelectError('');

    if (!teacherName.trim()) {
      setNameError('Teacher name is required.');
      isValid = false;
    }
    if (!teacherSubject.trim()) {
      setSubjectError('Subject (Primary Specialization) is required.');
      isValid = false;
    }
    if (!editingTeacher && availableUsers.length > 0 && !selectedUserId) {
      setUserSelectError('Please select a user account to link.');
      isValid = false;
    }
    return isValid;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      if (editingTeacher) {
        updateTeacher({...editingTeacher, name: teacherName, subject: teacherSubject });
      } else {
        let newTeacherUserId = selectedUserId;
        if (!newTeacherUserId) { 
            const tempUsername = teacherName.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-3);
            newTeacherUserId = `user_mock_${tempUsername}`; 
            console.warn(`Mock creating teacher linked to a generated mock user ID: ${newTeacherUserId}. In a real system, a User account must exist or be created first.`);
        }
        addTeacher(teacherName, teacherSubject, newTeacherUserId);
      }
      setIsSubmitting(false);
      closeModalAndResetForm();
    }, 1000); 
  };

  const resetFormFieldsAndErrors = () => {
    setTeacherName('');
    setTeacherSubject('');
    setSelectedUserId(availableUsers.length > 0 ? availableUsers[0].uid : ''); 
    setNameError('');
    setSubjectError('');
    setUserSelectError('');
    setAssignedClassesToEditingTeacher([]);
  };
  
  const openAddModal = () => {
    setEditingTeacher(null);
    resetFormFieldsAndErrors();
    if (availableUsers.length > 0) {
        setSelectedUserId(availableUsers[0].uid);
    } else {
        setSelectedUserId(''); 
    }
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
    setTeacherSubject(teacher.subject);
    setSelectedUserId(teacher.userId); 
    setNameError('');
    setSubjectError('');
    setUserSelectError('');
    const classesForTeacher = schoolClasses.filter(sc => sc.teacherId === teacher.id);
    setAssignedClassesToEditingTeacher(classesForTeacher);
    setIsModalOpen(true);
  };

  const closeModalAndResetForm = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    resetFormFieldsAndErrors();
  };

  const handleDeleteTeacher = (teacherToDelete: Teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacherToDelete.name}? They will be unassigned from any classes.`)) {
      setDeletingTeacherId(teacherToDelete.id);
      setTimeout(() => {
        deleteTeacher(teacherToDelete.id);
        setDeletingTeacherId(null);
      }, 1000); 
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortableTeacherKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Teachers</h1>
        <Button onClick={openAddModal} variant="primary" className="w-full sm:w-auto">Add New Teacher</Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto">
            <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700">Filter by Subject:</label>
            <select
                id="subject-filter"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="mt-1 block w-full sm:w-56 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
            >
                <option value="">All Subjects</option>
                {uniqueSubjectsForFilter.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                ))}
            </select>
        </div>
      </div>


      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <SortableHeader sortKey="name" label="Name" />
                <SortableHeader sortKey="subject" label="Primary Specialization" />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                        onClick={() => openEditModal(teacher)} 
                        variant="secondary" 
                        size="sm" 
                        className="mr-2"
                        disabled={deletingTeacherId === teacher.id}
                    >
                        Edit
                    </Button>
                    <Button 
                        onClick={() => handleDeleteTeacher(teacher)} 
                        variant="danger" 
                        size="sm"
                        loading={deletingTeacherId === teacher.id}
                    >
                        Delete
                    </Button>
                    </td>
                </tr>
                ))}
                {sortedAndFilteredTeachers.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                            {filterSubject ? `No teachers found for subject "${filterSubject}".` : "No teachers found. Add a new teacher to get started."}
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModalAndResetForm} title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Teacher Name"
            type="text"
            value={teacherName}
            onChange={(e) => { setTeacherName(e.target.value); if(nameError) setNameError(''); }}
            placeholder="Enter teacher's full name"
            required
            disabled={isSubmitting}
            error={nameError}
          />
          <Input
            label="Primary Specialization"
            type="text"
            value={teacherSubject}
            onChange={(e) => { setTeacherSubject(e.target.value); if(subjectError) setSubjectError(''); }}
            placeholder="e.g., Mathematics, History"
            required
            disabled={isSubmitting}
            error={subjectError}
          />
          {!editingTeacher && (
             availableUsers.length > 0 ? (
                <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">Link to User Account</label>
                    <select 
                        id="user-select"
                        value={selectedUserId}
                        onChange={(e) => { setSelectedUserId(e.target.value); if(userSelectError) setUserSelectError(''); }}
                        className={`mt-1 block w-full px-4 py-3 border ${userSelectError ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                        required
                        disabled={isSubmitting}
                    >
                        <option value="" disabled>Select an existing user</option>
                        {availableUsers.map(user => (
                            <option key={user.uid} value={user.uid}>{user.username} (ID: {user.uid})</option>
                        ))}
                    </select>
                    {userSelectError && <p className="mt-1 text-xs text-red-600">{userSelectError}</p>}
                </div>
             ) : (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                    No unlinked 'Teacher' user accounts available. Please register a new user with the 'Teacher' role first.
                </p>
             )
          )}
           {editingTeacher && (
             <div>
                <p className="text-sm text-gray-600">User Account: {editingTeacher.userId} (Cannot be changed here)</p>
            </div>
           )}

            {editingTeacher && assignedClassesToEditingTeacher.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Assigned Classes:</h4>
                    <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                        {assignedClassesToEditingTeacher.map(sc => (
                            <li key={sc.id} className="text-sm text-gray-600">
                                {sc.name} <span className="text-xs text-gray-500">({getSubjectName(sc.subjectId)})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {editingTeacher && assignedClassesToEditingTeacher.length === 0 && (
                 <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 italic">No classes currently assigned to this teacher.</p>
                </div>
            )}


          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" onClick={closeModalAndResetForm} variant="ghost" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {editingTeacher ? "Save Changes" : "Add Teacher"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTeacherManagement;