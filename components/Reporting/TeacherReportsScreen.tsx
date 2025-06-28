
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, Student, Grade } from '../../types';
import PlaceholderContent from '../Shared/PlaceholderContent';

type TeacherReportType = '' | 'classGradeSheet' | 'studentProgressSnippet';

interface GradeSheetData {
  students: {
    id: string;
    name: string;
    grades: Record<string, string>; // assignmentName: score
  }[];
  assignmentNames: string[];
  assignmentAverages: Record<string, string>;
}

const TeacherReportsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedReport, setSelectedReport] = useState<TeacherReportType>('');
  const [selectedClassIdForReport, setSelectedClassIdForReport] = useState<string>('');

  if (!context || !context.currentUser?.teacherId) {
    return <PlaceholderContent title="Loading Report Data..." />;
  }

  const { currentUser, schoolClasses, students: allStudents, grades: allGrades } = context;
  const teacherId = currentUser.teacherId;

  const teacherAssignedClasses = useMemo(() => {
    return schoolClasses.filter(sc => sc.teacherId === teacherId);
  }, [schoolClasses, teacherId]);

  // Set default selected class for report if not already set and teacher has classes
  useState(() => {
    if (teacherAssignedClasses.length > 0 && !selectedClassIdForReport) {
      setSelectedClassIdForReport(teacherAssignedClasses[0].id);
    }
  });


  const classGradeSheetData = useMemo((): GradeSheetData | null => {
    if (selectedReport !== 'classGradeSheet' || !selectedClassIdForReport) return null;

    const selectedClass = schoolClasses.find(sc => sc.id === selectedClassIdForReport);
    if (!selectedClass) return null;

    const studentsInClass = allStudents.filter(s => selectedClass.studentIds.includes(s.id));
    if (studentsInClass.length === 0) return { students: [], assignmentNames: [], assignmentAverages: {} };

    const gradesForClassStudents = allGrades.filter(
      grade => grade.classId === selectedClass.id && studentsInClass.some(s => s.id === grade.studentId)
    );

    const assignmentNames = Array.from(
      new Set(gradesForClassStudents.map(g => g.subjectOrAssignmentName))
    ).sort();
    
    const studentGradeMap = studentsInClass.map(student => {
      const studentGrades: Record<string, string> = {};
      assignmentNames.forEach(assignName => {
        const grade = gradesForClassStudents.find(
          g => g.studentId === student.id && g.subjectOrAssignmentName === assignName
        );
        studentGrades[assignName] = grade ? grade.score : '-';
      });
      return { id: student.id, name: student.name, grades: studentGrades };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const assignmentAverages: Record<string, string> = {};
    assignmentNames.forEach(assignName => {
        let sum = 0;
        let count = 0;
        studentGradeMap.forEach(s => {
            const score = s.grades[assignName];
            if (score && !isNaN(parseFloat(score))) {
                sum += parseFloat(score);
                count++;
            }
        });
        assignmentAverages[assignName] = count > 0 ? (sum / count).toFixed(1) : 'N/A';
    });


    return { students: studentGradeMap, assignmentNames, assignmentAverages };
  }, [selectedReport, selectedClassIdForReport, schoolClasses, allStudents, allGrades]);

  const reportOptions: { value: TeacherReportType; label: string }[] = [
    { value: '', label: 'Select a Report' },
    { value: 'classGradeSheet', label: 'Class Grade Sheet' },
    { value: 'studentProgressSnippet', label: 'Student Progress Snippet (Placeholder)' },
  ];

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'classGradeSheet':
        if (teacherAssignedClasses.length === 0) {
            return <p className="mt-4 text-gray-500">You are not assigned to any classes to generate a grade sheet for.</p>;
        }
        if (!selectedClassIdForReport) {
            return <p className="mt-4 text-gray-500">Please select a class to view its grade sheet.</p>;
        }
        if (!classGradeSheetData) {
          return <p className="mt-4 text-gray-500">Loading grade sheet data or no data available...</p>;
        }
        if (classGradeSheetData.students.length === 0) {
          return <p className="mt-4 text-gray-500">No students enrolled in the selected class.</p>;
        }
        if (classGradeSheetData.assignmentNames.length === 0) {
          return <p className="mt-4 text-gray-500">No grades or assignments recorded for this class yet.</p>;
        }
        return (
          <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Grade Sheet for: {schoolClasses.find(sc => sc.id === selectedClassIdForReport)?.name}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Student Name</th>
                    {classGradeSheetData.assignmentNames.map(name => (
                      <th key={name} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classGradeSheetData.students.map(student => (
                    <tr key={student.id}>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white z-10">{student.name}</td>
                      {classGradeSheetData.assignmentNames.map(assignName => (
                        <td key={`${student.id}-${assignName}`} className="px-3 py-2 text-center whitespace-nowrap text-gray-600">
                          {student.grades[assignName] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Optional: Average Row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600 uppercase sticky left-0 bg-gray-50 z-10">Class Average</td>
                    {classGradeSheetData.assignmentNames.map(assignName => (
                        <td key={`avg-${assignName}`} className="px-3 py-2 text-center whitespace-nowrap text-xs text-gray-600">
                           {classGradeSheetData.assignmentAverages[assignName]}
                        </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'studentProgressSnippet':
        return <PlaceholderContent title="Student Progress Snippet" message="This report is not yet implemented." />;
      default:
        return <p className="mt-6 text-gray-500">Please select a report type to view data.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Reports</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
        <div>
            <label htmlFor="report-select-teacher" className="block text-sm font-medium text-gray-700 mb-1">
            Select Report:
            </label>
            <select
            id="report-select-teacher"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as TeacherReportType)}
            className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
            {reportOptions.map(option => (
                <option key={option.value} value={option.value} disabled={option.value === ''}>
                {option.label}
                </option>
            ))}
            </select>
        </div>

        {selectedReport === 'classGradeSheet' && teacherAssignedClasses.length > 0 && (
          <div>
            <label htmlFor="class-select-report" className="block text-sm font-medium text-gray-700 mb-1">
              For Class:
            </label>
            <select
              id="class-select-report"
              value={selectedClassIdForReport}
              onChange={(e) => setSelectedClassIdForReport(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {teacherAssignedClasses.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {selectedReport === 'classGradeSheet' && teacherAssignedClasses.length === 0 && (
           <p className="mt-4 text-gray-500 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            You are not assigned to any classes, so the 'Class Grade Sheet' report cannot be generated.
          </p>
      )}

      {renderSelectedReport()}
    </div>
  );
};

export default TeacherReportsScreen;
