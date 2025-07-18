import React, { useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { Teacher, SchoolClass, Student, Grade, PointTransaction, Subject } from '../../types';
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

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
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

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 16.5V3.75" />
  </svg>
);

const AdminTeacherProfileView: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) return null;
  const { teachers, schoolClasses, students, grades, pointTransactions, subjects, users } = context;

  const teacher = teachers.find(t => t.id === teacherId);
  const teacherUser = users.find(u => u.teacherId === teacherId);

  if (!teacher) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Teacher Not Found</h1>
          <p className="text-gray-600 mb-6">The requested teacher profile could not be found.</p>
          <Button onClick={() => navigate('/admin/teachers')} variant="primary">
            Back to Teacher Management
          </Button>
        </div>
      </div>
    );
  }

  // Get teacher's assigned classes
  const assignedClasses = schoolClasses.filter(sc => sc.teacherIds.includes(teacher.id));
  
  // Get all students in teacher's classes
  const teacherStudents = useMemo(() => {
    const studentIds = new Set<string>();
    assignedClasses.forEach(cls => {
      cls.studentIds.forEach(id => studentIds.add(id));
    });
    return students.filter(s => studentIds.has(s.id));
  }, [assignedClasses, students]);

  // Get teacher's subjects
  const teacherSubjects = subjects.filter(s => teacher.subjectIds.includes(s.id));

  // Get grades given by this teacher
  const teacherGrades = grades.filter(g => 
    assignedClasses.some(cls => cls.id === g.classId)
  );

  // Get point transactions by this teacher
  const teacherPointTransactions = pointTransactions.filter(pt => pt.teacherId === teacherUser?.uid);

  // Calculate statistics
  const totalStudents = teacherStudents.length;
  const totalClasses = assignedClasses.length;
  const totalPointsAwarded = teacherPointTransactions.reduce((sum, pt) => sum + pt.points, 0);
  const averageGrade = useMemo(() => {
    const numericGrades = teacherGrades
      .map(g => parseFloat(g.score))
      .filter(score => !isNaN(score));
    
    if (numericGrades.length === 0) return 'N/A';
    const avg = numericGrades.reduce((sum, score) => sum + score, 0) / numericGrades.length;
    return avg.toFixed(1);
  }, [teacherGrades]);

  const pendingGrades = teacherGrades.filter(g => g.status === 'Submitted').length;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/admin/teachers')}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{teacher.name}</h1>
            <p className="text-gray-600">Teacher Profile</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/admin/teachers`)} 
          variant="secondary"
        >
          Edit Teacher
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
              <p className="text-sm font-medium text-gray-500">Total Classes</p>
              <p className="text-2xl font-semibold text-gray-900">{totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-green-600">
              <UsersIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-purple-600">
              <ChartBarIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Points Awarded</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPointsAwarded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-orange-600">
              <ClipboardDocumentListIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Grades</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingGrades}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teacher Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserIcon />
            <span className="ml-2">Teacher Information</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{teacher.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{teacherUser?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <p className="text-gray-900">{teacherUser?.username || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Teacher ID</label>
              <p className="text-gray-900 font-mono">{teacher.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Average Grade Given</label>
              <p className="text-gray-900">{averageGrade}</p>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpenIcon />
            <span className="ml-2">Teaching Subjects</span>
          </h2>
          {teacherSubjects.length > 0 ? (
            <div className="space-y-3">
              {teacherSubjects.map(subject => (
                <div key={subject.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900">{subject.name}</h3>
                  {subject.description && (
                    <p className="text-sm text-gray-600">{subject.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No subjects assigned</p>
          )}
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <AcademicCapIcon />
            </div>
            Assigned Classes ({assignedClasses.length})
          </h2>
          {assignedClasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedClasses.map(cls => {
                    const classStudents = students.filter(s => cls.studentIds.includes(s.id));
                    const classGrades = grades.filter(g => g.classId === cls.id);
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
                          {classSubjects.map(s => s.name).join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classStudents.length}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes assigned</h3>
              <p className="mt-1 text-sm text-gray-500">This teacher has not been assigned to any classes yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Point Awards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <ChartBarIcon />
            </div>
            Recent Point Awards
          </h2>
          {teacherPointTransactions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teacherPointTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(transaction => {
                  const student = students.find(s => s.id === transaction.studentId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">+{transaction.points}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                <ChartBarIcon />
              </div>
              <p className="mt-2 text-sm text-gray-500">No point awards recorded</p>
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-5 h-5 mr-2">
              <ClipboardDocumentListIcon />
            </div>
            Recent Grades
          </h2>
          {teacherGrades.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teacherGrades
                .sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime())
                .slice(0, 10)
                .map(grade => {
                  const student = students.find(s => s.id === grade.studentId);
                  const cls = schoolClasses.find(c => c.id === grade.classId);
                  return (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {grade.subjectOrAssignmentName} • {cls?.name || 'Unknown Class'}
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
      </div>
    </div>
  );
};

export default AdminTeacherProfileView;
