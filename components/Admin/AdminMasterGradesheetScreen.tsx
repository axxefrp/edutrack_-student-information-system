import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student, Grade, Subject, Teacher, AssessmentType, LiberianGradeScale } from '../../types';
import { 
  LIBERIAN_GRADE_SCALE, 
  percentageToLiberianGrade, 
  checkUniversityEligibility,
  calculateAggregateScore,
  getDivisionClassification,
  LIBERIAN_CORE_SUBJECTS,
  WAEC_SUBJECTS 
} from '../../utils/liberianGradingSystem';
import Button from '../Shared/Button';

interface GradeAnalytics {
  totalStudents: number;
  totalGrades: number;
  averageScore: number;
  creditPassRate: number;
  universityEligible: number;
  gradeDistribution: Record<LiberianGradeScale, number>;
}

interface StudentPerformance {
  student: Student;
  grades: Grade[];
  termAverages: { term1: number; term2: number; term3: number };
  overallAverage: number;
  creditPasses: number;
  universityEligible: boolean;
  division: string;
}

const AdminMasterGradesheetScreen: React.FC = () => {
  const context = useContext(AppContext);

  // Filter states
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | 'All'>('All');
  const [selectedClassId, setSelectedClassId] = useState<string | 'All'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'All'>('All');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | 'All'>('All');
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3 | 'All'>('All');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType | 'All'>('All');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics' | 'reports'>('overview');
  const [showWAECOnly, setShowWAECOnly] = useState(false);

  if (!context || !context.currentUser) {
    return <div className="p-6 text-gray-700">Loading master gradesheet data...</div>;
  }

  const { students, teachers, schoolClasses, grades, subjects } = context;

  // Get unique grade levels
  const gradeLevels = useMemo(() => {
    const levels = [...new Set(students.map(s => s.grade))].sort((a, b) => a - b);
    return levels;
  }, [students]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filteredStudents = students;
    let filteredGrades = grades;
    let filteredClasses = schoolClasses;

    // Filter by grade level
    if (selectedGradeLevel !== 'All') {
      filteredStudents = filteredStudents.filter(s => s.grade === selectedGradeLevel);
    }

    // Filter by class
    if (selectedClassId !== 'All') {
      filteredClasses = filteredClasses.filter(c => c.id === selectedClassId);
      filteredStudents = filteredStudents.filter(s => 
        filteredClasses.some(c => c.studentIds.includes(s.id))
      );
      filteredGrades = filteredGrades.filter(g => g.classId === selectedClassId);
    }

    // Filter by subject
    if (selectedSubjectId !== 'All') {
      filteredGrades = filteredGrades.filter(g => g.subjectId === selectedSubjectId);
    }

    // Filter by teacher
    if (selectedTeacherId !== 'All') {
      const teacherClasses = schoolClasses.filter(c => c.teacherIds.includes(selectedTeacherId));
      filteredGrades = filteredGrades.filter(g => 
        teacherClasses.some(c => c.id === g.classId)
      );
    }

    // Filter by term
    if (selectedTerm !== 'All') {
      filteredGrades = filteredGrades.filter(g => g.term === selectedTerm);
    }

    // Filter by assessment type
    if (selectedAssessmentType !== 'All') {
      filteredGrades = filteredGrades.filter(g => g.assessmentType === selectedAssessmentType);
    }

    // Filter WAEC subjects only
    if (showWAECOnly) {
      filteredGrades = filteredGrades.filter(g => g.isWAECSubject);
    }

    // Only include students who have grades in the filtered set
    const studentIdsWithGrades = [...new Set(filteredGrades.map(g => g.studentId))];
    filteredStudents = filteredStudents.filter(s => studentIdsWithGrades.includes(s.id));

    return { filteredStudents, filteredGrades, filteredClasses };
  }, [students, grades, schoolClasses, selectedGradeLevel, selectedClassId, selectedSubjectId, selectedTeacherId, selectedTerm, selectedAssessmentType, showWAECOnly]);

  // Calculate analytics
  const analytics: GradeAnalytics = useMemo(() => {
    const { filteredGrades } = filteredData;
    
    const totalStudents = filteredData.filteredStudents.length;
    const totalGrades = filteredGrades.length;
    
    const numericGrades = filteredGrades
      .filter(g => g.score && !isNaN(Number(g.score)))
      .map(g => Number(g.score));
    
    const averageScore = numericGrades.length > 0 
      ? numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length 
      : 0;

    const gradeDistribution: Record<LiberianGradeScale, number> = {
      'A1': 0, 'A2': 0, 'A3': 0, 'B2': 0, 'B3': 0, 'C4': 0,
      'C5': 0, 'C6': 0, 'D7': 0, 'E8': 0, 'F9': 0
    };

    let creditPasses = 0;
    filteredGrades.forEach(grade => {
      if (grade.liberianGrade) {
        gradeDistribution[grade.liberianGrade]++;
        if (LIBERIAN_GRADE_SCALE[grade.liberianGrade].isCredit) {
          creditPasses++;
        }
      }
    });

    const creditPassRate = totalGrades > 0 ? (creditPasses / totalGrades) * 100 : 0;

    // Calculate university eligibility
    let universityEligible = 0;
    filteredData.filteredStudents.forEach(student => {
      const studentGrades = filteredGrades.filter(g => g.studentId === student.id);
      const gradeData = studentGrades
        .filter(g => g.liberianGrade)
        .map(g => ({
          subject: g.subjectOrAssignmentName,
          grade: g.liberianGrade!
        }));
      
      const eligibility = checkUniversityEligibility(gradeData);
      if (eligibility.isEligible) {
        universityEligible++;
      }
    });

    return {
      totalStudents,
      totalGrades,
      averageScore,
      creditPassRate,
      universityEligible,
      gradeDistribution
    };
  }, [filteredData]);

  // Calculate student performance data
  const studentPerformances: StudentPerformance[] = useMemo(() => {
    return filteredData.filteredStudents.map(student => {
      const studentGrades = filteredData.filteredGrades.filter(g => g.studentId === student.id);
      
      // Calculate term averages
      const term1Grades = studentGrades.filter(g => g.term === 1 && g.score && !isNaN(Number(g.score)));
      const term2Grades = studentGrades.filter(g => g.term === 2 && g.score && !isNaN(Number(g.score)));
      const term3Grades = studentGrades.filter(g => g.term === 3 && g.score && !isNaN(Number(g.score)));
      
      const term1Avg = term1Grades.length > 0 
        ? term1Grades.reduce((sum, g) => sum + Number(g.score), 0) / term1Grades.length 
        : 0;
      const term2Avg = term2Grades.length > 0 
        ? term2Grades.reduce((sum, g) => sum + Number(g.score), 0) / term2Grades.length 
        : 0;
      const term3Avg = term3Grades.length > 0 
        ? term3Grades.reduce((sum, g) => sum + Number(g.score), 0) / term3Grades.length 
        : 0;

      const allNumericGrades = studentGrades.filter(g => g.score && !isNaN(Number(g.score)));
      const overallAverage = allNumericGrades.length > 0
        ? allNumericGrades.reduce((sum, g) => sum + Number(g.score), 0) / allNumericGrades.length
        : 0;

      // Count credit passes
      const creditPasses = studentGrades.filter(g => 
        g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
      ).length;

      // Check university eligibility
      const gradeData = studentGrades
        .filter(g => g.liberianGrade)
        .map(g => ({
          subject: g.subjectOrAssignmentName,
          grade: g.liberianGrade!
        }));
      
      const eligibility = checkUniversityEligibility(gradeData);
      const liberianGrades = studentGrades
        .filter(g => g.liberianGrade)
        .map(g => g.liberianGrade!);
      
      const aggregateScore = calculateAggregateScore(liberianGrades);
      const hasEnglishMathCredit = eligibility.hasEnglishCredit && eligibility.hasMathCredit;
      const divisionInfo = getDivisionClassification(aggregateScore, hasEnglishMathCredit);

      return {
        student,
        grades: studentGrades,
        termAverages: { term1: term1Avg, term2: term2Avg, term3: term3Avg },
        overallAverage,
        creditPasses,
        universityEligible: eligibility.isEligible,
        division: divisionInfo.division
      };
    });
  }, [filteredData]);

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const getClassName = (classId: string): string => {
    const schoolClass = schoolClasses.find(c => c.id === classId);
    return schoolClass ? schoolClass.name : 'Unknown Class';
  };

  const exportGrades = () => {
    // Placeholder for export functionality
    alert('Grade export functionality would be implemented here');
  };

  const importGrades = () => {
    // Placeholder for import functionality
    alert('Grade import functionality would be implemented here');
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-red-600 text-white p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🇱🇷 Master Gradesheet - Administrative Overview</h1>
            <p className="text-green-100 mt-1">Centralized grade management aligned with Liberian Ministry of Education standards</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportGrades} variant="secondary" size="sm">
              📊 Export Grades
            </Button>
            <Button onClick={importGrades} variant="secondary" size="sm">
              📥 Import Grades
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Total Grades</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.totalGrades}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
          <p className="text-2xl font-bold text-yellow-600">{analytics.averageScore.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600">Credit Pass Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{analytics.creditPassRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-600">University Eligible</h3>
          <p className="text-2xl font-bold text-red-600">{analytics.universityEligible}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">🔍 Advanced Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              value={selectedGradeLevel}
              onChange={(e) => setSelectedGradeLevel(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Grades</option>
              {gradeLevels.map(level => (
                <option key={level} value={level}>Grade {level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Classes</option>
              {schoolClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {LIBERIAN_CORE_SUBJECTS.includes(subject.name) ? '(Core)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as 1 | 2 | 3 | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Terms</option>
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
            <select
              value={selectedAssessmentType}
              onChange={(e) => setSelectedAssessmentType(e.target.value as AssessmentType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Types</option>
              <option value="Quiz">Quiz</option>
              <option value="Test">Test</option>
              <option value="Exam">Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showWAECOnly}
                onChange={(e) => setShowWAECOnly(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">WAEC Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: '📊 Overview', icon: '📊' },
              { key: 'detailed', label: '📋 Detailed View', icon: '📋' },
              { key: 'analytics', label: '📈 Analytics', icon: '📈' },
              { key: 'reports', label: '📄 Reports', icon: '📄' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {viewMode === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Student Performance Overview</h3>

              {studentPerformances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No student data available for the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Term 1 Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Term 2 Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Term 3 Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Overall Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Credit Passes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">University Ready</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Division</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentPerformances.map(performance => (
                        <tr key={performance.student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{performance.student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Grade {performance.student.grade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {performance.termAverages.term1 > 0 ? `${performance.termAverages.term1.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {performance.termAverages.term2 > 0 ? `${performance.termAverages.term2.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {performance.termAverages.term3 > 0 ? `${performance.termAverages.term3.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${
                              performance.overallAverage >= 70 ? 'text-green-600' :
                              performance.overallAverage >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {performance.overallAverage > 0 ? `${performance.overallAverage.toFixed(1)}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {performance.creditPasses}
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              performance.division === 'Division I' ? 'bg-gold-100 text-gold-800' :
                              performance.division === 'Division II' ? 'bg-silver-100 text-silver-800' :
                              performance.division === 'Division III' ? 'bg-bronze-100 text-bronze-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {performance.division}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Grade Records</h3>

              {filteredData.filteredGrades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No grade records available for the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Liberian Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Term</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">CA/External</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">WAEC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.filteredGrades.map(grade => {
                        const student = students.find(s => s.id === grade.studentId);
                        const subject = subjects.find(s => s.id === grade.subjectId);

                        return (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student?.name || 'Unknown Student'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getClassName(grade.classId)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subject?.name || 'Unknown Subject'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.subjectOrAssignmentName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {grade.assessmentType}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {grade.score}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
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
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              Term {grade.term}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                              {grade.continuousAssessment && grade.externalExamination ? (
                                <div>
                                  <div>CA: {grade.continuousAssessment}%</div>
                                  <div>Ext: {grade.externalExamination}%</div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {grade.isWAECSubject && (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                  WAEC
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(grade.dateAssigned).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Academic Performance Analytics</h3>

              {/* Grade Distribution Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Liberian Grade Distribution (WAEC Scale)</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
                      const gradeInfo = LIBERIAN_GRADE_SCALE[grade as LiberianGradeScale];
                      const percentage = analytics.totalGrades > 0 ? (count / analytics.totalGrades) * 100 : 0;

                      return (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              gradeInfo.isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {grade}
                            </span>
                            <span className="text-sm text-gray-600">{gradeInfo.description}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${gradeInfo.isCredit ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-12">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">University Admission Readiness</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Students with 5+ Credit Passes:</span>
                      <span className="text-lg font-bold text-green-600">{analytics.universityEligible}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">University Eligibility Rate:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analytics.totalStudents > 0 ? ((analytics.universityEligible / analytics.totalStudents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                          style={{
                            width: `${analytics.totalStudents > 0 ? (analytics.universityEligible / analytics.totalStudents) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Performance Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-4">Subject Performance Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(subject => {
                    const subjectGrades = filteredData.filteredGrades.filter(g => g.subjectId === subject.id);
                    const numericGrades = subjectGrades.filter(g => g.score && !isNaN(Number(g.score)));
                    const average = numericGrades.length > 0
                      ? numericGrades.reduce((sum, g) => sum + Number(g.score), 0) / numericGrades.length
                      : 0;
                    const creditPasses = subjectGrades.filter(g =>
                      g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
                    ).length;
                    const creditRate = subjectGrades.length > 0 ? (creditPasses / subjectGrades.length) * 100 : 0;

                    if (subjectGrades.length === 0) return null;

                    return (
                      <div key={subject.id} className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-800 text-sm mb-2">
                          {subject.name}
                          {LIBERIAN_CORE_SUBJECTS.includes(subject.name) && (
                            <span className="ml-1 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Core</span>
                          )}
                        </h5>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>Grades: {subjectGrades.length}</div>
                          <div>Average: {average.toFixed(1)}%</div>
                          <div>Credit Rate: {creditRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Performance Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-4">Teacher Grading Overview</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grades Entered</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credit Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map(teacher => {
                        const teacherClasses = schoolClasses.filter(c => c.teacherIds.includes(teacher.id));
                        const teacherGrades = filteredData.filteredGrades.filter(g =>
                          teacherClasses.some(c => c.id === g.classId)
                        );
                        const numericGrades = teacherGrades.filter(g => g.score && !isNaN(Number(g.score)));
                        const average = numericGrades.length > 0
                          ? numericGrades.reduce((sum, g) => sum + Number(g.score), 0) / numericGrades.length
                          : 0;
                        const creditPasses = teacherGrades.filter(g =>
                          g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
                        ).length;
                        const creditRate = teacherGrades.length > 0 ? (creditPasses / teacherGrades.length) * 100 : 0;

                        if (teacherGrades.length === 0) return null;

                        return (
                          <tr key={teacher.id}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{teacher.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{teacherClasses.length}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{teacherGrades.length}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{average.toFixed(1)}%</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{creditRate.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Comprehensive Academic Reports</h3>

              {/* Report Generation Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">📊 Term Report Cards</h4>
                  <p className="text-sm text-gray-600 mb-3">Generate individual student report cards for selected term with Liberian grading standards.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('Term report generation would be implemented here')}>
                    Generate Reports
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">🎓 University Readiness Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Comprehensive analysis of students meeting university admission requirements.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('University readiness report would be implemented here')}>
                    Generate Report
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">📈 Academic Progress Tracking</h4>
                  <p className="text-sm text-gray-600 mb-3">Term-over-term progress analysis for all students and subjects.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('Progress tracking report would be implemented here')}>
                    Generate Report
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">🏆 WAEC Performance Analysis</h4>
                  <p className="text-sm text-gray-600 mb-3">Detailed analysis of WAEC subject performance and university eligibility.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('WAEC analysis report would be implemented here')}>
                    Generate Report
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">👨‍🏫 Teacher Performance Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Analysis of teacher grading patterns, workload, and student outcomes.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('Teacher performance report would be implemented here')}>
                    Generate Report
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">📋 Ministry of Education Compliance</h4>
                  <p className="text-sm text-gray-600 mb-3">Comprehensive report ensuring alignment with Liberian MoE standards.</p>
                  <Button variant="primary" size="sm" onClick={() => alert('MoE compliance report would be implemented here')}>
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Quick Statistics Summary */}
              <div className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-lg font-medium text-gray-800 mb-4">🇱🇷 Liberian Educational Standards Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.totalStudents}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.creditPassRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Credit Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.universityEligible}</div>
                    <div className="text-sm text-gray-600">University Eligible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.averageScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Overall Average</div>
                  </div>
                </div>
              </div>

              {/* Audit Trail Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📝 Audit Trail & Compliance</h4>
                <p className="text-sm text-yellow-700">
                  All grade entries and modifications are tracked for Ministry of Education compliance.
                  Administrative actions are logged with timestamps and user identification for full accountability.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMasterGradesheetScreen;
