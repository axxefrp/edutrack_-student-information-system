
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student as StudentType, Grade } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

const TeacherGradebookScreen: React.FC = () => {
  const context = useContext(AppContext);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [currentStudentForGrade, setCurrentStudentForGrade] = useState<StudentType | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);

  // Form state for grade modal
  const [subjectOrAssignmentName, setSubjectOrAssignmentName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState<string | number>('');
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split('T')[0]);
  const [teacherComments, setTeacherComments] = useState('');

  // Validation errors
  const [subjectNameError, setSubjectNameError] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [maxScoreError, setMaxScoreError] = useState('');

  if (!context || !context.currentUser || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading data or not authorized...</div>;
  }

  const { currentUser, schoolClasses, students, grades, addGrade, updateGrade, deleteGrade } = context;
  const teacherId = currentUser.teacherId;

  const teacherAssignedClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);
  const selectedClass = schoolClasses.find(sc => sc.id === selectedClassId);
  const studentsInSelectedClass = selectedClass ? students.filter(s => selectedClass.studentIds.includes(s.id)) : [];

  const resetGradeFormFieldsAndErrors = () => {
    setSubjectOrAssignmentName('');
    setScore('');
    setMaxScore('');
    setDateAssigned(new Date().toISOString().split('T')[0]);
    setTeacherComments('');
    setSubjectNameError('');
    setScoreError('');
    setMaxScoreError('');
  };

  const openGradeModalForAdd = (student: StudentType) => {
    setEditingGrade(null);
    setCurrentStudentForGrade(student);
    resetGradeFormFieldsAndErrors();
    setIsGradeModalOpen(true);
  };

  const openGradeModalForEdit = (grade: Grade) => {
    const student = students.find(s => s.id === grade.studentId);
    setEditingGrade(grade);
    setCurrentStudentForGrade(student || null);
    setSubjectOrAssignmentName(grade.subjectOrAssignmentName);
    setScore(String(grade.score));
    setMaxScore(grade.maxScore || '');
    setDateAssigned(grade.dateAssigned);
    setTeacherComments(grade.teacherComments || '');
    setSubjectNameError('');
    setScoreError('');
    setMaxScoreError('');
    setIsGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setEditingGrade(null);
    setCurrentStudentForGrade(null);
    resetGradeFormFieldsAndErrors();
  };

  const validateGradeForm = (): boolean => {
    let isValid = true;
    setSubjectNameError('');
    setScoreError('');
    setMaxScoreError('');

    if (!subjectOrAssignmentName.trim()) {
      setSubjectNameError('Subject or Assignment name is required.');
      isValid = false;
    }
    if (!score.trim()) {
      setScoreError('Score is required.');
      isValid = false;
    }
    if (maxScore !== '' && isNaN(Number(maxScore))) {
      setMaxScoreError('Max Score must be a number if provided.');
      isValid = false;
    }
    // Optional: Add check if score and maxScore are numbers, then score <= maxScore
    // if (!isNaN(Number(score)) && !isNaN(Number(maxScore)) && Number(score) > Number(maxScore)) {
    //   setScoreError('Score cannot be greater than Max Score.');
    //   isValid = false;
    // }
    return isValid;
  };

  const handleGradeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGradeForm() || !currentStudentForGrade || !selectedClassId) {
      if (!currentStudentForGrade || !selectedClassId) {
        alert("An unexpected error occurred. Student or Class context is missing.");
      }
      return;
    }
    setIsSubmittingGrade(true);
    setTimeout(() => {
      const gradeData: Omit<Grade, 'id'> = {
        studentId: currentStudentForGrade.id,
        classId: selectedClassId,
        subjectOrAssignmentName,
        score: score, // Keep as string to allow "A+", "B-", etc.
        maxScore: maxScore !== '' ? Number(maxScore) : undefined, // Convert to number or undefined
        dateAssigned,
        teacherComments: teacherComments.trim() || undefined,
      };

      if (editingGrade) {
        updateGrade({ ...editingGrade, ...gradeData });
      } else {
        addGrade(gradeData);
      }
      setIsSubmittingGrade(false);
      closeGradeModal();
    }, 1000); // Simulate API call
  };

  const handleDeleteGrade = (gradeIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this grade? This action cannot be undone.")) {
      setDeletingGradeId(gradeIdToDelete);
      setTimeout(() => {
        deleteGrade(gradeIdToDelete);
        setDeletingGradeId(null);
      }, 1000); // Simulate API call
    }
  };
  
  const getStudentGradesForClass = (studentId: string, classId: string): Grade[] => {
    return grades.filter(g => g.studentId === studentId && g.classId === classId)
                 .sort((a,b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());
  };


  if (!selectedClassId) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gradebook - Select a Class</h1>
        {teacherAssignedClasses.length === 0 ? (
          <p className="text-gray-600">You are not assigned to any classes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherAssignedClasses.map(sc => (
              <div 
                key={sc.id} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-l-4 border-primary-500"
                onClick={() => setSelectedClassId(sc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedClassId(sc.id)}
              >
                <h2 className="text-xl font-semibold text-primary-700">{sc.name}</h2>
                {sc.description && <p className="text-sm text-gray-500 mt-1">{sc.description}</p>}
                <p className="text-sm text-gray-600 mt-2">{sc.studentIds.length} student(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gradebook: {selectedClass?.name}</h1>
        <Button onClick={() => setSelectedClassId(null)} variant="ghost" size="sm">
          &larr; Back to Class List
        </Button>
      </div>

      {studentsInSelectedClass.length === 0 ? (
          <p className="text-gray-600 bg-white p-6 rounded-lg shadow">No students enrolled in this class.</p>
      ) : (
        <div className="space-y-6">
        {studentsInSelectedClass.map(student => {
          const studentGrades = getStudentGradesForClass(student.id, selectedClassId);
          return (
            <div key={student.id} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-primary-700">{student.name} <span className="text-sm text-gray-500 font-normal">(Grade {student.grade})</span></h3>
                <Button onClick={() => openGradeModalForAdd(student)} variant="secondary" size="sm" disabled={deletingGradeId !== null}>
                  Add Grade
                </Button>
              </div>
              {studentGrades.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No grades recorded for this student in this class.</p>
              ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Subject/Assignment</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {studentGrades.map(grade => (
                                <tr key={grade.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">{grade.subjectOrAssignmentName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 font-semibold">{grade.score}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">{grade.maxScore || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">{new Date(grade.dateAssigned).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <Button 
                                          onClick={() => openGradeModalForEdit(grade)} 
                                          variant="ghost" 
                                          size="sm" 
                                          className="mr-2 text-blue-600 hover:text-blue-800"
                                          disabled={deletingGradeId === grade.id}
                                        >
                                          Edit
                                        </Button>
                                        <Button 
                                          onClick={() => handleDeleteGrade(grade.id)} 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-red-600 hover:text-red-800"
                                          loading={deletingGradeId === grade.id}
                                        >
                                          Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {isGradeModalOpen && currentStudentForGrade && (
        <Modal 
            isOpen={isGradeModalOpen} 
            onClose={closeGradeModal} 
            title={`${editingGrade ? 'Edit' : 'Add'} Grade for ${currentStudentForGrade.name} in ${selectedClass?.name}`}
        >
          <form onSubmit={handleGradeFormSubmit} className="space-y-4">
            <Input
              label="Subject / Assignment Name"
              type="text"
              value={subjectOrAssignmentName}
              onChange={(e) => { setSubjectOrAssignmentName(e.target.value); if(subjectNameError) setSubjectNameError(''); }}
              placeholder="e.g., Math Test Chapter 1"
              required
              disabled={isSubmittingGrade}
              error={subjectNameError}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Score"
                  type="text" // Allows "A+", "85", etc.
                  value={score}
                  onChange={(e) => { setScore(e.target.value); if(scoreError) setScoreError(''); }}
                  placeholder="e.g., 85 or A-"
                  required
                  disabled={isSubmittingGrade}
                  error={scoreError}
                />
                <Input
                  label="Max Score (Optional)"
                  type="text" // Keep as text to allow empty, then parse to number
                  value={maxScore}
                  onChange={(e) => { setMaxScore(e.target.value); if(maxScoreError) setMaxScoreError(''); }}
                  placeholder="e.g., 100"
                  disabled={isSubmittingGrade}
                  error={maxScoreError}
                />
            </div>
            <Input
              label="Date Assigned"
              type="date"
              value={dateAssigned}
              onChange={(e) => setDateAssigned(e.target.value)}
              required
              disabled={isSubmittingGrade}
            />
            <div>
                <label htmlFor="teacher-comments" className="block text-sm font-medium text-gray-700 mb-1">Teacher Comments (Optional)</label>
                <textarea
                    id="teacher-comments"
                    value={teacherComments}
                    onChange={(e) => setTeacherComments(e.target.value)}
                    rows={3}
                    placeholder="Any comments about this grade..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    disabled={isSubmittingGrade}
                />
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <Button type="button" onClick={closeGradeModal} variant="ghost" disabled={isSubmittingGrade}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmittingGrade} disabled={isSubmittingGrade}>
                {editingGrade ? "Save Changes" : "Add Grade"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherGradebookScreen;
