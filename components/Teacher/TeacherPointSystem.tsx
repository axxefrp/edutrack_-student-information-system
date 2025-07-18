import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { Student, PointRuleSuggestion } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

const TeacherPointSystem: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pointsToAward, setPointsToAward] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validation errors
  const [pointsError, setPointsError] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!context || !context.currentUser) return null;

  const { students, awardPoints, currentUser, pointRuleSuggestions, generatePointSuggestions, applyPointSuggestion, dismissPointSuggestion } = context;

  // Get suggestions for current teacher
  const teacherSuggestions = useMemo(() => {
    return pointRuleSuggestions.filter(suggestion =>
      suggestion.teacherId === currentUser.uid && !suggestion.isApplied
    );
  }, [pointRuleSuggestions, currentUser.uid]);

  // Get suggestions for selected student
  const selectedStudentSuggestions = useMemo(() => {
    if (!selectedStudent) return [];
    return generatePointSuggestions(selectedStudent.id, currentUser.uid);
  }, [selectedStudent, generatePointSuggestions, currentUser.uid]);

  const handleApplySuggestion = async (suggestion: PointRuleSuggestion) => {
    try {
      await applyPointSuggestion(suggestion.id);
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (suggestion: PointRuleSuggestion) => {
    try {
      await dismissPointSuggestion(suggestion.id);
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setPointsError('');
    setReasonError('');

    if (pointsToAward === '') {
      setPointsError('Points are required.');
      isValid = false;
    } else if (isNaN(Number(pointsToAward)) || Number(pointsToAward) <= 0) {
      setPointsError('Points must be a positive number.');
      isValid = false;
    }
    if (!reason.trim()) {
      setReasonError('Reason is required.');
      isValid = false;
    }
    return isValid;
  };

  const handleAwardPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    if (selectedStudent && currentUser.uid) { // currentUser.uid check
      setIsSubmitting(true);
      setTimeout(() => {
        awardPoints(selectedStudent.id, Number(pointsToAward), reason, currentUser.uid);
        setIsSubmitting(false);
        closeModalAndResetForm();
      }, 1000); // Simulate API call
    }
  };
  
  const resetFormFieldsAndErrors = () => {
    setPointsToAward('');
    setReason('');
    setPointsError('');
    setReasonError('');
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    resetFormFieldsAndErrors();
    setIsModalOpen(true);
  };

  const closeModalAndResetForm = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    resetFormFieldsAndErrors();
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Award Points to Students</h1>
      
      <div className="mb-6">
        <Input
          label="Search Students"
          placeholder="Enter student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Point Rule Suggestions */}
      {teacherSuggestions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Point Suggestions</h2>
            <Button
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant="ghost"
              size="sm"
            >
              {showSuggestions ? 'Hide' : 'Show'} ({teacherSuggestions.length})
            </Button>
          </div>

          {showSuggestions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                {teacherSuggestions.map((suggestion) => {
                  const student = students.find(s => s.id === suggestion.studentId);
                  return (
                    <div key={suggestion.id} className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{student?.name}</span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              +{suggestion.suggestedPoints} points
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleApplySuggestion(suggestion)}
                            variant="primary"
                            size="sm"
                          >
                            Apply
                          </Button>
                          <Button
                            onClick={() => handleDismissSuggestion(suggestion)}
                            variant="ghost"
                            size="sm"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-semibold text-primary-700">{student.name}</h2>
                  <p className="text-sm text-gray-500">Grade: {student.grade}</p>
                  <p className="text-2xl font-bold text-secondary-600 my-2">{student.points} <span className="text-sm font-normal">Points</span></p>
                </div>
                <Button onClick={() => openModal(student)} variant="primary" className="w-full mt-4">Award Points</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
         <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-gray-500 text-lg">No students found matching "{searchTerm}".</p>
            {searchTerm && <p className="text-sm text-gray-400">Try a different name or clear the search.</p>}
         </div>
      )}


      {selectedStudent && (
        <Modal isOpen={isModalOpen} onClose={closeModalAndResetForm} title={`Award Points to ${selectedStudent.name}`}>
          <div className="space-y-4">
            {/* Student-specific suggestions */}
            {selectedStudentSuggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-3">Suggested Point Awards:</h4>
                <div className="space-y-2">
                  {selectedStudentSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-yellow-200">
                      <div>
                        <span className="text-sm font-medium text-gray-900">+{suggestion.suggestedPoints} points</span>
                        <p className="text-xs text-gray-600">{suggestion.reason}</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setPointsToAward(suggestion.suggestedPoints);
                          setReason(suggestion.reason);
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAwardPoints} className="space-y-4">
              <Input
              label="Points"
              type="number"
              value={pointsToAward === '' ? '' : String(pointsToAward)}
              onChange={(e) => { setPointsToAward(e.target.value === '' ? '' : parseInt(e.target.value, 10)); if(pointsError) setPointsError(''); }}
              placeholder="Enter points to award"
              required
              min="1"
              disabled={isSubmitting}
              error={pointsError}
            />
            <Input
              label="Reason"
              type="text"
              value={reason}
              onChange={(e) => { setReason(e.target.value); if(reasonError) setReasonError(''); }}
              placeholder="e.g., Excellent class participation"
              required
              disabled={isSubmitting}
              error={reasonError}
            />
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" onClick={closeModalAndResetForm} variant="ghost" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>Award Points</Button>
            </div>
          </form>
        </div>
      </Modal>
      )}
    </div>
  );
};

export default TeacherPointSystem;