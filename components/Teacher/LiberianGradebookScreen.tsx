import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student as StudentType, Grade, Subject, AssessmentType, LiberianGradeScale } from '../../types';
import { 
  LIBERIAN_GRADE_SCALE, 
  percentageToLiberianGrade, 
  calculateLiberianFinalGrade,
  LIBERIAN_ACADEMIC_TERMS,
  LIBERIAN_CORE_SUBJECTS 
} from '../../utils/liberianGradingSystem';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

const LiberianGradebookScreen: React.FC = () => {
  const context = useContext(AppContext);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3 | 'All'>(1);
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState<AssessmentType | 'All'>('All');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [currentStudentForGrade, setCurrentStudentForGrade] = useState<StudentType | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Form state for grade modal
  const [subjectOrAssignmentName, setSubjectOrAssignmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Test');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState<string | number>(100);
  const [continuousAssessment, setContinuousAssessment] = useState('');
  const [externalExamination, setExternalExamination] = useState('');
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split('T')[0]);
  const [teacherComments, setTeacherComments] = useState('');
  const [isWAECSubject, setIsWAECSubject] = useState(false);

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
    
    if (selectedTerm !== 'All') {
      filtered = filtered.filter(g => g.term === selectedTerm);
    }
    
    if (assessmentTypeFilter !== 'All') {
      filtered = filtered.filter(g => g.assessmentType === assessmentTypeFilter);
    }
    
    return filtered;
  }, [grades, selectedClassId, selectedSubjectId, selectedTerm, assessmentTypeFilter]);

  const getStudentGradesForClass = (studentId: string): Grade[] => {
    return filteredGrades.filter(g => g.studentId === studentId)
                         .sort((a,b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());
  };

  const calculateStudentTermAverage = (studentId: string, term: 1 | 2 | 3): string => {
    const termGrades = grades.filter(g => 
      g.studentId === studentId && 
      g.classId === selectedClassId && 
      g.term === term &&
      g.score && !isNaN(Number(g.score))
    );
    
    if (termGrades.length === 0) return 'N/A';
    
    const average = termGrades.reduce((sum, grade) => sum + Number(grade.score), 0) / termGrades.length;
    const liberianGrade = percentageToLiberianGrade(average);
    return `${average.toFixed(1)}% (${liberianGrade})`;
  };

  const resetGradeFormFields = () => {
    setSubjectOrAssignmentName('');
    setAssessmentType('Test');
    setScore('');
    setMaxScore(100);
    setContinuousAssessment('');
    setExternalExamination('');
    setDateAssigned(new Date().toISOString().split('T')[0]);
    setTeacherComments('');
    setIsWAECSubject(false);
  };

  const openGradeModalForAdd = (student: StudentType) => {
    setEditingGrade(null);
    setCurrentStudentForGrade(student);
    resetGradeFormFields();
    setIsGradeModalOpen(true);
  };

  const handleGradeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentForGrade || !selectedClassId) return;

    setIsSubmittingGrade(true);
    setTimeout(() => {
      let finalScore = Number(score);
      let liberianGrade: LiberianGradeScale | undefined;

      // Calculate Liberian grade if both CA and External scores are provided
      if (continuousAssessment && externalExamination) {
        const result = calculateLiberianFinalGrade(Number(continuousAssessment), Number(externalExamination));
        finalScore = result.finalScore;
        liberianGrade = result.liberianGrade;
      } else if (score) {
        liberianGrade = percentageToLiberianGrade(Number(score));
      }

      const gradeData: Omit<Grade, 'id'> = {
        studentId: currentStudentForGrade.id,
        classId: selectedClassId,
        subjectId: selectedSubjectId || undefined,
        subjectOrAssignmentName,
        assessmentType,
        score: String(finalScore),
        maxScore: Number(maxScore),
        dateAssigned,
        teacherComments: teacherComments.trim() || undefined,
        liberianGrade,
        continuousAssessment: continuousAssessment ? Number(continuousAssessment) : undefined,
        externalExamination: externalExamination ? Number(externalExamination) : undefined,
        term: selectedTerm === 'All' ? 1 : selectedTerm,
        isWAECSubject,
        status: 'Graded'
      };

      if (editingGrade) {
        updateGrade({ ...editingGrade, ...gradeData });
      } else {
        addGrade(gradeData);
      }
      setIsSubmittingGrade(false);
      setIsGradeModalOpen(false);
      resetGradeFormFields();
    }, 1000);
  };

  const assessmentTypes: AssessmentType[] = ['Quiz', 'Test', 'Exam', 'Assignment', 'Project', 'Participation', 'Homework', 'Other'];

  if (!selectedClassId) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-gradient-to-r from-green-600 to-red-600 text-white p-4 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">🇱🇷 Liberian Standards Gradebook</h1>
          <p className="text-green-100">Aligned with Ministry of Education curriculum and WAEC standards</p>
        </div>
        
        {teacherAssignedClasses.length === 0 ? (
          <p className="text-gray-600">You are not assigned to any classes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherAssignedClasses.map(sc => (
              <div 
                key={sc.id} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-l-4 border-green-600"
                onClick={() => setSelectedClassId(sc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedClassId(sc.id)}
              >
                <h2 className="text-xl font-semibold text-green-700">{sc.name}</h2>
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">🇱🇷 {selectedClass?.name} - Liberian Standards</h1>
          <p className="text-sm text-gray-600">Ministry of Education Aligned Gradebook</p>
        </div>
        <Button onClick={() => setSelectedClassId(null)} variant="ghost" size="sm">
          &larr; Back to Class List
        </Button>
      </div>

      {/* Liberian Academic Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-green-600">
        <h3 className="text-lg font-medium text-gray-800 mb-4">📚 Academic Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubjectId || 'All'}
              onChange={(e) => setSelectedSubjectId(e.target.value === 'All' ? null : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Subjects</option>
              {classSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {LIBERIAN_CORE_SUBJECTS.includes(subject.name) ? '(Core)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as 1 | 2 | 3 | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Terms</option>
              <option value={1}>Term 1 (Sep-Dec)</option>
              <option value={2}>Term 2 (Jan-Apr)</option>
              <option value={3}>Term 3 (May-Jul)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
            <select
              value={assessmentTypeFilter}
              onChange={(e) => setAssessmentTypeFilter(e.target.value as AssessmentType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Types</option>
              {assessmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="bg-green-50 p-2 rounded text-xs">
              <p className="font-medium text-green-800">Liberian System</p>
              <p className="text-green-600">30% CA + 70% External</p>
            </div>
          </div>
        </div>
      </div>

      {studentsInSelectedClass.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow">No students enrolled in this class.</p>
      ) : (
        <div className="space-y-6">
          {studentsInSelectedClass.map(student => {
            const studentGrades = getStudentGradesForClass(student.id);
            const term1Avg = calculateStudentTermAverage(student.id, 1);
            const term2Avg = calculateStudentTermAverage(student.id, 2);
            const term3Avg = calculateStudentTermAverage(student.id, 3);
            
            return (
              <div key={student.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-green-700">
                      {student.name} 
                      <span className="text-sm text-gray-500 font-normal ml-2">(Grade {student.grade})</span>
                    </h3>
                    <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                      <span>Term 1: <strong>{term1Avg}</strong></span>
                      <span>Term 2: <strong>{term2Avg}</strong></span>
                      <span>Term 3: <strong>{term3Avg}</strong></span>
                    </div>
                  </div>
                  <Button onClick={() => openGradeModalForAdd(student)} variant="secondary" size="sm">
                    Add Grade
                  </Button>
                </div>
                
                {studentGrades.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No grades recorded for current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Assignment</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Score</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Liberian Grade</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Term</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">WAEC</th>
                          <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Actions</th>
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
                              {grade.score}%{grade.maxScore ? `/${grade.maxScore}` : ''}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {grade.liberianGrade && (
                                <span className={`px-2 py-1 text-xs font-bold rounded ${
                                  LIBERIAN_GRADE_SCALE[grade.liberianGrade].isCredit 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {grade.liberianGrade}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                              Term {grade.term}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {grade.isWAECSubject && (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                  WAEC
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
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
          onClose={() => setIsGradeModalOpen(false)} 
          title={`🇱🇷 Add Liberian Grade for ${currentStudentForGrade.name}`}
        >
          <form onSubmit={handleGradeFormSubmit} className="space-y-4">
            <Input
              label="Assignment Name"
              type="text"
              value={subjectOrAssignmentName}
              onChange={(e) => setSubjectOrAssignmentName(e.target.value)}
              placeholder="e.g., First Term Mathematics Test"
              required
              disabled={isSubmittingGrade}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmittingGrade}
                >
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select
                  value={selectedTerm === 'All' ? 1 : selectedTerm}
                  onChange={(e) => setSelectedTerm(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmittingGrade}
                >
                  <option value={1}>Term 1 (Sep-Dec)</option>
                  <option value={2}>Term 2 (Jan-Apr)</option>
                  <option value={3}>Term 3 (May-Jul)</option>
                </select>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Liberian Assessment Method</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Continuous Assessment (30%)"
                  type="number"
                  value={continuousAssessment}
                  onChange={(e) => setContinuousAssessment(e.target.value)}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  disabled={isSubmittingGrade}
                />
                <Input
                  label="External Examination (70%)"
                  type="number"
                  value={externalExamination}
                  onChange={(e) => setExternalExamination(e.target.value)}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  disabled={isSubmittingGrade}
                />
              </div>
              <p className="text-xs text-green-600 mt-2">
                Final score will be calculated automatically: (CA × 0.3) + (External × 0.7)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Direct Score (if not using CA/External)"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0-100"
                min="0"
                max="100"
                disabled={isSubmittingGrade}
              />
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="waec-subject"
                  checked={isWAECSubject}
                  onChange={(e) => setIsWAECSubject(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  disabled={isSubmittingGrade}
                />
                <label htmlFor="waec-subject" className="text-sm text-gray-700">
                  WAEC Subject
                </label>
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Comments</label>
              <textarea
                value={teacherComments}
                onChange={(e) => setTeacherComments(e.target.value)}
                rows={3}
                placeholder="Comments about student performance..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                disabled={isSubmittingGrade}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <Button 
                type="button" 
                onClick={() => setIsGradeModalOpen(false)} 
                variant="ghost" 
                disabled={isSubmittingGrade}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingGrade}>
                Add Liberian Grade
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LiberianGradebookScreen;
