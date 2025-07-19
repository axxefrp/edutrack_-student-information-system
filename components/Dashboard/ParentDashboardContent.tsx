import React, { useContext } from 'react';
import { Student, Teacher as TeacherType, UserRole } from '../../types'; // Added TeacherType, UserRole
import { AppContext } from '../../App';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate

interface ParentDashboardContentProps {
  student: Student; // Child's data
}

const ParentDashboardContent: React.FC<ParentDashboardContentProps> = ({ student }) => {
  const context = useContext(AppContext);
  const navigate = useNavigate(); // Added useNavigate

  if (!context) return null;

  const { schoolClasses, teachers, users } = context; // Added schoolClasses, teachers, users

  const childsRecentPoints = context.pointTransactions
    .filter(pt => pt.studentId === student.id)
    .slice(-2)
    .reverse();
  
  // Mock recent grades - keeping this as is for now
  const recentGrades = [
      { subject: "Math", score: "A", date: "2024-07-25" },
      { subject: "Science", score: "B+", date: "2024-07-22" },
  ];

  const getPrimaryTeacherUserId = (): string | undefined => {
    // Find the first class the student is enrolled in
    const studentClass = schoolClasses.find(sc => sc.studentIds.includes(student.id));
    if (studentClass && studentClass.teacherId) {
      // Find the teacher profile linked to that class
      const teacherProfile = teachers.find(t => t.id === studentClass.teacherId);
      if (teacherProfile) {
        // Find the user account for that teacher profile
        const teacherUser = users.find(u => u.teacherId === teacherProfile.id && u.role === UserRole.TEACHER);
        return teacherUser?.uid;
      }
    }
    return undefined;
  };

  const handleContactTeacher = () => {
    const teacherUserId = getPrimaryTeacherUserId();
    if (teacherUserId) {
      navigate('/messages', { 
        state: { 
          composeMode: true, 
          recipientId: teacherUserId, 
          subject: `Inquiry regarding ${student.name}` 
        } 
      });
    } else {
      alert("Could not find a primary teacher for your child to contact. They may not be assigned to a class or the class may not have a teacher assigned.");
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold">Overview for {student.name} (Grade {student.grade})</h2>
        <p className="text-secondary-100">Track your child's academic journey and engagement.</p>
         <div className="mt-6">
            <p className="text-sm text-secondary-200 uppercase">Total Points Earned</p>
            <p className="text-4xl font-bold">{student.points}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Points for {student.name}</h3>
          {childsRecentPoints.length > 0 ? (
            <ul className="space-y-3">
              {childsRecentPoints.map(pt => (
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
            <p className="text-gray-500">No recent points activity for {student.name}.</p>
          )}
          <Link to="/parent/child-points" className="mt-4 inline-block text-sm text-secondary-600 hover:text-secondary-800 font-medium">View All Points &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Grades</h3>
           {recentGrades.length > 0 ? (
            <ul className="space-y-3">
              {recentGrades.map((grade, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <div>
                    <p className="font-medium text-blue-700">{grade.subject}</p>
                    <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{grade.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent grades available.</p>
          )}
          <Link to="/parent/child-grades" className="mt-4 inline-block text-sm text-secondary-600 hover:text-secondary-800 font-medium">View Full Gradebook &rarr;</Link>
        </div>
      </div>

       <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-3 md:flex md:space-y-0 md:space-x-3">
            <Link to="/parent/child-profile" className="block flex-1 text-center p-3 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition">View {student.name}'s Profile</Link>
            <button 
                onClick={handleContactTeacher}
                className="block w-full md:w-auto flex-1 text-center p-3 bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition"
            >
                Contact Teacher
            </button>
          </div>
        </div>
    </div>
  );
};

export default ParentDashboardContent;