import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student, Grade, Subject, LiberianGradeScale } from '../../types';
import { 
  LIBERIAN_GRADE_SCALE, 
  percentageToLiberianGrade, 
  calculateLiberianFinalGrade,
  checkUniversityEligibility,
  LIBERIAN_CORE_SUBJECTS,
  WAEC_SUBJECTS 
} from '../../utils/liberianGradingSystem';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';

interface FinalGradeData {
  studentId: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  continuousAssessment: number;
  externalExamination: number;
  finalScore: number;
  liberianGrade: LiberianGradeScale;
  isCredit: boolean;
  isWAECSubject: boolean;
  submissionStatus: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

interface ClassSubmissionSummary {
  classId: string;
  className: string;
  totalStudents: number;
  totalSubjects: number;
  gradesSubmitted: number;
  gradesApproved: number;
  submissionComplete: boolean;
  lastSubmissionDate?: string;
}

const TeacherMasterGradesheetScreen: React.FC = () => {
  const context = useContext(AppContext);

  // State management
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(1);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'class-detail' | 'submission-review'>('overview');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [selectedGradesForSubmission, setSelectedGradesForSubmission] = useState<FinalGradeData[]>([]);

  if (!context || !context.currentUser || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading Master Gradesheet data...</div>;
  }

  const { currentUser, schoolClasses, students, grades, subjects, updateGrade } = context;
  const teacherId = currentUser.teacherId;

  // Get teacher's assigned classes
  const teacherAssignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacherId));

  // Calculate final grades for all students in teacher's classes
  const finalGradesData: FinalGradeData[] = useMemo(() => {
    const finalGrades: FinalGradeData[] = [];

    teacherAssignedClasses.forEach(schoolClass => {
      const classStudents = students.filter(s => schoolClass.studentIds.includes(s.id));
      const classSubjects = subjects.filter(s => schoolClass.subjectIds.includes(s.id));

      classStudents.forEach(student => {
        classSubjects.forEach(subject => {
          // Get all grades for this student in this subject for the selected term
          const studentSubjectGrades = grades.filter(g => 
            g.studentId === student.id && 
            g.classId === schoolClass.id && 
            g.subjectId === subject.id && 
            g.term === selectedTerm
          );

          if (studentSubjectGrades.length > 0) {
            // Calculate continuous assessment average (30%)
            const caGrades = studentSubjectGrades.filter(g => g.continuousAssessment);
            const caAverage = caGrades.length > 0 
              ? caGrades.reduce((sum, g) => sum + (g.continuousAssessment || 0), 0) / caGrades.length 
              : 0;

            // Calculate external examination average (70%)
            const extGrades = studentSubjectGrades.filter(g => g.externalExamination);
            const extAverage = extGrades.length > 0 
              ? extGrades.reduce((sum, g) => sum + (g.externalExamination || 0), 0) / extGrades.length 
              : 0;

            // Calculate final score using Liberian method
            let finalScore = 0;
            let liberianGrade: LiberianGradeScale = 'F9';

            if (caAverage > 0 && extAverage > 0) {
              const result = calculateLiberianFinalGrade(caAverage, extAverage);
              finalScore = result.finalScore;
              liberianGrade = result.liberianGrade;
            } else if (caAverage > 0 || extAverage > 0) {
              // Use available score if only one component exists
              finalScore = caAverage > 0 ? caAverage : extAverage;
              liberianGrade = percentageToLiberianGrade(finalScore);
            }

            // Check submission status
            const submittedGrade = studentSubjectGrades.find(g => g.submittedToAdmin);
            const submissionStatus = submittedGrade?.submissionStatus || 'Draft';

            finalGrades.push({
              studentId: student.id,
              classId: schoolClass.id,
              subjectId: subject.id,
              subjectName: subject.name,
              continuousAssessment: caAverage,
              externalExamination: extAverage,
              finalScore,
              liberianGrade,
              isCredit: LIBERIAN_GRADE_SCALE[liberianGrade].isCredit,
              isWAECSubject: WAEC_SUBJECTS.includes(subject.name),
              submissionStatus
            });
          }
        });
      });
    });

    return finalGrades;
  }, [teacherAssignedClasses, students, subjects, grades, selectedTerm]);

  // Calculate class submission summaries
  const classSubmissionSummaries: ClassSubmissionSummary[] = useMemo(() => {
    return teacherAssignedClasses.map(schoolClass => {
      const classGrades = finalGradesData.filter(fg => fg.classId === schoolClass.id);
      const classStudents = students.filter(s => schoolClass.studentIds.includes(s.id));
      const classSubjects = subjects.filter(s => schoolClass.subjectIds.includes(s.id));
      
      const totalExpectedGrades = classStudents.length * classSubjects.length;
      const gradesSubmitted = classGrades.filter(fg => fg.submissionStatus === 'Submitted' || fg.submissionStatus === 'Approved').length;
      const gradesApproved = classGrades.filter(fg => fg.submissionStatus === 'Approved').length;
      
      // Find last submission date
      const submittedGrades = grades.filter(g => 
        g.classId === schoolClass.id && 
        g.submittedToAdmin && 
        g.submittedDate
      );
      const lastSubmissionDate = submittedGrades.length > 0 
        ? submittedGrades.sort((a, b) => new Date(b.submittedDate!).getTime() - new Date(a.submittedDate!).getTime())[0].submittedDate
        : undefined;

      return {
        classId: schoolClass.id,
        className: schoolClass.name,
        totalStudents: classStudents.length,
        totalSubjects: classSubjects.length,
        gradesSubmitted,
        gradesApproved,
        submissionComplete: gradesSubmitted === totalExpectedGrades,
        lastSubmissionDate
      };
    });
  }, [teacherAssignedClasses, finalGradesData, students, subjects, grades]);

  const handleSubmitGrades = async (gradesToSubmit: FinalGradeData[]) => {
    setSubmissionInProgress(true);
    
    try {
      // Update each grade with submission information
      for (const gradeData of gradesToSubmit) {
        const existingGrades = grades.filter(g => 
          g.studentId === gradeData.studentId && 
          g.classId === gradeData.classId && 
          g.subjectId === gradeData.subjectId && 
          g.term === selectedTerm
        );

        // Create or update final grade record
        if (existingGrades.length > 0) {
          // Update the most recent grade with submission info
          const latestGrade = existingGrades.sort((a, b) => 
            new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime()
          )[0];

          const updatedGrade: Grade = {
            ...latestGrade,
            continuousAssessment: gradeData.continuousAssessment,
            externalExamination: gradeData.externalExamination,
            score: String(gradeData.finalScore),
            liberianGrade: gradeData.liberianGrade,
            submissionStatus: 'Submitted',
            submittedToAdmin: true,
            submittedDate: new Date().toISOString(),
            submittedBy: teacherId,
            isFinalGrade: true,
            isLocked: true
          };

          await updateGrade(updatedGrade);
        }
      }

      setSubmissionInProgress(false);
      setIsSubmissionModalOpen(false);
      setSelectedGradesForSubmission([]);
      
      // Show success notification
      alert(`Successfully submitted ${gradesToSubmit.length} final grades to administration for review.`);
      
    } catch (error) {
      console.error('Error submitting grades:', error);
      setSubmissionInProgress(false);
      alert('Error submitting grades. Please try again.');
    }
  };

  const openSubmissionModal = (classId: string) => {
    const classGrades = finalGradesData.filter(fg => 
      fg.classId === classId && 
      fg.submissionStatus === 'Draft'
    );
    setSelectedGradesForSubmission(classGrades);
    setIsSubmissionModalOpen(true);
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getClassName = (classId: string): string => {
    const schoolClass = schoolClasses.find(c => c.id === classId);
    return schoolClass ? schoolClass.name : 'Unknown Class';
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-red-600 text-white p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🇱🇷 Teacher Master Gradesheet</h1>
            <p className="text-green-100 mt-1">Final grade compilation and submission for Ministry of Education compliance</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Academic Term</p>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(Number(e.target.value) as 1 | 2 | 3)}
              className="mt-1 px-3 py-2 bg-white text-gray-800 rounded-md focus:ring-2 focus:ring-green-300"
            >
              <option value={1}>Term 1 (Sep-Dec)</option>
              <option value={2}>Term 2 (Jan-Apr)</option>
              <option value={3}>Term 3 (May-Jul)</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: '📊 Overview', icon: '📊' },
              { key: 'class-detail', label: '📋 Class Details', icon: '📋' },
              { key: 'submission-review', label: '📤 Submission Review', icon: '📤' }
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
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Class Submission Overview - Term {selectedTerm}</h3>
          
          {classSubmissionSummaries.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 text-lg">No classes assigned for grade submission.</p>
              <p className="text-gray-500 mt-2">Contact your administrator to be assigned to classes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classSubmissionSummaries.map(summary => (
                <div 
                  key={summary.classId} 
                  className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${
                    summary.submissionComplete 
                      ? 'border-green-500' 
                      : summary.gradesSubmitted > 0 
                        ? 'border-yellow-500' 
                        : 'border-red-500'
                  }`}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{summary.className}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="font-semibold">{summary.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subjects:</span>
                      <span className="font-semibold">{summary.totalSubjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grades Submitted:</span>
                      <span className="font-semibold">{summary.gradesSubmitted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grades Approved:</span>
                      <span className="font-semibold text-green-600">{summary.gradesApproved}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Submission Progress</span>
                      <span>{Math.round((summary.gradesSubmitted / (summary.totalStudents * summary.totalSubjects)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          summary.submissionComplete ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ 
                          width: `${Math.min((summary.gradesSubmitted / (summary.totalStudents * summary.totalSubjects)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {summary.lastSubmissionDate && (
                    <p className="text-xs text-gray-500 mb-3">
                      Last submitted: {new Date(summary.lastSubmissionDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedClassId(summary.classId);
                        setViewMode('class-detail');
                      }}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    {!summary.submissionComplete && (
                      <Button
                        onClick={() => openSubmissionModal(summary.classId)}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Submit Grades
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Class Detail Mode */}
      {viewMode === 'class-detail' && selectedClassId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Final Grades: {getClassName(selectedClassId)} - Term {selectedTerm}
            </h3>
            <Button
              onClick={() => setViewMode('overview')}
              variant="ghost"
              size="sm"
            >
              ← Back to Overview
            </Button>
          </div>

          {(() => {
            const classGrades = finalGradesData.filter(fg => fg.classId === selectedClassId);
            const classStudents = [...new Set(classGrades.map(fg => fg.studentId))];

            if (classGrades.length === 0) {
              return (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 text-lg">No final grades calculated for this class.</p>
                  <p className="text-gray-500 mt-2">Ensure all continuous assessments and external examinations are recorded.</p>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {classStudents.map(studentId => {
                  const studentGrades = classGrades.filter(fg => fg.studentId === studentId);
                  const studentName = getStudentName(studentId);

                  // Calculate student statistics
                  const creditPasses = studentGrades.filter(fg => fg.isCredit).length;
                  const waecSubjects = studentGrades.filter(fg => fg.isWAECSubject);
                  const averageScore = studentGrades.length > 0
                    ? studentGrades.reduce((sum, fg) => sum + fg.finalScore, 0) / studentGrades.length
                    : 0;

                  // Check university eligibility
                  const gradeData = studentGrades.map(fg => ({
                    subject: fg.subjectName,
                    grade: fg.liberianGrade
                  }));
                  const eligibility = checkUniversityEligibility(gradeData);

                  return (
                    <div key={studentId} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-blue-700">{studentName}</h4>
                          <div className="flex space-x-6 text-sm text-gray-600 mt-2">
                            <span>Average: <strong className={averageScore >= 70 ? 'text-green-600' : averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                              {averageScore.toFixed(1)}%
                            </strong></span>
                            <span>Credit Passes: <strong className="text-blue-600">{creditPasses}</strong></span>
                            <span>WAEC Subjects: <strong className="text-purple-600">{waecSubjects.length}</strong></span>
                            <span>University Ready: <strong className={eligibility.isEligible ? 'text-green-600' : 'text-red-600'}>
                              {eligibility.isEligible ? 'Yes' : 'No'}
                            </strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">Subject</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">CA (30%)</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">External (70%)</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">Final Score</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">Liberian Grade</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">WAEC</th>
                              <th className="px-4 py-2 text-left font-medium text-blue-700 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentGrades.map(grade => (
                              <tr key={`${grade.studentId}-${grade.subjectId}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                                  {grade.subjectName}
                                  {LIBERIAN_CORE_SUBJECTS.includes(grade.subjectName) && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Core</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                                  {grade.continuousAssessment > 0 ? `${grade.continuousAssessment.toFixed(1)}%` : 'N/A'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                                  {grade.externalExamination > 0 ? `${grade.externalExamination.toFixed(1)}%` : 'N/A'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900">
                                  {grade.finalScore.toFixed(1)}%
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                                    grade.isCredit
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {grade.liberianGrade}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {grade.isWAECSubject && (
                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                      WAEC
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    grade.submissionStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                    grade.submissionStatus === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                    grade.submissionStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {grade.submissionStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Submission Review Mode */}
      {viewMode === 'submission-review' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Grade Submission History - Term {selectedTerm}</h3>

          {(() => {
            const submittedGrades = finalGradesData.filter(fg =>
              fg.submissionStatus === 'Submitted' || fg.submissionStatus === 'Approved' || fg.submissionStatus === 'Rejected'
            );

            if (submittedGrades.length === 0) {
              return (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 text-lg">No grades have been submitted yet for Term {selectedTerm}.</p>
                  <p className="text-gray-500 mt-2">Use the Overview tab to submit final grades to administration.</p>
                </div>
              );
            }

            // Group by class
            const gradesByClass = submittedGrades.reduce((acc, grade) => {
              if (!acc[grade.classId]) {
                acc[grade.classId] = [];
              }
              acc[grade.classId].push(grade);
              return acc;
            }, {} as Record<string, FinalGradeData[]>);

            return (
              <div className="space-y-6">
                {Object.entries(gradesByClass).map(([classId, classGrades]) => (
                  <div key={classId} className="bg-white p-6 rounded-xl shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">{getClassName(classId)}</h4>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Final Score</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Liberian Grade</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {classGrades.map(grade => (
                            <tr key={`${grade.studentId}-${grade.subjectId}`} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                                {getStudentName(grade.studentId)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                                {grade.subjectName}
                                {grade.isWAECSubject && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">WAEC</span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900">
                                {grade.finalScore.toFixed(1)}%
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-bold rounded ${
                                  grade.isCredit
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {grade.liberianGrade}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  grade.submissionStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                  grade.submissionStatus === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {grade.submissionStatus}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                                {/* This would come from the actual grade record */}
                                {new Date().toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Grade Submission Modal */}
      {isSubmissionModalOpen && (
        <Modal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          title="🇱🇷 Submit Final Grades to Administration"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notice</h4>
              <p className="text-sm text-yellow-700">
                Once submitted, these final grades will be locked and cannot be modified without administrative approval.
                Please review all grades carefully before submission.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">📋 Submission Summary</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Class:</strong> {selectedGradesForSubmission.length > 0 ? getClassName(selectedGradesForSubmission[0].classId) : ''}</p>
                <p><strong>Term:</strong> {selectedTerm}</p>
                <p><strong>Total Grades:</strong> {selectedGradesForSubmission.length}</p>
                <p><strong>Students Affected:</strong> {[...new Set(selectedGradesForSubmission.map(g => g.studentId))].length}</p>
                <p><strong>Subjects:</strong> {[...new Set(selectedGradesForSubmission.map(g => g.subjectName))].join(', ')}</p>
              </div>
            </div>

            {selectedGradesForSubmission.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGradesForSubmission.map(grade => (
                      <tr key={`${grade.studentId}-${grade.subjectId}`}>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-900">{getStudentName(grade.studentId)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-700">{grade.subjectName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            grade.isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {grade.liberianGrade} ({grade.finalScore.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {grade.isCredit ? (
                            <span className="text-green-600 font-medium">✓ Credit</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ No Credit</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => setIsSubmissionModalOpen(false)}
                variant="ghost"
                disabled={submissionInProgress}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmitGrades(selectedGradesForSubmission)}
                variant="primary"
                loading={submissionInProgress}
                disabled={selectedGradesForSubmission.length === 0}
              >
                Submit {selectedGradesForSubmission.length} Final Grades
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherMasterGradesheetScreen;
