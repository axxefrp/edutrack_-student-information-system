
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { Student, SchoolClass as SchoolClassType } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortKey = keyof Pick<Student, 'name' | 'grade' | 'points'>;
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const AdminStudentManagement: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  const [enrolledClassesForEditingStudent, setEnrolledClassesForEditingStudent] = useState<SchoolClassType[]>([]);

  // Enhanced search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('');
  const [pointsRangeFilter, setPointsRangeFilter] = useState<{ min: string; max: string }>({ min: '', max: '' });
  
  const [filterGrade, setFilterGrade] = useState<string>(''); // '' for All Grades
  const [uniqueGrades, setUniqueGrades] = useState<number[]>([]);


  // Validation errors
  const [nameError, setNameError] = useState('');
  const [gradeError, setGradeError] = useState('');

  if (!context) return null;

  const { students, addStudent, updateStudent, deleteStudent, schoolClasses, teachers, subjects: allSubjects } = context;


  useEffect(() => {
    if (students) {
      const grades = Array.from(new Set(students.map((s: Student) => s.grade))).sort((a: number, b: number) => a - b);
      setUniqueGrades(grades);
    }
  }, [students]);


  const getSubjectName = (subjectId?: string | null): string => {
    if (!subjectId) return 'N/A';
    const subject = allSubjects.find((s: { id: string; name: string }) => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };


  const getTeacherName = (teacherId?: string | null): string => {
    if (!teacherId) return 'Unassigned';
    const teacher = teachers.find((t: { id: string; name: string }) => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };


  const filteredAndSortedStudents = useMemo(() => {
    let processableStudents = [...students];

    // Apply text search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      processableStudents = processableStudents.filter((student: Student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply grade filter (keeping existing logic for backward compatibility)
    if (filterGrade !== '') {
      processableStudents = processableStudents.filter((student: Student) => student.grade === parseInt(filterGrade, 10));
    }

    // Apply enhanced grade filter
    if (selectedGradeFilter !== '') {
      processableStudents = processableStudents.filter((student: Student) => student.grade === parseInt(selectedGradeFilter, 10));
    }

    // Apply points range filter
    if (pointsRangeFilter.min !== '' || pointsRangeFilter.max !== '') {
      processableStudents = processableStudents.filter((student: Student) => {
        const minPoints = pointsRangeFilter.min !== '' ? parseInt(pointsRangeFilter.min, 10) : -Infinity;
        const maxPoints = pointsRangeFilter.max !== '' ? parseInt(pointsRangeFilter.max, 10) : Infinity;
        return student.points >= minPoints && student.points <= maxPoints;
      });
    }

    // Apply sort
    if (sortConfig !== null) {
      processableStudents.sort((a: Student, b: Student) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        // Fallback for mixed types or other scenarios - adjust if needed
        const stringA = String(aValue).toLowerCase();
        const stringB = String(bValue).toLowerCase();
        return sortConfig.direction === 'ascending' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
      });
    }
    return processableStudents;
  }, [students, searchTerm, filterGrade, selectedGradeFilter, pointsRangeFilter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>; 
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };


  const validateForm = (): boolean => {
    let isValid = true;
    setNameError('');
    setGradeError('');

    if (!newStudentName.trim()) {
      setNameError('Student name is required.');
      isValid = false;
    }
    if (newStudentGrade === '') {
      setGradeError('Grade is required.');
      isValid = false;
    } else if (isNaN(Number(newStudentGrade)) || Number(newStudentGrade) < 1 || Number(newStudentGrade) > 12) {
      setGradeError('Grade must be a number between 1 and 12.');
      isValid = false;
    }
    return isValid;
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent({ ...editingStudent, name: newStudentName, grade: Number(newStudentGrade) });
      } else {
        await addStudent(newStudentName, Number(newStudentGrade));
      }
      setIsSubmitting(false);
      closeModalAndResetForm();
    } catch (err) {
      setIsSubmitting(false);
      // Optionally show error notification
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    resetFormFieldsAndErrors();
    setEnrolledClassesForEditingStudent([]);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentGrade(student.grade);
    setNameError('');
    setGradeError('');
    const classesForStudent = schoolClasses.filter((sc: SchoolClassType) => sc.studentIds.includes(student.id));
    setEnrolledClassesForEditingStudent(classesForStudent);
    setIsModalOpen(true);
  };
  
  const resetFormFieldsAndErrors = () => {
    setNewStudentName('');
    setNewStudentGrade('');
    setNameError('');
    setGradeError('');
    setEnrolledClassesForEditingStudent([]);
  };

  const closeModalAndResetForm = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    resetFormFieldsAndErrors();
  };

  const handleDeleteStudent = async (studentToDelete: Student) => {
    if (window.confirm(`Are you sure you want to delete ${studentToDelete.name}? This will also remove their grades and points records.`)) {
      setDeletingStudentId(studentToDelete.id);
      try {
        await deleteStudent(studentToDelete.id);
      } catch (err) {
        // Optionally show error notification
      }
      setDeletingStudentId(null);
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey; label: string; className?: string }> = ({ sortKey, label, className }: { sortKey: SortKey; label: string; className?: string }) => (
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
        <h1 className="text-2xl font-semibold text-gray-800">Manage Students</h1>
        <Button onClick={openAddModal} variant="primary" className="w-full sm:w-auto">Add New Student</Button>
      </div>

      {/* Enhanced Search and Filtering */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Search & Filter Students</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
            </label>
            <Input
              id="student-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Grade
            </label>
            <select
              id="grade-filter"
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map((grade: number) => (
                <option key={grade} value={String(grade)}>Grade {grade}</option>
              ))}
            </select>
          </div>

          {/* Points Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Range
            </label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={pointsRangeFilter.min}
                onChange={(e) => setPointsRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                placeholder="Min"
                className="w-full"
              />
              <Input
                type="number"
                value={pointsRangeFilter.max}
                onChange={(e) => setPointsRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                placeholder="Max"
                className="w-full"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedGradeFilter('');
                setPointsRangeFilter({ min: '', max: '' });
                setFilterGrade(''); // Clear legacy filter too
              }}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedStudents.length} of {students.length} students
          {(searchTerm || selectedGradeFilter || pointsRangeFilter.min || pointsRangeFilter.max) && (
            <span className="ml-2 text-blue-600">
              (filtered)
            </span>
          )}
        </div>
      </div>


      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <SortableHeader sortKey="name" label="Name" />
                <SortableHeader sortKey="grade" label="Grade" />
                <SortableHeader sortKey="points" label="Points" />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedStudents.map((student: Student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                        onClick={() => navigate(`/admin/students/${student.id}`)}
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        disabled={deletingStudentId === student.id}
                    >
                        View Profile
                    </Button>
                    <Button
                        onClick={() => openEditModal(student)}
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        disabled={deletingStudentId === student.id}
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={() => handleDeleteStudent(student)}
                        variant="danger"
                        size="sm"
                        loading={deletingStudentId === student.id}
                    >
                        Delete
                    </Button>
                    </td>
                </tr>
                ))}
                {filteredAndSortedStudents.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                            {filterGrade ? `No students found for Grade ${filterGrade}.` : "No students found. Add a new student to get started."}
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModalAndResetForm} title={editingStudent ? "Edit Student" : "Add New Student"}>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <Input
            label="Student Name"
            type="text"
            value={newStudentName}
            onChange={(e) => { setNewStudentName(e.target.value); if (nameError) setNameError(''); }}
            placeholder="Enter student's full name"
            required
            disabled={isSubmitting}
            error={nameError}
          />
          <Input
            label="Grade"
            type="number"
            value={newStudentGrade === '' ? '' : String(newStudentGrade)}
            onChange={(e) => { setNewStudentGrade(e.target.value === '' ? '' : parseInt(e.target.value, 10)); if (gradeError) setGradeError(''); }}
            placeholder="Enter grade level"
            required
            min="1"
            max="12"
            disabled={isSubmitting}
            error={gradeError}
          />

          {editingStudent && enrolledClassesForEditingStudent.length > 0 && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Enrolled Classes:</h4>
                <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                    {enrolledClassesForEditingStudent.map(sc => (
                        <li key={sc.id} className="text-sm text-gray-600">
                            {sc.name} 
                            <span className="text-xs text-gray-500">
                                ({getSubjectName(sc.subjectIds[0])} - Taught by: {getTeacherName(sc.teacherIds[0])})
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
          {editingStudent && enrolledClassesForEditingStudent.length === 0 && (
             <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 italic">This student is not currently enrolled in any classes.</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" onClick={closeModalAndResetForm} variant="ghost" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {editingStudent ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudentManagement;
