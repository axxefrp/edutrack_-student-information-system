import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../App';
import { Grade, SchoolClass } from '../../types';
import Button from '../Shared/Button';

const StudentAssignmentsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [classFilter, setClassFilter] = useState<string>(''); // Empty string for "All Classes"
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);


  if (!context || !context.currentUser || !context.currentUser.studentId) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-700">
        Loading student data or not authorized...
      </div>
    );
  }

  const { currentUser, grades, schoolClasses, submitAssignment } = context; 
  const studentId = currentUser.studentId;

  const studentEnrolledClassObjects = useMemo(() => {
    return schoolClasses.filter(sc => sc.studentIds.includes(studentId));
  }, [schoolClasses, studentId]);

  const studentAssignments = useMemo(() => {
    let filteredGrades = grades.filter(g => g.studentId === studentId);
    if (classFilter) {
      filteredGrades = filteredGrades.filter(g => g.classId === classFilter);
    }
    return filteredGrades.sort((a, b) => new Date(b.dueDate || b.dateAssigned).getTime() - new Date(a.dueDate || a.dateAssigned).getTime());
  }, [grades, studentId, classFilter]);

  const categorizedAssignments = useMemo(() => {
    const upcoming: Grade[] = [];
    const pending: Grade[] = []; 
    const submitted: Grade[] = [];
    const graded: Grade[] = [];
    const now = new Date();

    studentAssignments.forEach(assignment => {
      if (assignment.status === 'Graded' || (assignment.score && assignment.score.trim() !== '')) {
        graded.push(assignment);
      } else if (assignment.status === 'Submitted') {
        submitted.push(assignment);
      } else if (assignment.status === 'Upcoming' || (assignment.dueDate && new Date(assignment.dueDate) >= now)) {
        upcoming.push(assignment);
      } else {
        // Default to pending if no specific future due date or upcoming status
        pending.push(assignment); 
      }
    });
    
    upcoming.sort((a,b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
    
    // Combine pending and submitted for display in one section, sorted by due date
    const combinedPendingAndSubmitted = [...pending, ...submitted].sort((a,b) => {
        const dateA = new Date(a.dueDate || a.submissionDate || 0).getTime();
        const dateB = new Date(b.dueDate || b.submissionDate || 0).getTime();
        return dateA - dateB;
    });


    return { upcoming, pending: combinedPendingAndSubmitted, graded };
  }, [studentAssignments]);

  const getClassName = (classId: string): string => {
    const sc = schoolClasses.find(c => c.id === classId);
    return sc ? sc.name : 'Unknown Class';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', // Use UTC to avoid timezone shifts from ISO string
    });
  };

  const getStatusColor = (status?: Grade['status']): string => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-700 border-blue-500';
      case 'Pending Submission': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      case 'Submitted': return 'bg-orange-100 text-orange-700 border-orange-500';
      case 'Graded': return 'bg-green-100 text-green-700 border-green-500';
      default: return 'bg-gray-100 text-gray-700 border-gray-500';
    }
  };
  
  const handleSubmitAssignmentClick = (assignmentId: string) => {
    setSubmittingAssignmentId(assignmentId);
    // Simulate API call delay, context will show notification
    setTimeout(() => {
      submitAssignment(assignmentId);
      setSubmittingAssignmentId(null);
    }, 1000);
  };
  
  const renderAssignmentCard = (assignment: Grade) => (
    <div key={assignment.id} className={`p-4 rounded-lg shadow-md border-l-4 ${getStatusColor(assignment.status)} flex flex-col justify-between`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-1">{assignment.subjectOrAssignmentName}</h3>
          {assignment.status && (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(assignment.status).replace('border-l-4', '').replace('border-', 'bg-').split(' ')[0]}`}>
              {assignment.status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">Class: {getClassName(assignment.classId)}</p>
        <p className="text-sm text-gray-600">Due Date: {formatDate(assignment.dueDate)}</p>
        {assignment.dateAssigned && assignment.status !== 'Upcoming' && <p className="text-xs text-gray-500">Assigned: {formatDate(assignment.dateAssigned)}</p>}
        
        {assignment.status === 'Graded' && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-md font-bold">Score: {assignment.score}
              {assignment.maxScore && <span> / {assignment.maxScore}</span>}
            </p>
          </div>
        )}
        {assignment.teacherComments && (
           <p className="text-xs text-gray-500 mt-1 italic">Comment: {assignment.teacherComments}</p>
        )}
         {assignment.submissionDate && (assignment.status === 'Submitted' || assignment.status === 'Graded') && (
             <p className="text-xs text-gray-500 mt-1">Submitted: {formatDate(assignment.submissionDate)}</p>
         )}
      </div>
      
      {(assignment.status === 'Upcoming' || assignment.status === 'Pending Submission') && (
        <Button 
          onClick={() => handleSubmitAssignmentClick(assignment.id)}
          variant="secondary" 
          size="sm" 
          className="mt-3 w-full"
          loading={submittingAssignmentId === assignment.id}
          disabled={submittingAssignmentId !== null} // Disable all submit buttons if one is processing
        >
          Submit Assignment
        </Button>
      )}
    </div>
  );

  const AssignmentSection: React.FC<{ title: string; assignments: Grade[]; emptyMessage: string }> = ({ title, assignments, emptyMessage }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-primary-200">{title}</h2>
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(renderAssignmentCard)}
        </div>
      ) : (
        <p className="text-gray-500 italic bg-white p-4 rounded-md shadow-sm">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
        {studentEnrolledClassObjects.length > 0 && (
            <div className="mt-4 sm:mt-0">
                <label htmlFor="class-filter-assignments" className="sr-only">Filter by class</label>
                <select
                    id="class-filter-assignments"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                >
                    <option value="">All Classes</option>
                    {studentEnrolledClassObjects.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                </select>
            </div>
        )}
      </div>


      {studentAssignments.length === 0 && classFilter === '' && (
         <div className="text-center py-12 bg-white rounded-lg shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
           </svg>
           <p className="text-xl text-gray-600">No assignments found.</p>
           <p className="text-sm text-gray-400 mt-2">Your assignments will appear here once they are added by your teachers.</p>
         </div>
      )}
      {studentAssignments.length === 0 && classFilter !== '' && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
             <p className="text-xl text-gray-600">No assignments found for {getClassName(classFilter)}.</p>
             <p className="text-sm text-gray-400 mt-2">Try selecting "All Classes" or check another class.</p>
          </div>
      )}

      {studentAssignments.length > 0 && (
        <>
          <AssignmentSection 
            title="Upcoming Assignments" 
            assignments={categorizedAssignments.upcoming}
            emptyMessage="No upcoming assignments. Great job staying on top of things!"
          />
          <AssignmentSection 
            title="Pending & Submitted Assignments"
            assignments={categorizedAssignments.pending}
            emptyMessage="No assignments pending submission or awaiting grading."
          />
          <AssignmentSection 
            title="Graded Assignments"
            assignments={categorizedAssignments.graded}
            emptyMessage="No assignments have been graded yet."
          />
        </>
      )}
    </div>
  );
};

export default StudentAssignmentsScreen;