
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass } from '../../types';
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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [classDescription, setClassDescription] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
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

  const getTeacherNames = (teacherIds?: string[]): string => {
    if (!teacherIds || teacherIds.length === 0) return 'Unassigned';
    return teacherIds.map(id => {
      const teacher = teachers.find(t => t.id === id);
      return teacher ? teacher.name : 'Unknown Teacher';
    }).join(', ');
  };
  
  const getSubjectNames = (subjectIds?: string[]): string => {
    if (!subjectIds || subjectIds.length === 0) return 'N/A';
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : 'Unknown Subject';
    }).join(', ');
  };

  const sortedAndFilteredSchoolClasses = useMemo(() => {
    let processableClasses = schoolClasses.map(sc => ({
      ...sc,
      subjectName: getSubjectNames(sc.subjectIds),
      teacherName: getTeacherNames(sc.teacherIds),
      studentCount: sc.studentIds.length,
    }));

    // Apply filters
    if (filterTeacherId) {
      processableClasses = processableClasses.filter(sc => sc.teacherIds && sc.teacherIds.includes(filterTeacherId));
    }
    if (filterSubjectId) {
      processableClasses = processableClasses.filter(sc => sc.subjectIds && sc.subjectIds.includes(filterSubjectId));
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
    if (!selectedSubjectIds || selectedSubjectIds.length === 0) {
        setSubjectError('At least one subject is required.');
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
        subjectIds: selectedSubjectIds,
        description: classDescription,
        teacherIds: selectedTeacherIds,
        studentIds: selectedStudentIds,
      };

      if (editingClass) {
        const updatedClassData: SchoolClass = {
          ...editingClass,
          ...classDataPayload,
        };
        updateSchoolClass(updatedClassData);
        addNotificationDirectly('Class Updated', `Class \"${className}\" has been updated.`, 'success');
      } else {
        addSchoolClass(className, classDataPayload.subjectIds, classDescription).then(newClass => {
          if (newClass) {
            updateSchoolClass({
              ...newClass,
              teacherIds: selectedTeacherIds,
              studentIds: selectedStudentIds,
            });
            addNotificationDirectly('Class Added', `Class \"${className}\" has been added.`, 'success');
          }
        });
      }
      setIsSubmitting(false);
      closeModalAndResetForm();
    }, 1000);
  };
  
  const resetFormFieldsAndErrors = () => {
    setClassName('');
    setSelectedSubjectIds([]);
    setClassDescription('');
    setSelectedTeacherIds([]);
    setSelectedStudentIds([]);
    setNameError('');
    setSubjectError('');
  };

  const openAddModal = () => {
    setEditingClass(null);
    resetFormFieldsAndErrors();
    setIsModalOpen(true);
  };

  const openEditModal = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setClassName(schoolClass.name);
    setSelectedSubjectIds(schoolClass.subjectIds || []);
    setClassDescription(schoolClass.description || '');
    setSelectedTeacherIds(schoolClass.teacherIds || []);
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

  const handleTeacherSelection = (teacherId: string) => {
    setSelectedTeacherIds(prev =>
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
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
        <form onSubmit={handleFormSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
              {subjects.length > 0 ? subjects.map(subject => (
                <label key={subject.id} className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(subject.id)}
                    onChange={() => {
                      setSelectedSubjectIds(prev =>
                        prev.includes(subject.id)
                          ? prev.filter(id => id !== subject.id)
                          : [...prev, subject.id]
                      );
                      if(subjectError) setSubjectError('');
                    }}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700">{subject.name}</span>
                </label>
              )) : <p className="text-xs text-gray-500">No subjects available. Please add subjects first in 'Manage Subjects'.</p>}
            </div>
            {subjectError && <p className="mt-1 text-xs text-red-600">{subjectError}</p>}
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Teachers</h4>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
              {teachers.length > 0 ? teachers.map(teacher => (
                <label key={teacher.id} className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTeacherIds.includes(teacher.id)}
                    onChange={() => handleTeacherSelection(teacher.id)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{teacher.name}</span>
                </label>
              )) : (
                <p className="text-sm text-gray-500 italic">No teachers available</p>
              )}
            </div>
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
