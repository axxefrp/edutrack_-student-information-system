
import React, { useContext, useState, useMemo, useEffect, useCallback, memo } from 'react';
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


  // Enhanced helper functions for multiple subjects and teachers
  const getSubjectNames = useCallback((subjectIds?: string[]): string => {
    if (!subjectIds || subjectIds.length === 0) return 'N/A';
    return subjectIds.map(id => {
      const subject = allSubjects.find(s => s.id === id);
      return subject ? subject.name : 'Unknown Subject';
    }).join(', ');
  }, [allSubjects]);

  const getTeacherNames = useCallback((teacherIds?: string[]): string => {
    if (!teacherIds || teacherIds.length === 0) return 'Unassigned';
    return teacherIds.map(id => {
      const teacher = teachers.find(t => t.id === id);
      return teacher ? teacher.name : 'Unknown Teacher';
    }).join(', ');
  }, [teachers]);


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

  const requestSort = useCallback((key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const getSortIndicator = useCallback((key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  }, [sortConfig]);


  const validateForm = useCallback((): boolean => {
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
  }, [newStudentName, newStudentGrade]);

  const handleAddStudent = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
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
  }, [validateForm, editingStudent, newStudentName, newStudentGrade, updateStudent, addStudent]);

  const resetFormFieldsAndErrors = useCallback(() => {
    setNewStudentName('');
    setNewStudentGrade('');
    setNameError('');
    setGradeError('');
    setEnrolledClassesForEditingStudent([]);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingStudent(null);
    resetFormFieldsAndErrors();
    setEnrolledClassesForEditingStudent([]);
    setIsModalOpen(true);
  }, [resetFormFieldsAndErrors]);

  const openEditModal = useCallback((student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentGrade(student.grade);
    setNameError('');
    setGradeError('');
    const classesForStudent = schoolClasses.filter((sc: SchoolClassType) => sc.studentIds.includes(student.id));
    setEnrolledClassesForEditingStudent(classesForStudent);
    setIsModalOpen(true);
  }, [schoolClasses]);

  const closeModalAndResetForm = useCallback(() => {
    setIsModalOpen(false);
    setEditingStudent(null);
    resetFormFieldsAndErrors();
  }, [resetFormFieldsAndErrors]);

  const handleDeleteStudent = useCallback(async (studentToDelete: Student) => {
    if (window.confirm(`Are you sure you want to delete ${studentToDelete.name}? This will also remove their grades and points records.`)) {
      setDeletingStudentId(studentToDelete.id);
      try {
        await deleteStudent(studentToDelete.id);
      } catch (err) {
        // Optionally show error notification
      }
      setDeletingStudentId(null);
    }
  }, [deleteStudent]);

  const SortableHeader = memo<{ sortKey: SortKey; label: string; className?: string }>(({ sortKey, label, className }) => (
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
  ));


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


      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <SortableHeader sortKey="name" label="Name" />
                <SortableHeader sortKey="grade" label="Grade" />
                <SortableHeader sortKey="points" label="Points" />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📚 Classes
                </th>
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredAndSortedStudents.map((student: Student) => {
          const enrolledClasses = schoolClasses.filter(sc => sc.studentIds.includes(student.id));

          return (
            <div key={student.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">Grade {student.grade}</span>
                    <span className="text-sm text-gray-600">{student.points} points</span>
                  </div>

                  {/* Class Information for Mobile - Liberian School System */}
                  {enrolledClasses.length > 0 ? (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {enrolledClasses.length === 1 ? (
                        // Single class (typical Liberian system)
                        <div className="text-xs bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="font-semibold text-gray-800 mb-2 flex items-center">
                            🏫 {enrolledClasses[0].name}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-start text-gray-600">
                              <span className="inline-flex items-center text-blue-600 font-medium mr-1 mt-0.5">📖</span>
                              <div>
                                <span className="text-xs font-medium">Subjects:</span>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {getSubjectNames(enrolledClasses[0].subjectIds)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start text-gray-600">
                              <span className="inline-flex items-center text-green-600 font-medium mr-1 mt-0.5">👨‍🏫</span>
                              <div>
                                <span className="text-xs font-medium">Teachers:</span>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {getTeacherNames(enrolledClasses[0].teacherIds)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Multiple classes (unusual but possible)
                        <div>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ {enrolledClasses.length} Classes (Unusual)
                            </span>
                          </div>
                          <div className="text-xs text-yellow-600 mb-2 italic">
                            Note: Students typically belong to one class in Liberian schools
                          </div>
                          <div className="space-y-1">
                            {enrolledClasses.slice(0, 2).map(sc => (
                              <div key={sc.id} className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                                <div className="font-medium text-gray-700">{sc.name}</div>
                                <div className="text-gray-500 text-xs">
                                  {getSubjectNames(sc.subjectIds)} • {getTeacherNames(sc.teacherIds)}
                                </div>
                              </div>
                            ))}
                            {enrolledClasses.length > 2 && (
                              <div className="text-xs text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                                <span className="text-yellow-700 font-medium">
                                  +{enrolledClasses.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-400 italic flex items-center">
                        <span className="mr-1">📝</span>
                        Not assigned to a class
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-1 ml-3">
                  <Button
                    onClick={() => navigate(`/admin/students/${student.id}`)}
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
                    onClick={() => openEditModal(student)}
                    variant="secondary"
                    size="sm"
                    className="text-xs px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteStudent(student)}
                    variant="danger"
                    size="sm"
                    loading={deletingStudentId === student.id}
                    className="text-xs px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAndSortedStudents.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
            {filterGrade ? `No students found for Grade ${filterGrade}.` : "No students found. Add a new student to get started."}
          </div>
        )}
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
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center mb-3">
                    <h4 className="text-md font-semibold text-gray-700">
                        🏫 {enrolledClassesForEditingStudent.length === 1 ? 'Assigned Class' : 'Assigned Classes'}
                    </h4>
                    {enrolledClassesForEditingStudent.length > 1 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠️ {enrolledClassesForEditingStudent.length} Classes (Unusual)
                        </span>
                    )}
                </div>
                {enrolledClassesForEditingStudent.length > 1 && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <span className="text-yellow-600 mr-2 mt-0.5">⚠️</span>
                            <div className="text-sm text-yellow-800">
                                <strong>Note:</strong> In the Liberian school system, students typically belong to one class with multiple teachers for different subjects.
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {enrolledClassesForEditingStudent.map(sc => (
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
                                        <span className="font-medium text-blue-700">Subjects:</span>
                                        <div className="text-gray-600 mt-1">
                                            {sc.subjectIds.map(subjectId => {
                                                const subject = allSubjects.find(s => s.id === subjectId);
                                                return subject ? (
                                                    <span key={subjectId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                                        {subject.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="inline-flex items-center text-green-600 font-medium mr-2 mt-0.5">👨‍🏫</span>
                                    <div>
                                        <span className="font-medium text-green-700">Teachers:</span>
                                        <div className="text-gray-600 mt-1">
                                            {sc.teacherIds.map(teacherId => {
                                                const teacher = teachers.find(t => t.id === teacherId);
                                                return teacher ? (
                                                    <span key={teacherId} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                                        {teacher.name}
                                                    </span>
                                                ) : null;
                                            })}
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
            </div>
          )}
          {editingStudent && enrolledClassesForEditingStudent.length === 0 && (
             <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <span className="text-yellow-600 mr-3 mt-0.5">⚠️</span>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-yellow-800">🇱🇷 No Class Assignment</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                This student is not currently assigned to a class. In the Liberian school system, each student should be assigned to one class (e.g., "Grade 5A", "Grade 6B") where they receive instruction from multiple teachers for different subjects.
                            </p>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        alert('To assign this student to a class:\n\n1. Go to Admin → Class Management\n2. Select the appropriate class for this student\'s grade level\n3. Edit the class and add this student\n\nRemember: In Liberian schools, students typically belong to one class with multiple teachers.');
                                    }}
                                    className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                >
                                    <span className="mr-1">🏫</span>
                                    Assign to Class
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
              {editingStudent ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default memo(AdminStudentManagement);
