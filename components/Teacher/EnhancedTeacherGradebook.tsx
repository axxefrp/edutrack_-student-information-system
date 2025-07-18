import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student as StudentType, Grade, Subject, AssessmentType } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

const EnhancedTeacherGradebook: React.FC = () => {
  const context = useContext(AppContext);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState<AssessmentType | 'All'>('All');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [currentStudentForGrade, setCurrentStudentForGrade] = useState<StudentType | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Form state for grade modal
  const [subjectOrAssignmentName, setSubjectOrAssignmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Assignment');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState<string | number>('');
  const [weight, setWeight] = useState<string>('');
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split('T')[0]);
  const [teacherComments, setTeacherComments] = useState('');

  if (!context || !context.currentUser || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading data or not authorized...</div>;
  }

  const { currentUser, schoolClasses, students, grades, subjects, addGrade, updateGrade, deleteGrade } = context;
  const teacherId = currentUser.teacherId;

  const teacherAssignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacherId));
  const selectedClass = schoolClasses.find(sc => sc.id === selectedClassId);
  const studentsInSelectedClass = selectedClass ? students.filter(s => selectedClass.studentIds.includes(s.id)) : [];

  // Get subjects for the selected class
  const classSubjects = useMemo(() => {
    if (!selectedClass) return [];
    return subjects.filter(subject => selectedClass.subjectIds.includes(subject.id));
  }, [selectedClass, subjects]);

  // Filter grades based on selected filters
  const filteredGrades = useMemo(() => {
    let filtered = grades.filter(g => g.classId === selectedClassId);
    
    if (selectedSubjectId && selectedSubjectId !== 'All') {
      filtered = filtered.filter(g => g.subjectId === selectedSubjectId);
    }
    
    if (assessmentTypeFilter !== 'All') {
      filtered = filtered.filter(g => g.assessmentType === assessmentTypeFilter);
    }
    
    return filtered;
  }, [grades, selectedClassId, selectedSubjectId, assessmentTypeFilter]);

  const getStudentGradesForClass = (studentId: string): Grade[] => {
    return filteredGrades.filter(g => g.studentId === studentId)
                         .sort((a,b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());
  };

  const calculateStudentAverage = (studentId: string): string => {
    const studentGrades = getStudentGradesForClass(studentId);
    const numericGrades = studentGrades
      .filter(g => g.score && !isNaN(Number(g.score)))
      .map(g => Number(g.score));
    
    if (numericGrades.length === 0) return 'N/A';
    
    const average = numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length;
    return average.toFixed(1);
  };

  const resetGradeFormFields = () => {
    setSubjectOrAssignmentName('');
    setAssessmentType('Assignment');
    setScore('');
    setMaxScore('');
    setWeight('');
    setDateAssigned(new Date().toISOString().split('T')[0]);
    setTeacherComments('');
  };

  const openGradeModalForAdd = (student: StudentType) => {
    setEditingGrade(null);
    setCurrentStudentForGrade(student);
    resetGradeFormFields();
    setIsGradeModalOpen(true);
  };

  const openGradeModalForEdit = (grade: Grade) => {
    const student = students.find(s => s.id === grade.studentId);
    setEditingGrade(grade);
    setCurrentStudentForGrade(student || null);
    setSubjectOrAssignmentName(grade.subjectOrAssignmentName);
    setAssessmentType(grade.assessmentType);
    setScore(String(grade.score));
    setMaxScore(grade.maxScore || '');
    setWeight(grade.weight ? String(grade.weight) : '');
    setDateAssigned(grade.dateAssigned);
    setTeacherComments(grade.teacherComments || '');
    setIsGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setEditingGrade(null);
    setCurrentStudentForGrade(null);
    resetGradeFormFields();
  };

  const handleGradeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentForGrade || !selectedClassId) return;

    setIsSubmittingGrade(true);
    setTimeout(() => {
      const gradeData: Omit<Grade, 'id'> = {
        studentId: currentStudentForGrade.id,
        classId: selectedClassId,
        subjectId: selectedSubjectId || undefined,
        subjectOrAssignmentName,
        assessmentType,
        score: score,
        maxScore: maxScore !== '' ? Number(maxScore) : undefined,
        weight: weight !== '' ? Number(weight) : undefined,
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
    }, 1000);
  };

  const assessmentTypes: AssessmentType[] = ['Quiz', 'Test', 'Exam', 'Assignment', 'Project', 'Participation', 'Homework', 'Other'];

  if (!selectedClassId) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Enhanced Gradebook - Select a Class</h1>
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
                <p className="text-sm text-gray-600">{sc.subjectIds.length} subject(s)</p>
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
        <h1 className="text-2xl font-semibold text-gray-800">Enhanced Gradebook: {selectedClass?.name}</h1>
        <Button onClick={() => setSelectedClassId(null)} variant="ghost" size="sm">
          &larr; Back to Class List
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubjectId || 'All'}
              onChange={(e) => setSelectedSubjectId(e.target.value === 'All' ? null : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="All">All Subjects</option>
              {classSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
            <select
              value={assessmentTypeFilter}
              onChange={(e) => setAssessmentTypeFilter(e.target.value as AssessmentType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="All">All Types</option>
              {assessmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {studentsInSelectedClass.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow">No students enrolled in this class.</p>
      ) : (
        <div className="space-y-6">
          {studentsInSelectedClass.map(student => {
            const studentGrades = getStudentGradesForClass(student.id);
            const average = calculateStudentAverage(student.id);
            return (
              <div key={student.id} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-primary-700">
                      {student.name} 
                      <span className="text-sm text-gray-500 font-normal ml-2">(Grade {student.grade})</span>
                    </h3>
                    <p className="text-sm text-gray-600">Average: <span className="font-semibold">{average}</span></p>
                  </div>
                  <Button onClick={() => openGradeModalForAdd(student)} variant="secondary" size="sm">
                    Add Grade
                  </Button>
                </div>
                {studentGrades.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No grades recorded for this student with current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentGrades.map(grade => (
                          <tr key={grade.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-900">{grade.subjectOrAssignmentName}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {grade.assessmentType}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-700 font-semibold">
                              {grade.score}{grade.maxScore ? `/${grade.maxScore}` : ''}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                              {grade.weight ? `${(grade.weight * 100).toFixed(0)}%` : 'N/A'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                              {new Date(grade.dateAssigned).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <Button 
                                onClick={() => openGradeModalForEdit(grade)} 
                                variant="ghost" 
                                size="sm" 
                                className="mr-2 text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </Button>
                              <Button 
                                onClick={() => deleteGrade(grade.id)} 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800"
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

      {/* Grade Modal */}
      {isGradeModalOpen && currentStudentForGrade && (
        <Modal 
          isOpen={isGradeModalOpen} 
          onClose={closeGradeModal} 
          title={`${editingGrade ? 'Edit' : 'Add'} Grade for ${currentStudentForGrade.name}`}
        >
          <form onSubmit={handleGradeFormSubmit} className="space-y-4">
            <Input
              label="Assignment Name"
              type="text"
              value={subjectOrAssignmentName}
              onChange={(e) => setSubjectOrAssignmentName(e.target.value)}
              placeholder="e.g., Chapter 1 Quiz"
              required
              disabled={isSubmittingGrade}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmittingGrade}
              >
                {assessmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Score"
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="85 or A-"
                required
                disabled={isSubmittingGrade}
              />
              <Input
                label="Max Score"
                type="text"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
                disabled={isSubmittingGrade}
              />
              <Input
                label="Weight (%)"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="30"
                disabled={isSubmittingGrade}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea
                value={teacherComments}
                onChange={(e) => setTeacherComments(e.target.value)}
                rows={3}
                placeholder="Optional comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmittingGrade}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <Button type="button" onClick={closeGradeModal} variant="ghost" disabled={isSubmittingGrade}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingGrade}>
                {editingGrade ? "Save Changes" : "Add Grade"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EnhancedTeacherGradebook;
