import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { UserRole, RegistrationDetails, Student } from '../../types';
import { APP_NAME } from '../../constants';
import Input from '../Shared/Input';
import Button from '../Shared/Button';

const RegisterScreen: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  
  // Role-specific details
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState<number | ''>('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [parentLinksToStudentId, setParentLinksToStudentId] = useState('');

  // Individual field errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [studentNameError, setStudentNameError] = useState('');
  const [studentGradeError, setStudentGradeError] = useState('');
  const [teacherNameError, setTeacherNameError] = useState('');
  const [teacherSubjectError, setTeacherSubjectError] = useState('');
  const [parentLinkError, setParentLinkError] = useState('');

  const [formMessage, setFormMessage] = useState(''); 
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [availableStudentsForParent, setAvailableStudentsForParent] = useState<Student[]>([]);

  useEffect(() => {
    if (role === UserRole.PARENT && context) {
      setAvailableStudentsForParent(context.students);
      if (context.students.length > 0 && !parentLinksToStudentId) {
        setParentLinksToStudentId(context.students[0].id);
      }
    }
  }, [role, context, parentLinksToStudentId]);


  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setStudentNameError('');
    setStudentGradeError('');
    setTeacherNameError('');
    setTeacherSubjectError('');
    setParentLinkError('');
    setFormMessage('');
    setFormSuccessMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (role === UserRole.STUDENT) {
      if (!studentName.trim()) {
        setStudentNameError("Student name is required.");
        isValid = false;
      }
      if (studentGrade === '') {
        setStudentGradeError("Student grade is required.");
        isValid = false;
      } else if (Number(studentGrade) < 1 || Number(studentGrade) > 12) {
        setStudentGradeError("Grade must be between 1 and 12.");
        isValid = false;
      }
    } else if (role === UserRole.TEACHER) {
      if (!teacherName.trim()) {
        setTeacherNameError("Teacher name is required.");
        isValid = false;
      }
      if (!teacherSubject.trim()) {
        setTeacherSubjectError("Teacher subject is required.");
        isValid = false;
      }
    } else if (role === UserRole.PARENT) {
      if (!parentLinksToStudentId) {
        setParentLinkError("Please select a student to link.");
        isValid = false;
      }
    }
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!context) {
      setFormMessage("Registration service is currently unavailable.");
      return;
    }
    
    setIsSubmitting(true);

    const details: RegistrationDetails = {};
    if (role === UserRole.STUDENT) {
      details.studentName = studentName;
      details.studentGrade = Number(studentGrade);
    } else if (role === UserRole.TEACHER) {
      details.teacherName = teacherName;
      details.teacherSubject = teacherSubject;
    } else if (role === UserRole.PARENT) {
      details.parentLinksToStudentId = parentLinksToStudentId;
    }

    const result = await context.registerUser(email, password, role, details);

    if (result.success) {
      setFormSuccessMessage(`${result.message} You will be redirected to login.`);
      // Reset form fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setStudentName('');
      setStudentGrade('');
      setTeacherName('');
      setTeacherSubject('');
      setParentLinksToStudentId(context.students.length > 0 ? context.students[0].id : '');
      
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setFormMessage(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-600 to-primary-500 p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="text-center mb-8">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-secondary-500 mx-auto mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500">Join {APP_NAME} today!</p>
        </div>

        {formSuccessMessage && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">{formSuccessMessage}</p>}
        {formMessage && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">{formMessage}</p>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" error={emailError} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min. 6 characters)" error={passwordError} />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" error={confirmPasswordError} />
          
          <div>
            <label htmlFor="role-register" className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select id="role-register" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm">
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          {role === UserRole.STUDENT && (
            <>
              <Input label="Full Name (Student)" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student's full name" error={studentNameError} />
              <Input label="Grade" type="number" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Enter grade level (1-12)" error={studentGradeError} />
            </>
          )}

          {role === UserRole.TEACHER && (
            <>
              <Input label="Full Name (Teacher)" type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Enter teacher's full name" error={teacherNameError} />
              <Input label="Subject(s)" type="text" value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} placeholder="e.g., Mathematics, Science" error={teacherSubjectError} />
            </>
          )}

          {role === UserRole.PARENT && context && (
            availableStudentsForParent.length > 0 ? (
                 <div>
                    <label htmlFor="parent-link-student" className="block text-sm font-medium text-gray-700 mb-1">Link to Child (Student)</label>
                    <select 
                        id="parent-link-student" 
                        value={parentLinksToStudentId} 
                        onChange={(e) => setParentLinksToStudentId(e.target.value)} 
                        className={`mt-1 block w-full px-4 py-3 border ${parentLinkError ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm`}
                    >
                        <option value="" disabled>Select your child</option>
                        {availableStudentsForParent.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Grade {s.grade})</option>
                        ))}
                    </select>
                    {parentLinkError && <p className="mt-1 text-xs text-red-600">{parentLinkError}</p>}
                </div>
            ) : (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                    No students available to link. Please ensure students are added to the system first if you are registering as a parent.
                </p>
            )
          )}
          
          <Button type="submit" variant="secondary" className="w-full !mt-6" size="lg" loading={isSubmitting} disabled={isSubmitting}>
            Register
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-secondary-600 hover:text-secondary-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;