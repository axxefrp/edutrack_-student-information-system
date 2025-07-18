import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student as StudentType, Grade, Subject, AssessmentType, LiberianGradeScale } from '../../types';
import { 
  LIBERIAN_GRADE_SCALE, 
  percentageToLiberianGrade, 
  calculateLiberianFinalGrade,
  checkUniversityEligibility,
  LIBERIAN_CORE_SUBJECTS,
  WAEC_SUBJECTS 
} from '../../utils/liberianGradingSystem';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

interface StudentPerformanceSummary {
  student: StudentType;
  termAverages: { term1: number; term2: number; term3: number };
  overallAverage: number;
  creditPasses: number;
  universityEligible: boolean;
  totalAssessments: number;
  lastAssessmentDate: string;
}

const ComprehensiveTeacherGradebook: React.FC = () => {
  const context = useContext(AppContext);

  // State management
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3 | 'All'>('All');
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState<AssessmentType | 'All'>('All');
  const [subjectFilter, setSubjectFilter] = useState<string | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'grade'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Grade modal state
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [currentStudentForGrade, setCurrentStudentForGrade] = useState<StudentType | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Form state for grade modal
  const [subjectOrAssignmentName, setSubjectOrAssignmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Test');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [continuousAssessment, setContinuousAssessment] = useState('');
  const [externalExamination, setExternalExamination] = useState('');
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [isWAECSubject, setIsWAECSubject] = useState(false);

  if (!context || !context.currentUser || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading gradebook data...</div>;
  }

  const { currentUser, schoolClasses, students, grades, subjects, addGrade, updateGrade, deleteGrade } = context;
  const teacherId = currentUser.teacherId;

  // Get teacher's assigned classes
  const teacherAssignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacherId));
  const selectedClass = schoolClasses.find(sc => sc.id === selectedClassId);
  const studentsInSelectedClass = selectedClass ? students.filter(s => selectedClass.studentIds.includes(s.id)) : [];

  // Get subjects for the selected class
  const classSubjects = useMemo(() => {
    if (!selectedClass) return [];
    return subjects.filter(subject => selectedClass.subjectIds.includes(subject.id));
  }, [selectedClass, subjects]);

  // Filter and sort grades
  const filteredGrades = useMemo(() => {
    if (!selectedClassId) return [];
    
    let filtered = grades.filter(g => g.classId === selectedClassId);
    
    if (selectedTerm !== 'All') {
      filtered = filtered.filter(g => g.term === selectedTerm);
    }
    
    if (assessmentTypeFilter !== 'All') {
      filtered = filtered.filter(g => g.assessmentType === assessmentTypeFilter);
    }
    
    if (subjectFilter !== 'All') {
      filtered = filtered.filter(g => g.subjectId === subjectFilter);
    }
    
    return filtered;
  }, [grades, selectedClassId, selectedTerm, assessmentTypeFilter, subjectFilter]);

  // Calculate student performance summaries
  const studentPerformances: StudentPerformanceSummary[] = useMemo(() => {
    const performances = studentsInSelectedClass.map(student => {
      const studentGrades = filteredGrades.filter(g => g.studentId === student.id);
      
      // Calculate term averages
      const term1Grades = grades.filter(g => g.studentId === student.id && g.classId === selectedClassId && g.term === 1 && g.score && !isNaN(Number(g.score)));
      const term2Grades = grades.filter(g => g.studentId === student.id && g.classId === selectedClassId && g.term === 2 && g.score && !isNaN(Number(g.score)));
      const term3Grades = grades.filter(g => g.studentId === student.id && g.classId === selectedClassId && g.term === 3 && g.score && !isNaN(Number(g.score)));
      
      const term1Avg = term1Grades.length > 0 ? term1Grades.reduce((sum, g) => sum + Number(g.score), 0) / term1Grades.length : 0;
      const term2Avg = term2Grades.length > 0 ? term2Grades.reduce((sum, g) => sum + Number(g.score), 0) / term2Grades.length : 0;
      const term3Avg = term3Grades.length > 0 ? term3Grades.reduce((sum, g) => sum + Number(g.score), 0) / term3Grades.length : 0;

      // Overall average
      const allNumericGrades = studentGrades.filter(g => g.score && !isNaN(Number(g.score)));
      const overallAverage = allNumericGrades.length > 0
        ? allNumericGrades.reduce((sum, g) => sum + Number(g.score), 0) / allNumericGrades.length
        : 0;

      // Credit passes and university eligibility
      const allStudentGrades = grades.filter(g => g.studentId === student.id);
      const creditPasses = allStudentGrades.filter(g => 
        g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
      ).length;

      const gradeData = allStudentGrades
        .filter(g => g.liberianGrade)
        .map(g => ({
          subject: g.subjectOrAssignmentName,
          grade: g.liberianGrade!
        }));
      
      const eligibility = checkUniversityEligibility(gradeData);

      // Last assessment date
      const sortedGrades = studentGrades.sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());
      const lastAssessmentDate = sortedGrades.length > 0 ? sortedGrades[0].dateAssigned : '';

      return {
        student,
        termAverages: { term1: term1Avg, term2: term2Avg, term3: term3Avg },
        overallAverage,
        creditPasses,
        universityEligible: eligibility.isEligible,
        totalAssessments: studentGrades.length,
        lastAssessmentDate
      };
    });

    // Sort performances
    return performances.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case 'performance':
          comparison = a.overallAverage - b.overallAverage;
          break;
        case 'grade':
          comparison = a.student.grade - b.student.grade;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [studentsInSelectedClass, filteredGrades, grades, selectedClassId, sortBy, sortOrder]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    if (studentPerformances.length === 0) return null;
    
    const totalStudents = studentPerformances.length;
    const averageScore = studentPerformances.reduce((sum, p) => sum + p.overallAverage, 0) / totalStudents;
    const universityEligible = studentPerformances.filter(p => p.universityEligible).length;
    const totalAssessments = studentPerformances.reduce((sum, p) => sum + p.totalAssessments, 0);
    
    return {
      totalStudents,
      averageScore,
      universityEligible,
      universityEligibilityRate: (universityEligible / totalStudents) * 100,
      totalAssessments
    };
  }, [studentPerformances]);

  const resetGradeFormFields = () => {
    setSubjectOrAssignmentName('');
    setAssessmentType('Test');
    setScore('');
    setMaxScore(100);
    setContinuousAssessment('');
    setExternalExamination('');
    setDateAssigned(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setTeacherComments('');
    setIsWAECSubject(false);
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
    setAssessmentType(grade.assessmentType || 'Test');
    setScore(String(grade.score));
    setMaxScore(grade.maxScore as number || 100);
    setContinuousAssessment(grade.continuousAssessment ? String(grade.continuousAssessment) : '');
    setExternalExamination(grade.externalExamination ? String(grade.externalExamination) : '');
    setDateAssigned(grade.dateAssigned);
    setDueDate(grade.dueDate || '');
    setTeacherComments(grade.teacherComments || '');
    setIsWAECSubject(grade.isWAECSubject || false);
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
        subjectId: subjectFilter !== 'All' ? subjectFilter : undefined,
        subjectOrAssignmentName,
        assessmentType,
        score: String(finalScore),
        maxScore: maxScore,
        dateAssigned,
        dueDate: dueDate || undefined,
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

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const assessmentTypes: AssessmentType[] = ['Quiz', 'Test', 'Exam', 'Assignment', 'Project', 'Participation', 'Homework', 'Other'];

  // Class selection screen
  if (!selectedClassId) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-gradient-to-r from-green-600 to-red-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">🇱🇷 Comprehensive Teacher Gradebook</h1>
          <p className="text-green-100 mt-1">Class-based grade management with full Liberian educational standards</p>
        </div>
        
        {teacherAssignedClasses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">You are not assigned to any classes.</p>
            <p className="text-gray-500 mt-2">Please contact your administrator to be assigned to classes.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Class to Manage Grades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherAssignedClasses.map(sc => {
                const classGrades = grades.filter(g => g.classId === sc.id);
                const classSubjectNames = sc.subjectIds.map(id => getSubjectName(id)).join(', ');
                
                return (
                  <div 
                    key={sc.id} 
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-l-4 border-green-600 hover:border-green-700"
                    onClick={() => setSelectedClassId(sc.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedClassId(sc.id)}
                  >
                    <h3 className="text-xl font-semibold text-green-700 mb-2">{sc.name}</h3>
                    {sc.description && <p className="text-sm text-gray-500 mb-3">{sc.description}</p>}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span className="font-semibold">{sc.studentIds.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subjects:</span>
                        <span className="font-semibold">{sc.subjectIds.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grades Recorded:</span>
                        <span className="font-semibold">{classGrades.length}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p><strong>Subjects:</strong> {classSubjectNames}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">🇱🇷 {selectedClass?.name}</h1>
          <p className="text-sm text-gray-600">Comprehensive Liberian Standards Gradebook</p>
        </div>
        <Button onClick={() => setSelectedClassId(null)} variant="ghost" size="sm">
          &larr; Back to Class List
        </Button>
      </div>

      {/* Class Statistics */}
      {classStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
            <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600">Class Average</h3>
            <p className="text-2xl font-bold text-green-600">{classStats.averageScore.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600">University Ready</h3>
            <p className="text-2xl font-bold text-purple-600">{classStats.universityEligible}</p>
            <p className="text-xs text-gray-500">{classStats.universityEligibilityRate.toFixed(1)}% of class</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600">Total Assessments</h3>
            <p className="text-2xl font-bold text-yellow-600">{classStats.totalAssessments}</p>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">📚 Grade Management Controls</h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setViewMode('summary')}
              variant={viewMode === 'summary' ? 'primary' : 'ghost'}
              size="sm"
            >
              Summary View
            </Button>
            <Button
              onClick={() => setViewMode('detailed')}
              variant={viewMode === 'detailed' ? 'primary' : 'ghost'}
              size="sm"
            >
              Detailed View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Term</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'performance' | 'grade')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="name">Student Name</option>
              <option value="performance">Performance</option>
              <option value="grade">Grade Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setSelectedTerm('All');
                setAssessmentTypeFilter('All');
                setSubjectFilter('All');
                setSortBy('name');
                setSortOrder('asc');
              }}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Student Performance Display */}
      {studentsInSelectedClass.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 text-lg">No students enrolled in this class.</p>
          <p className="text-gray-500 mt-2">Students need to be assigned to this class to manage their grades.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === 'summary' ? (
            // Summary View
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <h3 className="text-lg font-medium text-green-800">Student Performance Summary</h3>
                <p className="text-sm text-green-600">Overview of all students in {selectedClass?.name}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term 1 Avg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term 2 Avg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term 3 Avg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Avg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Passes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University Ready</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentPerformances.map(performance => (
                      <tr key={performance.student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{performance.student.name}</div>
                              <div className="text-sm text-gray-500">Grade {performance.student.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {performance.termAverages.term1 > 0 ? (
                            <span className={`font-semibold ${
                              performance.termAverages.term1 >= 70 ? 'text-green-600' :
                              performance.termAverages.term1 >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {performance.termAverages.term1.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {performance.termAverages.term2 > 0 ? (
                            <span className={`font-semibold ${
                              performance.termAverages.term2 >= 70 ? 'text-green-600' :
                              performance.termAverages.term2 >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {performance.termAverages.term2.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {performance.termAverages.term3 > 0 ? (
                            <span className={`font-semibold ${
                              performance.termAverages.term3 >= 70 ? 'text-green-600' :
                              performance.termAverages.term3 >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {performance.termAverages.term3.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${
                            performance.overallAverage >= 70 ? 'text-green-600' :
                            performance.overallAverage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {performance.overallAverage > 0 ? `${performance.overallAverage.toFixed(1)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">{performance.creditPasses}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            performance.universityEligible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {performance.universityEligible ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {performance.totalAssessments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => openGradeModalForAdd(performance.student)}
                            variant="primary"
                            size="sm"
                          >
                            Add Grade
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Detailed View
            <div className="space-y-6">
              {studentPerformances.map(performance => {
                const studentGrades = filteredGrades.filter(g => g.studentId === performance.student.id)
                  .sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());

                return (
                  <div key={performance.student.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-green-700">
                          {performance.student.name}
                          <span className="text-sm text-gray-500 font-normal ml-2">(Grade {performance.student.grade})</span>
                        </h3>
                        <div className="flex space-x-6 text-sm text-gray-600 mt-2">
                          <span>Term 1: <strong className={performance.termAverages.term1 >= 70 ? 'text-green-600' : performance.termAverages.term1 >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {performance.termAverages.term1 > 0 ? `${performance.termAverages.term1.toFixed(1)}%` : 'N/A'}
                          </strong></span>
                          <span>Term 2: <strong className={performance.termAverages.term2 >= 70 ? 'text-green-600' : performance.termAverages.term2 >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {performance.termAverages.term2 > 0 ? `${performance.termAverages.term2.toFixed(1)}%` : 'N/A'}
                          </strong></span>
                          <span>Term 3: <strong className={performance.termAverages.term3 >= 70 ? 'text-green-600' : performance.termAverages.term3 >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {performance.termAverages.term3 > 0 ? `${performance.termAverages.term3.toFixed(1)}%` : 'N/A'}
                          </strong></span>
                          <span>Overall: <strong className={performance.overallAverage >= 70 ? 'text-green-600' : performance.overallAverage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {performance.overallAverage > 0 ? `${performance.overallAverage.toFixed(1)}%` : 'N/A'}
                          </strong></span>
                        </div>
                        <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                          <span>Credit Passes: <strong className="text-blue-600">{performance.creditPasses}</strong></span>
                          <span>University Ready: <strong className={performance.universityEligible ? 'text-green-600' : 'text-red-600'}>
                            {performance.universityEligible ? 'Yes' : 'No'}
                          </strong></span>
                          <span>Total Assessments: <strong className="text-purple-600">{performance.totalAssessments}</strong></span>
                        </div>
                      </div>
                      <Button onClick={() => openGradeModalForAdd(performance.student)} variant="secondary" size="sm">
                        Add Grade
                      </Button>
                    </div>

                    {studentGrades.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <p>No grades recorded for current filters.</p>
                        <p className="text-sm mt-1">Click "Add Grade" to record the first assessment.</p>
                      </div>
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
                              <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">CA/External</th>
                              <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">WAEC</th>
                              <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-2 text-left font-medium text-green-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentGrades.map(grade => (
                              <tr key={grade.id} className="hover:bg-gray-50">
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
                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                  {grade.continuousAssessment && grade.externalExamination ? (
                                    <div>
                                      <div>CA: {grade.continuousAssessment}%</div>
                                      <div>Ext: {grade.externalExamination}%</div>
                                    </div>
                                  ) : 'N/A'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {grade.isWAECSubject && (
                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                      WAEC
                                    </span>
                                  )}
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
        </div>
      )}

      {/* Grade Modal */}
      {isGradeModalOpen && currentStudentForGrade && (
        <Modal
          isOpen={isGradeModalOpen}
          onClose={() => setIsGradeModalOpen(false)}
          title={`🇱🇷 ${editingGrade ? 'Edit' : 'Add'} Grade for ${currentStudentForGrade.name}`}
        >
          <form onSubmit={handleGradeFormSubmit} className="space-y-4">
            <Input
              label="Assignment/Assessment Name"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Term</label>
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

            {/* Liberian Assessment Method */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">🇱🇷 Liberian Assessment Method</h4>
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

            {/* Alternative Direct Score Entry */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">Alternative: Direct Score Entry</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Direct Score (%)"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  disabled={isSubmittingGrade}
                />
                <Input
                  label="Maximum Score"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  placeholder="100"
                  min="1"
                  disabled={isSubmittingGrade}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Use this if you're not using the Liberian CA/External method above
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date Assigned"
                type="date"
                value={dateAssigned}
                onChange={(e) => setDateAssigned(e.target.value)}
                required
                disabled={isSubmittingGrade}
              />
              <Input
                label="Due Date (Optional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmittingGrade}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Comments</label>
              <textarea
                value={teacherComments}
                onChange={(e) => setTeacherComments(e.target.value)}
                rows={3}
                placeholder="Comments about student performance, areas for improvement, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                disabled={isSubmittingGrade}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isWAECSubject}
                  onChange={(e) => setIsWAECSubject(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  disabled={isSubmittingGrade}
                />
                <span className="text-sm text-gray-700">WAEC Subject (University Preparation)</span>
              </label>
            </div>

            {/* Grade Preview */}
            {(score || (continuousAssessment && externalExamination)) && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Grade Preview</h4>
                {continuousAssessment && externalExamination ? (
                  <div className="text-sm text-yellow-700">
                    <p>Calculated Final Score: <strong>{((Number(continuousAssessment) * 0.3) + (Number(externalExamination) * 0.7)).toFixed(1)}%</strong></p>
                    <p>Liberian Grade: <strong>{percentageToLiberianGrade(((Number(continuousAssessment) * 0.3) + (Number(externalExamination) * 0.7)))}</strong></p>
                    <p>Credit Status: <strong>{LIBERIAN_GRADE_SCALE[percentageToLiberianGrade(((Number(continuousAssessment) * 0.3) + (Number(externalExamination) * 0.7)))].isCredit ? 'Credit Pass' : 'Not Credit'}</strong></p>
                  </div>
                ) : score ? (
                  <div className="text-sm text-yellow-700">
                    <p>Score: <strong>{score}%</strong></p>
                    <p>Liberian Grade: <strong>{percentageToLiberianGrade(Number(score))}</strong></p>
                    <p>Credit Status: <strong>{LIBERIAN_GRADE_SCALE[percentageToLiberianGrade(Number(score))].isCredit ? 'Credit Pass' : 'Not Credit'}</strong></p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                onClick={() => setIsGradeModalOpen(false)}
                variant="ghost"
                disabled={isSubmittingGrade}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingGrade}>
                {editingGrade ? "Update Grade" : "Add Grade"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ComprehensiveTeacherGradebook;
