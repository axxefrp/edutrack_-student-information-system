
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import { Student, Grade } from '../../types';
// Optimized imports for better tree shaking
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { Legend } from 'recharts/lib/component/Legend';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { Cell } from 'recharts/lib/component/Cell';
import {
  LiberianHeader,
  LiberianCard,
  LiberianMetricCard,
  LiberianButton,
  MoEIndicator
} from '../Shared/LiberianDesignSystem';


const CHART_COLORS = ['#0ea5e9', '#3b82f6', '#2563eb', '#1d4ed8', '#075985', '#0c4a6e'];


const TeacherDashboardContent: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { students, pointTransactions, currentUser, schoolClasses, grades } = context; 

  const teacherId = currentUser?.teacherId;

  const assignedClassesCount = schoolClasses.filter(sc => sc.teacherId === teacherId).length;
  
  const assignmentsAwaitingGrading = useMemo(() => {
    if (!teacherId) return 0;
    const teacherClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);
    const teacherClassIds = teacherClasses.map(sc => sc.id);
    
    return grades.filter(grade => 
        teacherClassIds.includes(grade.classId) && grade.status === 'Submitted'
    ).length;
  }, [grades, schoolClasses, teacherId]);


  const averageStudentPointsInMyClasses = useMemo(() => {
    if (!teacherId) return 0;
    const myClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);
    if (myClasses.length === 0) return 0;

    let totalPoints = 0;
    let totalStudentsInMyClasses = 0;
    const studentSet = new Set<string>(); 

    myClasses.forEach(sc => {
      sc.studentIds.forEach(studentId => {
        if (!studentSet.has(studentId)) {
          const student = students.find(s => s.id === studentId);
          if (student) {
            totalPoints += student.points;
            studentSet.add(studentId);
          }
        }
      });
    });
    totalStudentsInMyClasses = studentSet.size;
    return totalStudentsInMyClasses > 0 ? (totalPoints / totalStudentsInMyClasses).toFixed(0) : 0;
  }, [students, schoolClasses, teacherId]);


  const topStudentsInMyClasses = useMemo(() => {
    if(!teacherId) return [];
    const myClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);
    const studentIdsInMyClasses = new Set<string>();
    myClasses.forEach(sc => sc.studentIds.forEach(id => studentIdsInMyClasses.add(id)));
    
    return [...students]
      .filter(s => studentIdsInMyClasses.has(s.id))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [students, schoolClasses, teacherId]);

  const classAveragePointsData = useMemo(() => {
    if (!teacherId) return [];
    return schoolClasses
        .filter(sc => sc.teacherId === teacherId)
        .map(sc => {
            let classTotalPoints = 0;
            let enrolledStudentCount = 0;
            sc.studentIds.forEach(studentId => {
                const student = students.find(s => s.id === studentId);
                if (student) {
                    classTotalPoints += student.points;
                    enrolledStudentCount++;
                }
            });
            return {
                name: sc.name.length > 15 ? sc.name.substring(0,13) + '...' : sc.name,
                fullName: sc.name,
                averagePoints: enrolledStudentCount > 0 ? parseFloat((classTotalPoints / enrolledStudentCount).toFixed(1)) : 0,
            };
        })
        .sort((a,b) => b.averagePoints - a.averagePoints);
  }, [schoolClasses, students, teacherId]);

   const CustomTooltipClassAvg = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">{data.fullName}</p>
          <p className="text-sm" style={{ color: payload[0].fill }}>{`Avg Points: ${data.averagePoints}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Liberian Cultural Header */}
      <LiberianHeader
        title="🇱🇷 Teacher Dashboard"
        subtitle="Welcome back! Monitor your classes and student progress with Liberian educational excellence."
      >
        <MoEIndicator text="Teaching Excellence" status="compliant" />
      </LiberianHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LiberianMetricCard
          title="Assigned Classes"
          value={assignedClassesCount}
          color="red"
          icon="🏫"
          subtitle="View My Classes"
        />
        <LiberianMetricCard
          title="Avg. Student Points"
          value={averageStudentPointsInMyClasses}
          color="blue"
          icon="📊"
          subtitle="Award Points"
        />
        <LiberianMetricCard
          title="Awaiting Grading"
          value={assignmentsAwaitingGrading}
          color="yellow"
          icon="📝"
          subtitle="Go to Gradebook"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiberianCard>
          <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Top Students (Points in My Classes)
          </h3>
          {topStudentsInMyClasses.length > 0 ? (
            <ul className="space-y-3">
              {topStudentsInMyClasses.map((student, index) => (
                <li key={student.id} className={`p-3 rounded-md flex justify-between items-center ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-green-50'}`}>
                  <div className="flex items-center">
                    <span className={`mr-3 font-bold text-lg ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-green-600'}`}>#{index + 1}</span>
                    <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">Grade: {student.grade}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">{student.points} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No students or points data available for your classes.</p>
          )}
        </LiberianCard>

        <LiberianCard>
            <h2 className="text-xl font-semibold text-blue-700 mb-6 flex items-center">
              <span className="mr-2">📈</span>
              My Classes - Average Points
            </h2>
            {classAveragePointsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                data={classAveragePointsData}
                margin={{
                    top: 5, right: 20, left: -10, bottom: 40, // Increased bottom margin for rotated labels
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#4b5563', fontSize: 10 }} 
                    angle={-35} // Rotate labels
                    textAnchor="end" // Anchor rotated labels at the end
                    interval={0} // Show all labels
                />
                <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip content={<CustomTooltipClassAvg />} cursor={{fill: 'rgba(219, 234, 254, 0.5)'}}/>
                <Bar dataKey="averagePoints" name="Avg Points" unit="">
                    {classAveragePointsData.map((entry, index) => (
                    <Cell key={`cell-class-avg-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
            <p className="text-gray-500 text-center py-10">No class data available to display chart.</p>
            )}
        </LiberianCard>

      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/teacher/my-classes" className="block p-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-center font-medium">View My Classes</Link>
          <Link to="/teacher/grades" className="block p-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-center font-medium">Open Gradebook</Link>
          <Link to="/teacher/comprehensive-gradebook" className="block p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-center font-medium">🇱🇷 Comprehensive Gradebook</Link>
          <Link to="/teacher/master-gradesheet" className="block p-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-center font-medium">📤 Master Gradesheet</Link>
          <Link to="/teacher/attendance" className="block p-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-center font-medium">Mark Attendance</Link>
          <Link to="/messages" className="block p-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-center font-medium">My Messages</Link>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboardContent;
