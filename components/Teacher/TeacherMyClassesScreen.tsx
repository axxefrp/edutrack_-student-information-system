
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student as StudentType } from '../../types'; // Renamed to avoid conflict

const TeacherMyClassesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  if (!context || !context.currentUser || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading teacher data or not authorized...</div>;
  }

  const { currentUser, schoolClasses, students } = context;
  const teacherId = currentUser.teacherId;

  const assignedClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);

  const toggleExpandClass = (classId: string) => {
    setExpandedClassId(prevId => (prevId === classId ? null : classId));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Classes</h1>

      {assignedClasses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 16.5V3.75" />
          </svg>
          <p className="text-xl text-gray-600">You are not currently assigned to any classes.</p>
          <p className="text-sm text-gray-400 mt-2">Please contact an administrator if you believe this is an error.</p>
        </div>
      )}

      {assignedClasses.length > 0 && (
        <div className="space-y-6">
          {assignedClasses.map((sc: SchoolClass) => {
            const enrolledStudents = students.filter(s => sc.studentIds.includes(s.id));
            const isExpanded = expandedClassId === sc.id;

            return (
              <div key={sc.id} className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary-50"
                  onClick={() => toggleExpandClass(sc.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleExpandClass(sc.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`students-list-${sc.id}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-primary-700">{sc.name}</h2>
                      {sc.description && <p className="text-sm text-gray-500 mt-1">{sc.description}</p>}
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-3">
                            {enrolledStudents.length} Student{enrolledStudents.length !== 1 ? 's' : ''}
                        </span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className={`w-6 h-6 text-primary-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div id={`students-list-${sc.id}`} className="px-6 pb-6 pt-2 border-t border-gray-200 bg-gray-50">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 pt-2">Enrolled Students:</h3>
                    {enrolledStudents.length > 0 ? (
                      <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                        {enrolledStudents.map((student: StudentType) => (
                          <li key={student.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">Grade: {student.grade}</p>
                            </div>
                            {/* Future action: Link to student profile or gradebook for this student */}
                            {/* <Button size="sm" variant="ghost">View Details</Button> */}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No students are currently enrolled in this class.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherMyClassesScreen;
