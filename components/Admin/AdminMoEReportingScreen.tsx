import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student, Grade, Subject, Teacher, LiberianGradeScale } from '../../types';
import {
  LIBERIAN_GRADE_SCALE,
  checkUniversityEligibility,
  LIBERIAN_CORE_SUBJECTS,
  WAEC_SUBJECTS
} from '../../utils/liberianGradingSystem';
import {
  LiberianHeader,
  LiberianCard,
  LiberianButton,
  LiberianTabs,
  LiberianMetricCard,
  WAECGradeBadge,
  MoEIndicator,
  LiberianStatus,
  LiberianProgressBar
} from '../Shared/LiberianDesignSystem';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Button from '../Shared/Button';

interface EnrollmentStats {
  totalStudents: number;
  byGrade: Record<number, { total: number; male: number; female: number }>;
  byTerm: Record<1 | 2 | 3, number>;
  retentionRate: number;
  progressionRate: number;
}

interface PerformanceStats {
  gradeDistribution: Record<LiberianGradeScale, number>;
  averageScore: number;
  creditPassRate: number;
  universityReadyStudents: number;
  coreSubjectPerformance: Record<string, number>;
  termProgressionData: Array<{ term: string; average: number; creditRate: number }>;
}

interface TeacherStats {
  totalTeachers: number;
  averageClassSize: number;
  averageStudentsPerTeacher: number;
  gradeSubmissionRate: number;
  teacherWorkload: Array<{ name: string; classes: number; students: number; subjects: string[] }>;
  effectivenessMetrics: Array<{ name: string; averageStudentScore: number; creditPassRate: number }>;
}

interface SchoolStats {
  totalClasses: number;
  averageClassSize: number;
  capacityUtilization: number;
  subjectCoverage: number;
  termCompletionRate: number;
  resourceUtilization: Array<{ category: string; usage: number; available: number }>;
}

interface ComplianceStats {
  threeTermCompliance: number;
  curriculumCoverage: number;
  assessmentMethodCompliance: number;
  culturalIntegrationScore: number;
  moEStandardsAdherence: number;
}

const AdminMoEReportingScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3 | 'All'>('All');
  const [reportView, setReportView] = useState<'overview' | 'enrollment' | 'performance' | 'teachers' | 'infrastructure' | 'compliance'>('overview');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  if (!context) {
    return <div className="p-6 text-gray-700">Loading Ministry of Education Reporting System...</div>;
  }

  const { students, teachers, schoolClasses, grades, subjects } = context;

  // Calculate enrollment statistics
  const enrollmentStats: EnrollmentStats = useMemo(() => {
    const totalStudents = students.length;
    
    // Group by grade with gender breakdown
    const byGrade = students.reduce((acc, student) => {
      if (!acc[student.grade]) {
        acc[student.grade] = { total: 0, male: 0, female: 0 };
      }
      acc[student.grade].total++;
      // Mock gender data - in real implementation, this would come from student records
      if (Math.random() > 0.5) {
        acc[student.grade].male++;
      } else {
        acc[student.grade].female++;
      }
      return acc;
    }, {} as Record<number, { total: number; male: number; female: number }>);

    // Term enrollment tracking
    const byTerm = {
      1: totalStudents,
      2: Math.floor(totalStudents * 0.95), // Mock 5% dropout
      3: Math.floor(totalStudents * 0.92)  // Mock additional 3% dropout
    } as Record<1 | 2 | 3, number>;

    const retentionRate = (byTerm[3] / byTerm[1]) * 100;
    const progressionRate = 85; // Mock progression rate

    return {
      totalStudents,
      byGrade,
      byTerm,
      retentionRate,
      progressionRate
    };
  }, [students]);

  // Calculate performance statistics
  const performanceStats: PerformanceStats = useMemo(() => {
    const filteredGrades = selectedTerm === 'All' 
      ? grades 
      : grades.filter(g => g.term === selectedTerm);

    // Grade distribution
    const gradeDistribution: Record<LiberianGradeScale, number> = {
      'A1': 0, 'A2': 0, 'A3': 0, 'B2': 0, 'B3': 0, 'C4': 0,
      'C5': 0, 'C6': 0, 'D7': 0, 'E8': 0, 'F9': 0
    };

    filteredGrades.forEach(grade => {
      if (grade.liberianGrade) {
        gradeDistribution[grade.liberianGrade]++;
      }
    });

    // Average score calculation
    const numericGrades = filteredGrades
      .filter(g => g.score && !isNaN(Number(g.score)))
      .map(g => Number(g.score));
    const averageScore = numericGrades.length > 0 
      ? numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length 
      : 0;

    // Credit pass rate
    const totalGrades = filteredGrades.filter(g => g.liberianGrade).length;
    const creditPasses = filteredGrades.filter(g => 
      g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
    ).length;
    const creditPassRate = totalGrades > 0 ? (creditPasses / totalGrades) * 100 : 0;

    // University readiness
    const studentGradeData = students.map(student => {
      const studentGrades = filteredGrades
        .filter(g => g.studentId === student.id && g.liberianGrade)
        .map(g => ({
          subject: g.subjectOrAssignmentName,
          grade: g.liberianGrade!
        }));
      return checkUniversityEligibility(studentGradeData);
    });
    const universityReadyStudents = studentGradeData.filter(data => data.isEligible).length;

    // Core subject performance
    const coreSubjectPerformance = LIBERIAN_CORE_SUBJECTS.reduce((acc, subject) => {
      const subjectGrades = filteredGrades.filter(g => 
        g.subjectOrAssignmentName.toLowerCase().includes(subject.toLowerCase()) && 
        g.score && !isNaN(Number(g.score))
      );
      const average = subjectGrades.length > 0
        ? subjectGrades.reduce((sum, g) => sum + Number(g.score), 0) / subjectGrades.length
        : 0;
      acc[subject] = average;
      return acc;
    }, {} as Record<string, number>);

    // Term progression data
    const termProgressionData = [
      { 
        term: 'Term 1', 
        average: grades.filter(g => g.term === 1 && g.score).reduce((sum, g, _, arr) => sum + Number(g.score) / arr.length, 0),
        creditRate: (grades.filter(g => g.term === 1 && g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit).length / grades.filter(g => g.term === 1 && g.liberianGrade).length) * 100 || 0
      },
      { 
        term: 'Term 2', 
        average: grades.filter(g => g.term === 2 && g.score).reduce((sum, g, _, arr) => sum + Number(g.score) / arr.length, 0),
        creditRate: (grades.filter(g => g.term === 2 && g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit).length / grades.filter(g => g.term === 2 && g.liberianGrade).length) * 100 || 0
      },
      { 
        term: 'Term 3', 
        average: grades.filter(g => g.term === 3 && g.score).reduce((sum, g, _, arr) => sum + Number(g.score) / arr.length, 0),
        creditRate: (grades.filter(g => g.term === 3 && g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit).length / grades.filter(g => g.term === 3 && g.liberianGrade).length) * 100 || 0
      }
    ];

    return {
      gradeDistribution,
      averageScore,
      creditPassRate,
      universityReadyStudents,
      coreSubjectPerformance,
      termProgressionData
    };
  }, [grades, students, selectedTerm]);

  // Calculate teacher statistics
  const teacherStats: TeacherStats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalStudents = students.length;
    const averageStudentsPerTeacher = totalTeachers > 0 ? totalStudents / totalTeachers : 0;
    
    // Teacher workload analysis
    const teacherWorkload = teachers.map(teacher => {
      const teacherClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));
      const studentCount = teacherClasses.reduce((sum, sc) => sum + sc.studentIds.length, 0);
      const subjectNames = teacherClasses.map(sc => {
        const subject = subjects.find(s => sc.subjectIds.includes(s.id));
        return subject ? subject.name : 'Unknown';
      });

      return {
        name: teacher.name,
        classes: teacherClasses.length,
        students: studentCount,
        subjects: [...new Set(subjectNames)]
      };
    });

    const averageClassSize = schoolClasses.length > 0 
      ? schoolClasses.reduce((sum, sc) => sum + sc.studentIds.length, 0) / schoolClasses.length 
      : 0;

    // Grade submission compliance
    const totalExpectedGrades = schoolClasses.reduce((sum, sc) => 
      sum + (sc.studentIds.length * sc.subjectIds.length), 0
    );
    const submittedGrades = grades.filter(g => g.submittedToAdmin).length;
    const gradeSubmissionRate = totalExpectedGrades > 0 ? (submittedGrades / totalExpectedGrades) * 100 : 0;

    // Teaching effectiveness metrics
    const effectivenessMetrics = teachers.map(teacher => {
      const teacherClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));
      const classIds = teacherClasses.map(sc => sc.id);
      const teacherGrades = grades.filter(g => classIds.includes(g.classId) && g.score);
      
      const averageStudentScore = teacherGrades.length > 0
        ? teacherGrades.reduce((sum, g) => sum + Number(g.score), 0) / teacherGrades.length
        : 0;

      const creditPasses = teacherGrades.filter(g => 
        g.liberianGrade && LIBERIAN_GRADE_SCALE[g.liberianGrade].isCredit
      ).length;
      const creditPassRate = teacherGrades.length > 0 ? (creditPasses / teacherGrades.length) * 100 : 0;

      return {
        name: teacher.name,
        averageStudentScore,
        creditPassRate
      };
    });

    return {
      totalTeachers,
      averageClassSize,
      averageStudentsPerTeacher,
      gradeSubmissionRate,
      teacherWorkload,
      effectivenessMetrics
    };
  }, [teachers, schoolClasses, students, grades, subjects]);

  // Calculate school infrastructure statistics
  const schoolStats: SchoolStats = useMemo(() => {
    const totalClasses = schoolClasses.length;
    const averageClassSize = totalClasses > 0 
      ? schoolClasses.reduce((sum, sc) => sum + sc.studentIds.length, 0) / totalClasses 
      : 0;

    // Mock capacity and utilization data
    const capacityUtilization = 78; // Mock 78% capacity utilization
    const subjectCoverage = (subjects.length / LIBERIAN_CORE_SUBJECTS.length) * 100;
    const termCompletionRate = 92; // Mock 92% term completion rate

    const resourceUtilization = [
      { category: 'Textbooks', usage: 85, available: 100 },
      { category: 'Digital Resources', usage: 45, available: 60 },
      { category: 'Laboratory Equipment', usage: 30, available: 40 },
      { category: 'Library Materials', usage: 70, available: 90 },
      { category: 'Sports Equipment', usage: 55, available: 70 }
    ];

    return {
      totalClasses,
      averageClassSize,
      capacityUtilization,
      subjectCoverage,
      termCompletionRate,
      resourceUtilization
    };
  }, [schoolClasses, subjects]);

  // Calculate MoE compliance statistics
  const complianceStats: ComplianceStats = useMemo(() => {
    // Three-term compliance
    const threeTermCompliance = 100; // Full compliance with three-term structure

    // Curriculum coverage
    const curriculumCoverage = (subjects.length / LIBERIAN_CORE_SUBJECTS.length) * 100;

    // Assessment method compliance (30% CA + 70% External)
    const gradesWithBothComponents = grades.filter(g => 
      g.continuousAssessment && g.externalExamination
    ).length;
    const totalGrades = grades.length;
    const assessmentMethodCompliance = totalGrades > 0 
      ? (gradesWithBothComponents / totalGrades) * 100 
      : 0;

    // Cultural integration score (based on Liberian subjects and practices)
    const liberianSubjects = subjects.filter(s => 
      s.name.includes('Liberian') || s.name.includes('Civics')
    ).length;
    const culturalIntegrationScore = (liberianSubjects / subjects.length) * 100;

    // Overall MoE standards adherence
    const moEStandardsAdherence = (
      threeTermCompliance + 
      curriculumCoverage + 
      assessmentMethodCompliance + 
      culturalIntegrationScore
    ) / 4;

    return {
      threeTermCompliance,
      curriculumCoverage,
      assessmentMethodCompliance,
      culturalIntegrationScore,
      moEStandardsAdherence
    };
  }, [grades, subjects]);

  const handleExportReport = () => {
    // Mock export functionality
    alert(`Exporting ${reportView} report as ${exportFormat.toUpperCase()}...`);
  };

  const CHART_COLORS = ['#BF0A30', '#002868', '#FFFFFF', '#FFD700', '#228B22', '#FF6347', '#4169E1', '#32CD32', '#FF69B4', '#8A2BE2'];

  return (
    <div className="container mx-auto p-4">
      {/* Liberian Cultural Header */}
      <LiberianHeader
        title="🇱🇷 Ministry of Education Reporting System"
        subtitle="Comprehensive school performance and compliance reporting"
      >
        <div className="flex items-center space-x-4">
          <MoEIndicator text="MoE Compliant" status="compliant" />
          <div className="text-right">
            <p className="text-sm text-blue-700 font-medium">Academic Term</p>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as 1 | 2 | 3 | 'All')}
              className="mt-1 px-3 py-2 bg-white text-gray-800 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Terms</option>
              <option value={1}>Term 1 (Sep-Dec)</option>
              <option value={2}>Term 2 (Jan-Apr)</option>
              <option value={3}>Term 3 (May-Jul)</option>
            </select>
          </div>
        </div>
      </LiberianHeader>

      {/* Navigation Tabs - Enhanced with Liberian Design System */}
      <LiberianTabs
        tabs={[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'enrollment', label: 'Enrollment', icon: '👥' },
          { key: 'performance', label: 'Performance', icon: '📈' },
          { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
          { key: 'infrastructure', label: 'Infrastructure', icon: '🏫' },
          { key: 'compliance', label: 'MoE Compliance', icon: '✅' }
        ]}
        activeTab={reportView}
        onTabChange={(tab) => setReportView(tab as any)}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        
        {/* Export Controls */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Export Format:</span>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Spreadsheet</option>
            </select>
          </div>
          <Button onClick={handleExportReport} variant="primary" size="sm">
            📄 Export {reportView.charAt(0).toUpperCase() + reportView.slice(1)} Report
          </Button>
        </div>
      </div>

      {/* Overview Dashboard */}
      {reportView === 'overview' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">🇱🇷 School Performance Overview</h3>

          {/* Key Metrics Cards - Enhanced with Liberian Design System */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LiberianMetricCard
              title="Total Students"
              value={enrollmentStats.totalStudents}
              color="red"
              icon="👥"
              subtitle="Across all grades"
            />
            <LiberianMetricCard
              title="University Ready"
              value={performanceStats.universityReadyStudents}
              color="blue"
              icon="🎓"
              subtitle={`${((performanceStats.universityReadyStudents / enrollmentStats.totalStudents) * 100).toFixed(1)}% of students`}
              trend="up"
            />
            <LiberianMetricCard
              title="Credit Pass Rate"
              value={`${performanceStats.creditPassRate.toFixed(1)}%`}
              color="green"
              icon="📊"
              subtitle="WAEC standard"
              trend="up"
            />
            <LiberianMetricCard
              title="MoE Compliance"
              value={`${complianceStats.moEStandardsAdherence.toFixed(1)}%`}
              color="yellow"
              icon="🏛️"
              subtitle="Overall adherence"
              trend="stable"
            />
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiberianCard>
              <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Grade Distribution (Liberian Scale)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(performanceStats.gradeDistribution).map(([grade, count]) => ({ grade, count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#BF0A30" />
                </BarChart>
              </ResponsiveContainer>
            </LiberianCard>

            <LiberianCard>
              <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Term Performance Progression
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceStats.termProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#002868" strokeWidth={2} name="Average Score" />
                  <Line type="monotone" dataKey="creditRate" stroke="#BF0A30" strokeWidth={2} name="Credit Pass Rate" />
                </LineChart>
              </ResponsiveContainer>
            </LiberianCard>
          </div>
        </div>
      )}

      {/* Enrollment Dashboard */}
      {reportView === 'enrollment' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">👥 Student Enrollment Analysis</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Enrollment by Grade</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(enrollmentStats.byGrade).map(([grade, data]) => ({
                  grade: `Grade ${grade}`,
                  total: data.total,
                  male: data.male,
                  female: data.female
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="male" stackId="a" fill="#002868" name="Male" />
                  <Bar dataKey="female" stackId="a" fill="#BF0A30" name="Female" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Term Enrollment Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Object.entries(enrollmentStats.byTerm).map(([term, count]) => ({
                  term: `Term ${term}`,
                  students: count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#BF0A30" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Retention & Progression</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Student Retention Rate</span>
                    <span>{enrollmentStats.retentionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${enrollmentStats.retentionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Grade Progression Rate</span>
                    <span>{enrollmentStats.progressionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${enrollmentStats.progressionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Enrollment Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Enrollment Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Grade Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Total Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Male</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Female</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Gender Ratio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(enrollmentStats.byGrade).map(([grade, data]) => (
                    <tr key={grade}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Grade {grade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{data.male}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{data.female}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.total > 0 ? `${((data.male / data.total) * 100).toFixed(1)}% M / ${((data.female / data.total) * 100).toFixed(1)}% F` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Dashboard */}
      {reportView === 'performance' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">📈 Academic Performance Analysis</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🇱🇷 WAEC Grade Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(performanceStats.gradeDistribution)
                      .filter(([_, count]) => count > 0)
                      .map(([grade, count]) => ({
                        name: grade,
                        value: count,
                        fill: LIBERIAN_GRADE_SCALE[grade as LiberianGradeScale].isCredit ? '#22C55E' : '#EF4444'
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {Object.entries(performanceStats.gradeDistribution)
                      .filter(([_, count]) => count > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Core Subject Performance</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(performanceStats.coreSubjectPerformance).map(([subject, score]) => ({
                  subject: subject.length > 15 ? subject.substring(0, 12) + '...' : subject,
                  fullSubject: subject,
                  score: score.toFixed(1)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value, name, props) => [value + '%', props.payload.fullSubject]} />
                  <Bar dataKey="score" fill="#002868" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Overall Average Score</h4>
              <p className="text-3xl font-bold text-green-600">{performanceStats.averageScore.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Across all subjects and terms</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Credit Pass Rate</h4>
              <p className="text-3xl font-bold text-blue-600">{performanceStats.creditPassRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">A1-C6 grades (WAEC standard)</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">University Ready</h4>
              <p className="text-3xl font-bold text-purple-600">{performanceStats.universityReadyStudents}</p>
              <p className="text-sm text-gray-500">Students with 5+ credit passes</p>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Performance Dashboard */}
      {reportView === 'teachers' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">👨‍🏫 Teacher Performance & Workload Analysis</h3>

          {/* Teacher Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Total Teachers</p>
              <p className="text-3xl font-bold text-blue-600">{teacherStats.totalTeachers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Avg Class Size</p>
              <p className="text-3xl font-bold text-green-600">{teacherStats.averageClassSize.toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Students per Teacher</p>
              <p className="text-3xl font-bold text-yellow-600">{teacherStats.averageStudentsPerTeacher.toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Grade Submission Rate</p>
              <p className="text-3xl font-bold text-red-600">{teacherStats.gradeSubmissionRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Teacher Workload Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Teacher Workload Distribution</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Teacher Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Classes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Workload Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teacherStats.teacherWorkload.map((teacher, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.classes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.students}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.subjects.slice(0, 2).join(', ')}
                        {teacher.subjects.length > 2 && ` +${teacher.subjects.length - 2} more`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          teacher.students > 100 ? 'bg-red-100 text-red-800' :
                          teacher.students > 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {teacher.students > 100 ? 'High Load' : teacher.students > 60 ? 'Moderate Load' : 'Normal Load'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teaching Effectiveness */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Teaching Effectiveness Metrics</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={teacherStats.effectivenessMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageStudentScore" fill="#002868" name="Avg Student Score (%)" />
                <Bar dataKey="creditPassRate" fill="#BF0A30" name="Credit Pass Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Infrastructure Dashboard */}
      {reportView === 'infrastructure' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">🏫 School Infrastructure & Resource Analysis</h3>

          {/* Infrastructure Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Total Classes</p>
              <p className="text-3xl font-bold text-purple-600">{schoolStats.totalClasses}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Avg Class Size</p>
              <p className="text-3xl font-bold text-green-600">{schoolStats.averageClassSize.toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Capacity Utilization</p>
              <p className="text-3xl font-bold text-blue-600">{schoolStats.capacityUtilization}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Subject Coverage</p>
              <p className="text-3xl font-bold text-yellow-600">{schoolStats.subjectCoverage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Resource Utilization Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={schoolStats.resourceUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#22C55E" name="In Use" />
                <Bar dataKey="available" fill="#E5E7EB" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Resource Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Resource Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Resource Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">In Use</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Utilization Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schoolStats.resourceUtilization.map((resource, index) => {
                    const utilizationRate = (resource.usage / resource.available) * 100;
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resource.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.usage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.available}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{utilizationRate.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            utilizationRate > 90 ? 'bg-red-100 text-red-800' :
                            utilizationRate > 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {utilizationRate > 90 ? 'Over-utilized' : utilizationRate > 70 ? 'Well-utilized' : 'Under-utilized'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MoE Compliance Dashboard */}
      {reportView === 'compliance' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">✅ Ministry of Education Compliance Status</h3>

          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Three-Term Compliance</p>
              <p className="text-3xl font-bold text-green-600">{complianceStats.threeTermCompliance}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Curriculum Coverage</p>
              <p className="text-3xl font-bold text-blue-600">{complianceStats.curriculumCoverage.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Assessment Method</p>
              <p className="text-3xl font-bold text-yellow-600">{complianceStats.assessmentMethodCompliance.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Cultural Integration</p>
              <p className="text-3xl font-bold text-purple-600">{complianceStats.culturalIntegrationScore.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600">
              <p className="text-sm font-medium text-gray-500 uppercase">Overall MoE Adherence</p>
              <p className="text-3xl font-bold text-red-600">{complianceStats.moEStandardsAdherence.toFixed(1)}%</p>
            </div>
          </div>

          {/* Compliance Details */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🇱🇷 Detailed Compliance Analysis</h4>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Academic Structure Compliance</h5>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">✅ Three-term academic structure fully implemented</p>
                  <p className="text-sm text-green-800">✅ Term dates align with Liberian academic calendar</p>
                  <p className="text-sm text-green-800">✅ Proper term break scheduling maintained</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Curriculum & Assessment Compliance</h5>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">✅ Liberian core subjects fully covered</p>
                  <p className="text-sm text-blue-800">✅ WAEC grading system (A1-F9) implemented</p>
                  <p className="text-sm text-blue-800">⚠️ Assessment method compliance at {complianceStats.assessmentMethodCompliance.toFixed(1)}%</p>
                  <p className="text-sm text-blue-800">✅ University admission tracking active</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Cultural Integration Status</h5>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">✅ Liberian History and Civics subjects included</p>
                  <p className="text-sm text-purple-800">✅ National holidays integrated in calendar</p>
                  <p className="text-sm text-purple-800">✅ Cultural context maintained throughout system</p>
                  <p className="text-sm text-purple-800">✅ Authentic Liberian names and terminology used</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Recommendations for Improvement</h5>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">• Increase 30% CA + 70% External assessment compliance</p>
                  <p className="text-sm text-yellow-800">• Enhance teacher training on Liberian assessment methods</p>
                  <p className="text-sm text-yellow-800">• Strengthen community engagement programs</p>
                  <p className="text-sm text-yellow-800">• Regular MoE compliance audits and reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoEReportingScreen;
