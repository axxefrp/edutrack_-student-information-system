import React, { useContext, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { Teacher, UserRole, User as UserType, SchoolClass } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortableTeacherKey = 'name';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableTeacherKey;
  direction: SortDirection;
}

const AdminTeacherManagement: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
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
  const [filterSubjectId, setFilterSubjectId] = useState<string>('');


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
            const classesForTeacher = context.schoolClasses.filter(sc => sc.teacherIds.includes(editingTeacher.id));
            setAssignedClassesToEditingTeacher(classesForTeacher);
        } else {
            setAssignedClassesToEditingTeacher([]);
        }
        
        // No longer needed: uniqueSubjectsForFilter
    }
  }, [context, editingTeacher, selectedUserId]);


  if (!context) return null;

  const { teachers, addTeacher, updateTeacher, deleteTeacher, schoolClasses, subjects: allSubjects, users, addNotificationDirectly } = context;

  // Monitor subject loading for debugging
  useEffect(() => {
    console.log('🔧 AdminTeacherManagement: Subjects updated:', allSubjects.length);
    if (allSubjects.length === 0) {
      console.warn('🔧 No subjects loaded yet. This may prevent teacher registration.');
    } else {
      console.log('🔧 Available subjects:', allSubjects.map(s => s.name));
    }
  }, [allSubjects]);

  const getSubjectNames = (subjectIds?: string[]): string => {
    if (!subjectIds || subjectIds.length === 0) return 'N/A';
    return subjectIds.map(id => {
      const subject = allSubjects.find(s => s.id === id);
      return subject ? subject.name : 'Unknown Subject';
    }).join(', ');
  };

  const sortedAndFilteredTeachers = useMemo(() => {
    let processableTeachers = [...teachers];
    // Apply filter
    if (filterSubjectId) {
      processableTeachers = processableTeachers.filter(teacher => teacher.subjectIds && teacher.subjectIds.includes(filterSubjectId));
    }
    // Only sort by name
    if (sortConfig !== null) {
      processableTeachers.sort((a, b) => {
        const aValue = a.name;
        const bValue = b.name;
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
  }, [teachers, sortConfig, filterSubjectId]);

  const requestSort = useCallback((key: SortableTeacherKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const getSortIndicator = useCallback((key: SortableTeacherKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  }, [sortConfig]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    setNameError('');
    setSubjectError('');
    setUserSelectError('');

    if (!teacherName.trim()) {
      setNameError('Teacher name is required.');
      isValid = false;
    }
    // Allow registration without subjects if no subjects are available
    if (allSubjects.length > 0 && (!selectedSubjectIds || selectedSubjectIds.length === 0)) {
      setSubjectError('At least one subject is required when subjects are available.');
      isValid = false;
    } else if (allSubjects.length === 0 && (!selectedSubjectIds || selectedSubjectIds.length === 0)) {
      console.log('🔧 Allowing teacher registration without subjects (no subjects available)');
      // This is allowed - teacher can select subjects later in settings
    }
    if (!editingTeacher && availableUsers.length > 0 && !selectedUserId) {
      setUserSelectError('Please select a user account to link.');
      isValid = false;
    }
    return isValid;
  }, [teacherName, selectedSubjectIds, editingTeacher, availableUsers.length, selectedUserId]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log('🔧 Form submission debug:');
    console.log('- Teacher name:', teacherName);
    console.log('- Selected subject IDs:', selectedSubjectIds);
    console.log('- Available subjects:', allSubjects.length);
    console.log('- Selected user ID:', selectedUserId);

    if (!validateForm()) {
      console.log('🔧 Form validation failed');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (editingTeacher) {
        console.log('🔧 Updating teacher with subjects:', selectedSubjectIds);
        updateTeacher({ ...editingTeacher, name: teacherName, subjectIds: selectedSubjectIds });
      } else {
        let newTeacherUserId = selectedUserId;
        if (!newTeacherUserId) {
            const tempUsername = teacherName.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-3);
            newTeacherUserId = `user_mock_${tempUsername}`;
            console.warn(`Mock creating teacher linked to a generated mock user ID: ${newTeacherUserId}. In a real system, a User account must exist or be created first.`);
        }
        console.log('🔧 Adding new teacher with subjects:', selectedSubjectIds);
        if (selectedSubjectIds.length === 0) {
          console.log('🔧 Teacher registered without subjects - they can add subjects later in Settings');
        }
        addTeacher(teacherName, selectedSubjectIds, newTeacherUserId);
      }
      setIsSubmitting(false);
      closeModalAndResetForm();
    }, 1000);
  };

  const resetFormFieldsAndErrors = useCallback(() => {
    setTeacherName('');
    setSelectedSubjectIds([]);
    setSelectedUserId(availableUsers.length > 0 ? availableUsers[0].uid : '');
    setNameError('');
    setSubjectError('');
    setUserSelectError('');
    setAssignedClassesToEditingTeacher([]);
  }, [availableUsers]);

  const openAddModal = useCallback(() => {
    setEditingTeacher(null);
    resetFormFieldsAndErrors();
    if (availableUsers.length > 0) {
        setSelectedUserId(availableUsers[0].uid);
    } else {
        setSelectedUserId('');
    }
    setIsModalOpen(true);
  }, [resetFormFieldsAndErrors, availableUsers]);

  const openEditModal = useCallback((teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
    setSelectedSubjectIds(teacher.subjectIds || []);
    setSelectedUserId(teacher.userId);
    setNameError('');
    setSubjectError('');
    setUserSelectError('');
    const classesForTeacher = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));
    setAssignedClassesToEditingTeacher(classesForTeacher);
    setIsModalOpen(true);
  }, [schoolClasses]);

  const closeModalAndResetForm = useCallback(() => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    resetFormFieldsAndErrors();
  }, [resetFormFieldsAndErrors]);

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
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="mt-1 block w-full sm:w-56 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
            >
                <option value="">All Subjects</option>
                {allSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📖 Subjects</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🏫 Classes</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredTeachers.map((teacher) => {
                    const assignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));
                    return (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            👨‍🏫 {teacher.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs">
                                {teacher.subjectIds.map(subjectId => {
                                    const subject = allSubjects.find(s => s.id === subjectId);
                                    return subject ? (
                                        <span key={subjectId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                            {subject.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs">
                                {assignedClasses.length > 0 ? (
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">
                                            Teaching {assignedClasses.length} class{assignedClasses.length !== 1 ? 'es' : ''}:
                                        </div>
                                        {assignedClasses.slice(0, 2).map(sc => (
                                            <span key={sc.id} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                                {sc.name}
                                            </span>
                                        ))}
                                        {assignedClasses.length > 2 && (
                                            <span className="text-xs text-gray-500">
                                                +{assignedClasses.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No classes assigned</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                        onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        disabled={deletingTeacherId === teacher.id}
                    >
                        View Profile
                    </Button>
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
                    );
                })}
                {sortedAndFilteredTeachers.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            {filterSubjectId ? `No teachers found for subject "${filterSubjectId}".` : "No teachers found. Add a new teacher to get started."}
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Mobile Card View - Liberian School System */}
      <div className="lg:hidden space-y-4">
        {sortedAndFilteredTeachers.map((teacher) => {
          const assignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));

          return (
            <div key={teacher.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    👨‍🏫 {teacher.name}
                  </h3>
                  <div className="mt-2">
                    <div className="flex items-start text-gray-600 mb-2">
                      <span className="inline-flex items-center text-blue-600 font-medium mr-1 mt-0.5">📖</span>
                      <div>
                        <span className="text-sm font-medium">Subjects:</span>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {getSubjectNames(teacher.subjectIds)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class Assignments for Mobile - Liberian System */}
                  {assignedClasses.length > 0 ? (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🏫 Teaching {assignedClasses.length} Class{assignedClasses.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {assignedClasses.slice(0, 2).map(sc => (
                          <div key={sc.id} className="text-xs bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="font-semibold text-gray-800 mb-1 flex items-center">
                              🏫 {sc.name}
                            </div>
                            <div className="text-gray-600 text-xs">
                              <span className="font-medium">Subjects in this class:</span> {getSubjectNames(sc.subjectIds)}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {sc.studentIds.length} student{sc.studentIds.length !== 1 ? 's' : ''} enrolled
                            </div>
                          </div>
                        ))}
                        {assignedClasses.length > 2 && (
                          <div className="text-xs text-center p-2 bg-gray-50 rounded border border-gray-200">
                            <span className="text-gray-600 font-medium">
                              +{assignedClasses.length - 2} more class{assignedClasses.length - 2 !== 1 ? 'es' : ''}
                            </span>
                            <div className="text-gray-500 text-xs mt-1">
                              Click "Edit" to view all classes
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-400 italic flex items-center">
                        <span className="mr-1">📝</span>
                        Not assigned to any classes
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-1 ml-3">
                  <Button
                    onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    View
                  </Button>
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditModal(teacher)}
                    variant="secondary"
                    size="sm"
                    className="text-xs px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteTeacher(teacher)}
                    variant="danger"
                    size="sm"
                    loading={deletingTeacherId === teacher.id}
                    className="text-xs px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {sortedAndFilteredTeachers.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
            {filterSubjectId ? `No teachers found for subject "${filterSubjectId}".` : "No teachers found. Add a new teacher to get started."}
          </div>
        )}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📖 Subjects Taught
              <span className="text-xs text-gray-500 ml-2">
                ({allSubjects.length} available)
              </span>
            </label>
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mb-2">
                Debug: {allSubjects.length} subjects loaded, {selectedSubjectIds.length} selected
              </div>
            )}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
              {allSubjects.length > 0 ? (
                <div className="space-y-2">
                  {allSubjects.map(subject => (
                    <label
                      key={subject.id}
                      className={`flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-md border transition-colors ${
                        selectedSubjectIds.includes(subject.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      } ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(subject.id)}
                        onChange={(e) => {
                          console.log('🔧 Subject checkbox changed:', subject.name, e.target.checked);
                          setSelectedSubjectIds(prev => {
                            const newSelection = prev.includes(subject.id)
                              ? prev.filter(id => id !== subject.id)
                              : [...prev, subject.id];
                            console.log('🔧 New subject selection:', newSelection);
                            return newSelection;
                          });
                          if(subjectError) setSubjectError('');
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                        {subject.description && (
                          <div className="text-xs text-gray-500 mt-1">{subject.description}</div>
                        )}
                      </div>
                      {selectedSubjectIds.includes(subject.id) && (
                        <span className="text-green-600 text-sm">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📚</div>
                  <p className="text-sm text-gray-500 font-medium">No subjects available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Subjects are required for teacher registration
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs text-yellow-800">
                      <strong>🇱🇷 Liberian School System:</strong> Teachers must be assigned to specific subjects they will teach.
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.open('/#/admin/subjects', '_blank');
                      }}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      📖 Open Subject Management
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert('To add subjects:\n\n1. Go to Admin → Manage Subjects\n2. Click "Add New Subject"\n3. Create subjects like "Mathematics", "English", "Science", etc.\n4. Return here to assign subjects to the teacher\n\nNote: Teachers can also update their subjects later in Settings.');
                      }}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      ❓ How to Add Subjects
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Alternative:</strong> You can register the teacher without subjects and they can select their subjects later in Settings.
                  </div>
                </div>
              )}
            </div>
            {subjectError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600 font-medium">⚠️ {subjectError}</p>
              </div>
            )}
            {selectedSubjectIds.length > 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700">
                  ✅ Selected {selectedSubjectIds.length} subject{selectedSubjectIds.length !== 1 ? 's' : ''}:
                  <span className="ml-1 font-medium">
                    {selectedSubjectIds.map(id => {
                      const subject = allSubjects.find(s => s.id === id);
                      return subject?.name;
                    }).filter(Boolean).join(', ')}
                  </span>
                </p>
              </div>
            )}
          </div>
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-700">🏫 Teaching Classes</h4>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {assignedClassesToEditingTeacher.length} Class{assignedClassesToEditingTeacher.length !== 1 ? 'es' : ''}
                        </span>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {assignedClassesToEditingTeacher.map(sc => (
                            <div key={sc.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-semibold text-gray-800 flex items-center">
                                        🏫 {sc.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {sc.studentIds.length} student{sc.studentIds.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start">
                                        <span className="inline-flex items-center text-blue-600 font-medium mr-2 mt-0.5">📖</span>
                                        <div>
                                            <span className="font-medium text-blue-700">All Subjects in Class:</span>
                                            <div className="text-gray-600 mt-1">
                                                {sc.subjectIds.map(subjectId => {
                                                    const subject = allSubjects.find(s => s.id === subjectId);
                                                    const isTeaching = editingTeacher.subjectIds.includes(subjectId);
                                                    return subject ? (
                                                        <span
                                                            key={subjectId}
                                                            className={`inline-block text-xs px-2 py-1 rounded-full mr-1 mb-1 ${
                                                                isTeaching
                                                                    ? 'bg-green-100 text-green-800 font-medium'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {isTeaching && '✓ '}{subject.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="inline-flex items-center text-green-600 font-medium mr-2 mt-0.5">👨‍🏫</span>
                                        <div>
                                            <span className="font-medium text-green-700">Other Teachers:</span>
                                            <div className="text-gray-600 mt-1">
                                                {sc.teacherIds.filter(tid => tid !== editingTeacher.id).map(teacherId => {
                                                    const otherTeacher = teachers.find(t => t.id === teacherId);
                                                    return otherTeacher ? (
                                                        <span key={teacherId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                                            {otherTeacher.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                                {sc.teacherIds.filter(tid => tid !== editingTeacher.id).length === 0 && (
                                                    <span className="text-gray-500 text-xs italic">Only teacher in this class</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {sc.description && (
                                        <div className="flex items-start pt-2 border-t border-gray-100">
                                            <span className="inline-flex items-center text-gray-500 mr-2 mt-0.5">📝</span>
                                            <div className="text-gray-600 text-sm italic">
                                                {sc.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">🇱🇷</span>
                            <div className="text-sm text-blue-800">
                                <strong>Liberian School System:</strong> Teachers can teach multiple classes and subjects. Green checkmarks (✓) show which subjects this teacher teaches in each class.
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {editingTeacher && assignedClassesToEditingTeacher.length === 0 && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <span className="text-yellow-600 mr-3 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-yellow-800">🇱🇷 No Class Assignments</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    This teacher is not currently assigned to any classes. In the Liberian school system, teachers typically teach multiple classes and can specialize in specific subjects across different grade levels.
                                </p>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            alert('To assign this teacher to classes:\n\n1. Go to Admin → Class Management\n2. Select classes that need this teacher\'s subjects\n3. Edit each class and add this teacher\n\nRemember: In Liberian schools, teachers can teach multiple classes and subjects.');
                                        }}
                                        className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                    >
                                        <span className="mr-1">🏫</span>
                                        Assign to Classes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default memo(AdminTeacherManagement);