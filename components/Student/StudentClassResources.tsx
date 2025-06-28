import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, DocumentResource, UserRole } from '../../types';
import Button from '../Shared/Button'; // Assuming Button component exists

const StudentClassResourcesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  if (!context || !context.currentUser || context.currentUser.role !== UserRole.STUDENT || !context.currentUser.studentId) {
    return <div className="p-6 text-gray-700">Loading student data or not authorized...</div>;
  }

  const { currentUser, schoolClasses, documentResources, users, teachers } = context;
  const studentId = currentUser.studentId;

  const studentEnrolledClasses = schoolClasses.filter(sc => sc.studentIds.includes(studentId));
  const resourcesForSelectedClass = documentResources.filter(dr => dr.classId === selectedClassId)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  useEffect(() => {
    if (studentEnrolledClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(studentEnrolledClasses[0].id);
    }
  }, [studentEnrolledClasses, selectedClassId]);

  const getTeacherNameForResource = (teacherUserId: string): string => {
    const teacherUser = users.find(u => u.uid === teacherUserId && u.role === UserRole.TEACHER);
    if (teacherUser && teacherUser.teacherId) {
        const teacherProfile = teachers.find(t => t.id === teacherUser.teacherId);
        return teacherProfile ? teacherProfile.name : 'Unknown Teacher';
    }
    return 'Unknown Teacher';
  };
  
  const handleDownload = (fileURL: string, fileName: string) => {
    // For base64 data URLs, opening in a new tab is often sufficient.
    // For more robust download, a link with 'download' attribute can be created.
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName; // Suggests a filename to the browser
    // For some browsers/file types, this might open in new tab instead of direct download
    // depending on browser settings and Content-Disposition if it were a real server response.
    link.target = '_blank'; // Open in new tab as a fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-4 border-b">Class Resources</h1>

      {studentEnrolledClasses.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow">You are not enrolled in any classes to view resources.</p>
      ) : (
        <div className="mb-6 max-w-sm">
          <label htmlFor="class-select-student-resources" className="block text-sm font-medium text-gray-700 mb-1">
            Select Class:
          </label>
          <select
            id="class-select-student-resources"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {studentEnrolledClasses.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedClassId && (
        resourcesForSelectedClass.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow">No resources available for this class yet.</p>
        ) : (
          <div className="space-y-4">
            {resourcesForSelectedClass.map(resource => (
              <div key={resource.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between sm:items-start">
                <div className="flex-grow mb-3 sm:mb-0">
                  <h3 className="text-lg font-semibold text-primary-700">{resource.title}</h3>
                  <p className="text-xs text-gray-500">File: {resource.fileName} ({resource.fileType})</p>
                  <p className="text-xs text-gray-500">Category: {resource.category}</p>
                  <p className="text-xs text-gray-500">Uploaded by: {getTeacherNameForResource(resource.teacherId)} on {new Date(resource.uploadDate).toLocaleDateString()}</p>
                  {resource.description && <p className="text-sm text-gray-600 mt-1 italic">{resource.description}</p>}
                </div>
                <Button 
                  onClick={() => handleDownload(resource.fileURL, resource.fileName)} 
                  variant="secondary" 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  View/Download
                </Button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default StudentClassResourcesScreen;