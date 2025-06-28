
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { UserRole, Student } from '../../types';
import AdminDashboardContent from './AdminDashboardContent';
import TeacherDashboardContent from './TeacherDashboardContent';
import StudentDashboardContent from './StudentDashboardContent';
import ParentDashboardContent from './ParentDashboardContent';

const DashboardScreen: React.FC = () => {
  const context = useContext(AppContext);

  if (!context || !context.currentUser) {
    return <div className="p-6 text-gray-700">Loading user data...</div>;
  }

  const { currentUser, students } = context;

  const getStudentForUser = (): Student | undefined => {
    if (currentUser.studentId) {
      return students.find(s => s.id === currentUser.studentId);
    }
    return undefined;
  };
  
  const studentData = getStudentForUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {currentUser.username}!
      </h1>
      
      {currentUser.role === UserRole.ADMIN && <AdminDashboardContent />}
      {currentUser.role === UserRole.TEACHER && <TeacherDashboardContent />}
      {currentUser.role === UserRole.STUDENT && studentData && <StudentDashboardContent student={studentData} />}
      {currentUser.role === UserRole.PARENT && studentData && <ParentDashboardContent student={studentData} />}

      { (currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.PARENT) && !studentData && (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Student Data Not Found</p>
            <p>Could not load data for the associated student. Please contact support.</p>
        </div>
      )}
    </div>
  );
};


export default DashboardScreen;