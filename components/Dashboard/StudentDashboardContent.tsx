import React, { useContext, useMemo } from 'react';
import { Student, PointTransaction, Grade } from '../../types';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, BarChart, Bar, Cell } from 'recharts';

interface StudentDashboardContentProps {
  student: Student;
}

const CHART_COLORS = ['#0ea5e9', '#3b82f6', '#2563eb', '#1d4ed8', '#075985', '#0c4a6e'];

const StudentDashboardContent: React.FC<StudentDashboardContentProps> = ({ student }) => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { pointTransactions, grades: allGrades, schoolClasses } = context;

  const recentPoints = pointTransactions
    .filter(pt => pt.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const studentPointTransactions = pointTransactions
    .filter(pt => pt.studentId === student.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativePoints = 0;
  const pointsOverTimeData = studentPointTransactions.map(pt => {
    cumulativePoints += pt.points;
    return {
      date: pt.date,
      points: pt.points, 
      cumulativePoints: cumulativePoints,
    };
  });
  
  if (pointsOverTimeData.length === 0 && student.points > 0) {
      pointsOverTimeData.push({
          date: new Date().toISOString().split('T')[0], 
          points: student.points,
          cumulativePoints: student.points,
      });
  }

  const recentGradesData = allGrades
    .filter(g => 
        g.studentId === student.id && 
        typeof g.score === 'string' && !isNaN(parseFloat(g.score)) &&
        g.maxScore !== undefined && !isNaN(Number(g.maxScore))
    )
    .sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime())
    .slice(0, 5) 
    .map(g => ({
      name: g.subjectOrAssignmentName.length > 20 ? `${g.subjectOrAssignmentName.substring(0, 18)}...` : g.subjectOrAssignmentName,
      fullAssignmentName: g.subjectOrAssignmentName,
      score: parseFloat(g.score), 
      maxScore: Number(g.maxScore),
    }))
    .reverse(); 

  const upcomingAssignmentsCount = useMemo(() => {
    const now = new Date();
    return allGrades.filter(g => 
        g.studentId === student.id &&
        (g.status === 'Upcoming' || (g.dueDate && new Date(g.dueDate) >= now && g.status !== 'Graded' && (!g.score || g.score.trim() === '')))
    ).length;
  }, [allGrades, student.id]);

  const mockNextClass = useMemo(() => {
    const studentEnrolledClasses = schoolClasses.filter(sc => sc.studentIds.includes(student.id));
    if (studentEnrolledClasses.length > 0) {
        // This is a very simple mock, picks the first enrolled class.
        // A real system would check today's schedule.
        const firstClass = studentEnrolledClasses[0];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const randomDay = days[Math.floor(Math.random() * days.length)];
        const randomHour = Math.floor(Math.random() * 4) + 9; // 9 AM - 12 PM
        return `${firstClass.name} - ${randomDay} ${randomHour}:00 AM`;
    }
    return "No classes scheduled soon.";
  }, [schoolClasses, student.id]);


  const CustomTooltipRecentScores = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">{data.fullAssignmentName}</p>
          <p className="text-sm text-blue-600">{`Score: ${data.score} / ${data.maxScore}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold">Hello, {student.name}!</h2>
        <p className="text-primary-100">Here's a quick look at your progress.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p className="text-sm text-primary-200 uppercase">Total Points</p>
                <p className="text-4xl font-bold">{student.points}</p>
            </div>
            <div>
                <p className="text-sm text-primary-200 uppercase">Current Grade</p>
                <p className="text-4xl font-bold">{student.grade}</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
          <p className="text-sm font-medium text-gray-500 uppercase">Upcoming Assignments</p>
          <p className="text-3xl font-bold text-gray-800">{upcomingAssignmentsCount}</p>
          <Link to="/student/assignments" className="mt-2 inline-block text-sm text-yellow-600 hover:text-yellow-800 font-medium">View Assignments &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Next Scheduled Class (Mock)</p>
          <p className="text-lg font-semibold text-gray-800 truncate" title={mockNextClass}>{mockNextClass}</p>
          <Link to="/student/schedule" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Full Schedule &rarr;</Link>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500 uppercase">My Points</p>
          <p className="text-3xl font-bold text-gray-800">{student.points}</p>
           <Link to="/student/points" className="mt-2 inline-block text-sm text-green-600 hover:text-green-800 font-medium">View Points History &rarr;</Link>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Points Earned</h3>
          {recentPoints.length > 0 ? (
            <ul className="space-y-3">
              {recentPoints.map(pt => (
                <li key={pt.id} className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <div>
                    <p className="font-medium text-green-700">{pt.reason}</p>
                    <p className="text-xs text-gray-500">{new Date(pt.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">+{pt.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent points activity.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">My Points Journey</h3>
          {pointsOverTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={pointsOverTimeData}
                margin={{
                  top: 5, right: 20, left: -20, bottom: 5, 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'})} 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <YAxis dataKey="cumulativePoints" allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10 }} >
                    <Label value="Total Points" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#4b5563', fontSize: 12 }} />
                </YAxis>
                <Tooltip 
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('en-US')}`}
                    formatter={(value: number, name: string) => {
                         if (name === 'Transaction Points') return [value, 'Points in Transaction'];
                         if (name === 'Total Points') return [value, 'Total Points'];
                         return [value, name];
                    }}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#3b82f6' }}
                    labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="cumulativePoints" name="Total Points" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 7 }} dot={{ r: 4, strokeWidth: 1, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No points data available to display chart.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Assignment Scores</h3>
        {recentGradesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
                data={recentGradesData}
                margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<CustomTooltipRecentScores />} cursor={{fill: 'rgba(219, 234, 254, 0.5)'}}/>
              <Bar dataKey="score" name="Score">
                {recentGradesData.map((entry, index) => (
                  <Cell key={`cell-score-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">No recent assignment scores with numeric values available to display.</p>
        )}
      </div>
       
       <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/student/profile" className="block p-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition text-center font-medium">View Full Profile</Link>
            <Link to="/student/assignments" className="block p-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition text-center font-medium">My Assignments</Link>
            <Link to="/student/leaderboard" className="block p-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition text-center font-medium">School Leaderboard</Link>
            <Link to="/messages" className="block p-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition text-center font-medium">My Messages</Link>
          </div>
        </div>
    </div>
  );
};

export default StudentDashboardContent;