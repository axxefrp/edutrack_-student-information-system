
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, Label } from 'recharts';
import { Student } from '../../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; linkTo?: string; linkText?: string; color: string }> = ({ title, value, icon, linkTo, linkText, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-primary-500">{icon}</div>
    </div>
    {linkTo && linkText && (
       <Link to={linkTo} className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-800 font-medium">
         {linkText} &rarr;
       </Link>
    )}
  </div>
);

// Mock data for Student Performance Trend
const mockPerformanceData = [
  { term: 'Term 1', averageScore: 75 },
  { term: 'Term 2', averageScore: 78 },
  { term: 'Term 3', averageScore: 82 },
  { term: 'Term 4', averageScore: 80 },
];

const AdminDashboardContent: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { students, teachers, schoolClasses } = context;

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = schoolClasses.length;

  // Prepare data for Student Distribution Chart
  const studentDistributionData = students.reduce((acc, student) => {
    const gradeKey = `Grade ${student.grade}`;
    acc[gradeKey] = (acc[gradeKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const studentDistChartData = Object.entries(studentDistributionData)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => {
        const gradeANum = parseInt(a.grade.replace('Grade ', ''), 10);
        const gradeBNum = parseInt(b.grade.replace('Grade ', ''), 10);
        return gradeANum - gradeBNum;
    });

  const CHART_COLORS = ['#0ea5e9', '#3b82f6', '#2563eb', '#1d4ed8', '#075985', '#0c4a6e', '#172554', '#365314', '#166534'];

  // Prepare data for Class Sizes Chart
  const classSizesChartData = schoolClasses
    .map(sc => ({
      name: sc.name.length > 20 ? `${sc.name.substring(0, 18)}...` : sc.name, // Shorten long names
      fullName: sc.name,
      students: sc.studentIds.length,
    }))
    .sort((a,b) => b.students - a.students); // Sort by largest class first or alphabetically if preferred

  const CustomTooltipClassSizes = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">{data.fullName}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>{`Students: ${data.students}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
          linkTo="/admin/students"
          linkText="Manage Students"
          color="border-blue-500"
        />
        <StatCard 
          title="Total Teachers" 
          value={totalTeachers} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>}
          linkTo="/admin/teachers"
          linkText="Manage Teachers"
          color="border-green-500"
        />
        <StatCard 
          title="Total Classes" 
          value={totalClasses} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 16.5V3.75" /></svg>}
          linkTo="/admin/classes"
          linkText="Manage Classes"
          color="border-purple-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Student Distribution by Grade</h2>
            {studentDistChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                data={studentDistChartData}
                margin={{
                    top: 5, right: 30, left: 0, bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="grade" tick={{ fill: '#4b5563', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="count" name="Students" unit="">
                    {studentDistChartData.map((entry, index) => (
                    <Cell key={`cell-student-dist-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
            <p className="text-gray-500 text-center py-10">No student data available to display chart.</p>
            )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Class Sizes Overview</h2>
            {classSizesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                data={classSizesChartData}
                margin={{
                    top: 5, right: 30, left: 0, bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip content={<CustomTooltipClassSizes />} cursor={{fill: 'rgba(219, 234, 254, 0.5)'}}/>
                <Bar dataKey="students" name="# Students">
                    {classSizesChartData.map((entry, index) => (
                    <Cell key={`cell-class-size-${index}`} fill={CHART_COLORS[(index + studentDistChartData.length) % CHART_COLORS.length]} /> // Offset color index
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
            <p className="text-gray-500 text-center py-10">No class data available to display chart.</p>
            )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Student Performance Trend (Mock)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={mockPerformanceData}
            margin={{
              top: 5, right: 30, left: 0, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="term" tick={{ fill: '#4b5563', fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#4b5563', fontSize: 12 }}>
                <Label value="Avg. Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#374151' }} />
            </YAxis>
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Average Score"]}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              itemStyle={{ color: '#16a34a' }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            <Line type="monotone" dataKey="averageScore" name="Average Student Score" stroke="#16a34a" strokeWidth={2.5} activeDot={{ r: 7 }} dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>


      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/students" className="block p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-center font-medium">
            Manage Students
          </Link>
          <Link to="/admin/teachers" className="block p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-center font-medium">
            Manage Teachers
          </Link>
          <Link to="/admin/classes" className="block p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-center font-medium">
            Manage Classes
          </Link>
          <Link to="/admin/master-gradesheet" className="block p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium">
            🇱🇷 Master Gradesheet
          </Link>
          <Link to="/admin/leaderboard" className="block p-4 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-center font-medium">
            View Leaderboard
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardContent;
