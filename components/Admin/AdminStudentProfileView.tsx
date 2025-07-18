import React, { useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { Student, SchoolClass, Grade, PointTransaction, Subject } from '../../types';
import Button from '../Shared/Button';

// Using inline SVG icons to match the existing project pattern
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const ClipboardDocumentListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const CalendarDaysIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 12.75 9.75H11.25A3.375 3.375 0 0 0 7.5 13.125V18.75m9 0h1.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18.75 4.5h-1.5m-9 0H6A2.25 2.25 0 0 0 3.75 6.75v9.75A2.25 2.25 0 0 0 6 18.75h1.5m0 0V4.5m0 14.25H12m0 0V4.5" />
  </svg>
);

const AdminStudentProfileView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) return null;
  const { students, schoolClasses, grades, pointTransactions, subjects, users, teachers } = context;

  const student = students.find(s => s.id === studentId);
  const parentUser = users.find(u => u.studentId === studentId && u.role === 'PARENT');

  if (!student) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-6">The requested student profile could not be found.</p>
          <Button onClick={() => navigate('/admin/students')} variant="primary">
            Back to Student Management
          </Button>
        </div>
      </div>
    );
  }

  // Get student's enrolled classes
  const enrolledClasses = schoolClasses.filter(sc => sc.studentIds.includes(student.id));
  
  // Get student's grades
  const studentGrades = grades.filter(g => g.studentId === student.id);
  
  // Get student's point transactions
  const studentPointTransactions = pointTransactions.filter(pt => pt.studentId === student.id);

  // Calculate statistics
  const totalClasses = enrolledClasses.length;
  const totalGrades = studentGrades.length;
  const averageGrade = useMemo(() => {
    const numericGrades = studentGrades
      .map(g => parseFloat(g.score))
      .filter(score => !isNaN(score));
    
    if (numericGrades.length === 0) return 'N/A';
    const avg = numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length;
    return avg.toFixed(1);
  }, [studentGrades]);

  const attendanceRate = useMemo(() => {
    if (!student.attendance || student.attendance.length === 0) return 'N/A';
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const rate = (presentCount / student.attendance.length) * 100;
    return rate.toFixed(1) + '%';
  }, [student.attendance]);

  const upcomingAssignments = studentGrades.filter(g => g.status === 'Upcoming').length;
  const pendingSubmissions = studentGrades.filter(g => g.status === 'Pending Submission').length;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/admin/students')}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{student.name}</h1>
            <p className="text-gray-600">Student Profile • Grade {student.grade}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/admin/students`)} 
          variant="secondary"
        >
          Edit Student
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-blue-600">
              <AcademicCapIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrolled Classes</p>
              <p className="text-2xl font-semibold text-gray-900">{totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-yellow-600">
              <TrophyIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Points</p>
              <p className="text-2xl font-semibold text-gray-900">{student.points}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-green-600">
              <ClipboardDocumentListIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900">{averageGrade}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-purple-600">
              <CalendarDaysIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceRate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserIcon />
            <span className="ml-2">Student Information</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{student.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Student ID</label>
              <p className="text-gray-900 font-mono">{student.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Grade Level</label>
              <p className="text-gray-900">Grade {student.grade}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Points</label>
              <p className="text-gray-900">{student.points}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Parent Contact</label>
              <p className="text-gray-900">{parentUser?.email || 'No parent linked'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Upcoming Assignments</label>
              <p className="text-gray-900">{upcomingAssignments}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Pending Submissions</label>
              <p className="text-gray-900">{pendingSubmissions}</p>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <ChartBarIcon />
            </div>
            Academic Performance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Assignments</label>
              <p className="text-gray-900">{totalGrades}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Average Grade</label>
              <p className="text-gray-900">{averageGrade}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Attendance Rate</label>
              <p className="text-gray-900">{attendanceRate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Attendance Records</label>
              <p className="text-gray-900">{student.attendance?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <AcademicCapIcon />
            </div>
            Enrolled Classes ({enrolledClasses.length})
          </h2>
          {enrolledClasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledClasses.map(cls => {
                    const classTeachers = teachers.filter(t => cls.teacherIds.includes(t.id));
                    const classGrades = studentGrades.filter(g => g.classId === cls.id);
                    const classSubjects = subjects.filter(s => cls.subjectIds.includes(s.id));

                    const avgGrade = useMemo(() => {
                      const numericGrades = classGrades
                        .map(g => parseFloat(g.score))
                        .filter(score => !isNaN(score));

                      if (numericGrades.length === 0) return 'N/A';
                      const avg = numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length;
                      return avg.toFixed(1);
                    }, [classGrades]);

                    return (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                          {cls.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{cls.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classTeachers.length > 0 ? classTeachers.map(t => t.name).join(', ') : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classSubjects.map(s => s.name).join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {avgGrade}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                <AcademicCapIcon />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes enrolled</h3>
              <p className="mt-1 text-sm text-gray-500">This student is not enrolled in any classes yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <ClipboardDocumentListIcon />
            </div>
            Recent Grades
          </h2>
          {studentGrades.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {studentGrades
                .sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime())
                .slice(0, 10)
                .map(grade => {
                  const cls = schoolClasses.find(c => c.id === grade.classId);
                  const classTeachers = cls ? teachers.filter(t => cls.teacherIds.includes(t.id)) : [];
                  return (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {grade.subjectOrAssignmentName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls?.name || 'Unknown Class'} • {classTeachers.length > 0 ? classTeachers.map(t => t.name).join(', ') : 'Unknown Teacher'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">{grade.score}</p>
                        <p className="text-xs text-gray-500">{grade.dateAssigned}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                <ClipboardDocumentListIcon />
              </div>
              <p className="mt-2 text-sm text-gray-500">No grades recorded</p>
            </div>
          )}
        </div>

        {/* Point History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <TrophyIcon />
            </div>
            Point History
          </h2>
          {studentPointTransactions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {studentPointTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(transaction => {
                  const teacher = teachers.find(t => users.find(u => u.uid === transaction.teacherId)?.teacherId === t.id);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          By: {teacher?.name || 'Unknown Teacher'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                <TrophyIcon />
              </div>
              <p className="mt-2 text-sm text-gray-500">No point transactions recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentProfileView;
