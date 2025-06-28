
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Teacher, Student, Subject } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortableClassKey = 'name' | 'subjectName' | 'teacherName' | 'studentCount';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableClassKey;
  direction: SortDirection;
}

const AdminClassManagement: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  
  const [className, setClassName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null | undefined>(undefined);
  const [classDescription, setClassDescription] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null | undefined>(undefined);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  const [filterTeacherId, setFilterTeacherId] = useState<string>('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('');


  if (!context) return null;
  const { schoolClasses, teachers, students, subjects, addSchoolClass, updateSchoolClass, deleteSchoolClass, addNotificationDirectly } = context;

  const getTeacherName = (teacherId?: string | null): string => {
    if (!teacherId) return 'Unassigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };
  
  const getSubjectName = (subjectId?: string | null): string => {
    if (!subjectId) return 'N/A';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const sortedAndFilteredSchoolClasses = useMemo(() => {
    let processableClasses = schoolClasses.map(sc => ({
      ...sc,
      subjectName: getSubjectName(sc.subjectId),
      teacherName: getTeacherName(sc.teacherId),
      studentCount: sc.studentIds.length,
    }));

    // Apply filters
    if (filterTeacherId) {
      processableClasses = processableClasses.filter(sc => sc.teacherId === filterTeacherId);
    }
    if (filterSubjectId) {
      processableClasses = processableClasses.filter(sc => sc.subjectId === filterSubjectId);
    }

    // Apply sort
    if (sortConfig !== null) {
      processableClasses.sort((a, b) => {
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
    return processableClasses;
  }, [schoolClasses, teachers, subjects, sortConfig, filterTeacherId, filterSubjectId]);

  const requestSort = (key: SortableClassKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableClassKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };


  const validateForm = (): boolean => {
    let isValid = true;
    setNameError('');
    setSubjectError('');

    if (!className.trim()) {
      setNameError('Class name is required.');
      isValid = false;
    }
    if (selectedSubjectId === undefined || selectedSubjectId === null || selectedSubjectId === '') {
        setSubjectError('Subject is required.');
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
      const classDataPayload = {
        name: className,
        subjectId: selectedSubjectId, 
        description: classDescription,
        teacherId: selectedTeacherId, 
        studentIds: selectedStudentIds,
      };

      if (editingClass) {
          const updatedClassData: SchoolClass = {
              ...editingClass,
              ...classDataPayload,
              subjectId: classDataPayload.subjectId || null, 
          };
          updateSchoolClass(updatedClassData); 
          addNotificationDirectly('Class Updated', `Class "${className}" has been updated.`, 'success');
      } else {
        const newClass = addSchoolClass(className, classDataPayload.subjectId || null, classDescription);
         updateSchoolClass({
             ...newClass, 
             teacherId: selectedTeacherId,
             studentIds: selectedStudentIds,
         });
         addNotificationDirectly('Class Added', `Class "${className}" has been added.`, 'success');
      }
      setIsSubmitting(false);
      closeModalAndResetForm();
    }, 1000); 
  };
  
  const resetFormFieldsAndErrors = () => {
    setClassName('');
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : undefined); 
    setClassDescription('');
    setSelectedTeacherId(undefined); 
    setSelectedStudentIds([]);
    setNameError('');
    setSubjectError('');
  };

  const openAddModal = () => {
    setEditingClass(null);
    resetFormFieldsAndErrors();
    if (subjects.length > 0 && selectedSubjectId === undefined) {
      setSelectedSubjectId(subjects[0].id); 
    }
    setIsModalOpen(true);
  };

  const openEditModal = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setClassName(schoolClass.name);
    setSelectedSubjectId(schoolClass.subjectId);
    setClassDescription(schoolClass.description || '');
    setSelectedTeacherId(schoolClass.teacherId);
    setSelectedStudentIds([...schoolClass.studentIds]);
    setNameError('');
    setSubjectError('');
    setIsModalOpen(true);
  };

  const closeModalAndResetForm = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    resetFormFieldsAndErrors();
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleDeleteClass = (schoolClassToDelete: SchoolClass) => {
    if (window.confirm(`Are you sure you want to delete class "${schoolClassToDelete.name}"? This will also remove all grades associated with this class.`)) {
      setDeletingClassId(schoolClassToDelete.id);
      setTimeout(() => {
        deleteSchoolClass(schoolClassToDelete.id);
        addNotificationDirectly('Class Deleted', `Class "${schoolClassToDelete.name}" has been deleted.`, 'success');
        setDeletingClassId(null);
      }, 1000); 
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortableClassKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
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
        <h1 className="text-2xl font-semibold text-gray-800">Manage Classes</h1>
        <Button onClick={openAddModal} variant="primary" className="w-full sm:w-auto">Add New Class</Button>
      </div>
      
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
            <label htmlFor="teacher-filter" className="block text-sm font-medium text-gray-700">Filter by Teacher:</label>
            <select
                id="teacher-filter"
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
            >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="subject-filter-class" className="block text-sm font-medium text-gray-700">Filter by Subject:</label>
            <select
                id="subject-filter-class"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
            >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
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
                <SortableHeader sortKey="name" label="Class Name" />
                <SortableHeader sortKey="subjectName" label="Subject" />
                <SortableHeader sortKey="teacherName" label="Teacher" />
                <SortableHeader sortKey="studentCount" label="Students" />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredSchoolClasses.map((sc) => (
                <tr key={sc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sc.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{sc.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sc.subjectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sc.teacherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sc.studentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                        onClick={() => openEditModal(sc)} 
                        variant="secondary" 
                        size="sm" 
                        className="mr-2"
                        disabled={deletingClassId === sc.id}
                    >
                        Edit
                    </Button>
                    <Button 
                        onClick={() => handleDeleteClass(sc)} 
                        variant="danger" 
                        size="sm"
                        loading={deletingClassId === sc.id}
                    >
                        Delete
                    </Button>
                    </td>
                </tr>
                ))}
                {sortedAndFilteredSchoolClasses.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No classes found matching the current filters.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModalAndResetForm} title={editingClass ? "Edit Class" : "Add New Class"}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input
            label="Class Name"
            type="text"
            value={className}
            onChange={(e) => { setClassName(e.target.value); if(nameError) setNameError(''); }}
            placeholder="e.g., Grade 10 - Biology"
            required
            disabled={isSubmitting}
            error={nameError}
          />
           <div>
            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              id="subject-select"
              value={selectedSubjectId || ''} 
              onChange={(e) => {setSelectedSubjectId(e.target.value); if(subjectError) setSubjectError('');}}
              className={`mt-1 block w-full px-4 py-3 border ${subjectError ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            {subjectError && <p className="mt-1 text-xs text-red-600">{subjectError}</p>}
            {subjects.length === 0 && <p className="mt-1 text-xs text-yellow-600">No subjects available. Please add subjects first in 'Manage Subjects'.</p>}
          </div>

          <div>
            <label htmlFor="class-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
                id="class-description"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                placeholder="Briefly describe the class"
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="teacher-select" className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
            <select
              id="teacher-select"
              value={selectedTeacherId === null ? '' : selectedTeacherId || ''} 
              onChange={(e) => setSelectedTeacherId(e.target.value === '' ? null : e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="">Unassigned</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Students</h4>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
              {students.length > 0 ? students.map(student => (
                <label key={student.id} className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => handleStudentSelection(student.id)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700">{student.name} (Grade {student.grade})</span>
                </label>
              )) : <p className="text-xs text-gray-500">No students available to assign.</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModalAndResetForm} variant="ghost" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {editingClass ? "Save Changes" : "Create Class"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminClassManagement;
