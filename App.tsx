
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { User, UserRole, Student, Teacher, PointTransaction, AppContextType, RegistrationDetails, SchoolClass, Grade, Message, ToastNotification, SchoolEvent, Subject, DocumentResource } from './types';
import { MOCK_STUDENTS_INITIAL, MOCK_TEACHERS_INITIAL, MOCK_SUBJECTS_INITIAL, MOCK_POINT_TRANSACTIONS_INITIAL, MOCK_SCHOOL_CLASSES_INITIAL, MOCK_GRADES_INITIAL, MOCK_MESSAGES_INITIAL, MOCK_SCHOOL_EVENTS_INITIAL, MOCK_DOCUMENT_RESOURCES_INITIAL } from './constants';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import MainLayout from './components/Layout/MainLayout';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import AdminStudentManagement from './components/Admin/AdminStudentManagement';
import AdminTeacherManagement from './components/Admin/AdminTeacherManagement';
import AdminClassManagement from './components/Admin/AdminClassManagement';
import AdminSubjectManagement from './components/Admin/AdminSubjectManagement'; 
import AdminParentManagement from './components/Admin/AdminParentManagement';
import AdminLeaderboardScreen from './components/Admin/AdminLeaderboardScreen';
import TeacherPointSystem from './components/Teacher/TeacherPointSystem';
import StudentProfilePage from './components/Student/StudentProfilePage';
import TeacherAttendance from './components/Teacher/TeacherAttendance';
import TeacherMyClassesScreen from './components/Teacher/TeacherMyClassesScreen';
import TeacherGradebookScreen from './components/Teacher/TeacherGradebookScreen'; 
import MessagingScreen from './components/Messaging/MessagingScreen';
import SchoolCalendarScreen from './components/Calendar/SchoolCalendarScreen';
import AdminReportsScreen from './components/Reporting/AdminReportsScreen';
import TeacherReportsScreen from './components/Reporting/TeacherReportsScreen';
import StudentScheduleScreen from './components/Student/StudentScheduleScreen';
import StudentAssignmentsScreen from './components/Student/StudentAssignmentsScreen'; 
import TeacherClassResourcesScreen from './components/Teacher/TeacherClassResources'; 
import StudentClassResourcesScreen from './components/Student/StudentClassResources'; 
import StudentLeaderboardScreen from './components/Student/StudentLeaderboardScreen';
import PlaceholderContent from './components/Shared/PlaceholderContent';

export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Remaining mock data states
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS_INITIAL);
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS_INITIAL);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS_INITIAL); 
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(MOCK_POINT_TRANSACTIONS_INITIAL);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>(MOCK_SCHOOL_CLASSES_INITIAL);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES_INITIAL); 
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES_INITIAL);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>(MOCK_SCHOOL_EVENTS_INITIAL);
  const [documentResources, setDocumentResources] = useState<DocumentResource[]>(MOCK_DOCUMENT_RESOURCES_INITIAL); 
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [notifiedMessageIds, setNotifiedMessageIds] = useState<Set<string>>(new Set());
  
  // Firebase Auth and Firestore listeners
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userProfile = userDocSnap.data() as Omit<User, 'uid' | 'email'>;
                setCurrentUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    ...userProfile
                });
            } else {
                console.error("User document not found in Firestore for UID:", firebaseUser.uid);
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }
        setAuthLoading(false);
    });

    const usersCollectionRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
    };
  }, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setNotifiedMessageIds(new Set());
    } catch (error) {
      console.error("Firebase Logout Error:", error);
    }
  };
  
  const registerUser = async (email: string, password: string, role: UserRole, details: RegistrationDetails): Promise<{success: boolean, message: string}> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        if (!firebaseUser) {
          throw new Error("User creation failed.");
        }

        let newStudent: Student | undefined = undefined;
        let newTeacher: Teacher | undefined = undefined;
        
        const newUserProfile: Omit<User, 'uid' | 'email'> = {
            username: email.split('@')[0],
            role: role,
        };

        if (role === UserRole.STUDENT && details.studentName && details.studentGrade !== undefined) {
          newStudent = addStudent(details.studentName, details.studentGrade);
          newUserProfile.studentId = newStudent.id;
        } else if (role === UserRole.TEACHER && details.teacherName && details.teacherSubject) {
          newTeacher = addTeacher(details.teacherName, details.teacherSubject, firebaseUser.uid);
          newUserProfile.teacherId = newTeacher.id;
        } else if (role === UserRole.PARENT && details.parentLinksToStudentId) {
          const studentToLink = students.find(s => s.id === details.parentLinksToStudentId);
          if (studentToLink) {
            newUserProfile.studentId = studentToLink.id;
            setStudents(prevStudents => 
                prevStudents.map(s => 
                    s.id === studentToLink.id ? { ...s, parentId: firebaseUser.uid } : s
                )
            );
          } else {
             return { success: false, message: "Could not find student to link parent account." };
          }
        }
        
        await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile);

        return { success: true, message: "Registration successful!" };
    } catch (error: any) {
        console.error("Firebase Registration Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: "This email address is already in use." };
        }
        return { success: false, message: error.message || "An unknown registration error occurred." };
    }
  };

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotificationDirectly = useCallback((title: string, message: string, type: 'info' | 'success' | 'error') => {
    const toastId = `toast-direct-${Date.now()}`;
     setNotifications(prev => [
          ...prev,
          {
            id: toastId,
            title: title,
            message: message,
            type: type,
          },
        ]);
    setTimeout(() => {
      removeNotification(toastId);
    }, 5000);
  }, [removeNotification]);

  // The rest of the functions remain the same for now, operating on mock data state
  const addStudent = useCallback((name: string, grade: number): Student => {
    const newStudent: Student = { id: `s${students.length + Date.now()}`, name, grade, points: 0, attendance: [] };
    setStudents(prev => [...prev, newStudent]);
    return newStudent;
  }, [students]);
  
  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prevStudents => prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setGrades(prev => prev.filter(g => g.studentId !== studentId));
    setPointTransactions(prev => prev.filter(pt => pt.studentId !== studentId));
    setSchoolClasses(prev => 
      prev.map(sc => ({
        ...sc,
        studentIds: sc.studentIds.filter(id => id !== studentId)
      }))
    );
     // This logic will need to be updated when users are fully in Firestore
  }, []);

  const deleteParentUser = useCallback((userId: string) => {
    const parentUser = users.find(u => u.uid === userId && u.role === UserRole.PARENT);
    if (parentUser && parentUser.studentId) {
        setStudents(prevStudents => 
            prevStudents.map(s => 
                s.id === parentUser.studentId ? { ...s, parentId: undefined } : s
            )
        );
    }
    // Deletion of user document in Firestore should be handled here
  }, [users]);

  const awardPoints = useCallback((studentId: string, points: number, reason: string, teacherId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, points: s.points + points } : s));
    setPointTransactions(prev => [...prev, { id: `pt${prev.length + Date.now()}`, studentId, teacherId, points, reason, date: new Date().toISOString().split('T')[0] }]);
  }, []);
  
  const markAttendance = useCallback((studentId: string, date: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          const updatedAttendance = student.attendance.filter(att => att.date !== date);
          updatedAttendance.push({ date, status });
          return { ...student, attendance: updatedAttendance };
        }
        return student;
      })
    );
  }, []);

  const addTeacher = useCallback((name: string, subject: string, userId: string): Teacher => {
    const newTeacher: Teacher = { id: `t${teachers.length + Date.now()}`, userId, name, subject };
    setTeachers(prev => [...prev, newTeacher]);
    return newTeacher;
  }, [teachers]);

  const updateTeacher = useCallback((updatedTeacher: Teacher) => {
    setTeachers(prevTeachers => prevTeachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  }, []);

  const deleteTeacher = useCallback((teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setSchoolClasses(prev => 
      prev.map(sc => sc.teacherId === teacherId ? { ...sc, teacherId: null } : sc)
    );
     setDocumentResources(prev => prev.filter(dr => dr.teacherId !== users.find(u=>u.teacherId === teacherId)?.uid));
  }, [users]);

  const addSubject = useCallback((name: string, description?: string): Subject => {
    const newSubject: Subject = {
      id: `subj${subjects.length + Date.now()}`,
      name,
      description: description || '',
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  }, [subjects]);

  const updateSubject = useCallback((updatedSubject: Subject) => {
    setSubjects(prevSubjects => prevSubjects.map(s => s.id === updatedSubject.id ? updatedSubject : s));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setSchoolClasses(prevClasses => 
      prevClasses.map(sc => sc.subjectId === subjectId ? { ...sc, subjectId: null } : sc)
    );
  }, []);

  const addSchoolClass = useCallback((name: string, subjectId?: string | null, description?: string): SchoolClass => {
    const newClass: SchoolClass = {
      id: `c${schoolClasses.length + Date.now()}`,
      name,
      subjectId: subjectId || null,
      description: description || '',
      teacherId: null,
      studentIds: []
    };
    setSchoolClasses(prev => [...prev, newClass]);
    return newClass;
  }, [schoolClasses]);

  const updateSchoolClass = useCallback((updatedClass: SchoolClass) => {
    setSchoolClasses(prevClasses => prevClasses.map(sc => sc.id === updatedClass.id ? updatedClass : sc));
  }, []);

  const deleteSchoolClass = useCallback((classId: string) => {
    setSchoolClasses(prev => prev.filter(sc => sc.id !== classId));
    setGrades(prev => prev.filter(g => g.classId !== classId));
    setDocumentResources(prev => prev.filter(dr => dr.classId !== classId));
  }, []);

  const assignTeacherToClass = useCallback((classId: string, teacherId: string | null) => {
    setSchoolClasses(prevClasses => 
      prevClasses.map(sc => sc.id === classId ? { ...sc, teacherId: teacherId } : sc)
    );
  }, []);

  const assignStudentsToClass = useCallback((classId: string, studentIds: string[]) => {
    setSchoolClasses(prevClasses =>
      prevClasses.map(sc => sc.id === classId ? { ...sc, studentIds: studentIds } : sc)
    );
  }, []);

  const addGrade = useCallback((newGradeData: Omit<Grade, 'id'>): Grade => {
    const newGrade: Grade = { ...newGradeData, id: `g${grades.length + Date.now()}`};
    setGrades(prevGrades => [...prevGrades, newGrade]);
    return newGrade;
  }, [grades]);

  const updateGrade = useCallback((updatedGrade: Grade) => {
    setGrades(prevGrades => prevGrades.map(g => g.id === updatedGrade.id ? updatedGrade : g));
  }, []);

  const deleteGrade = useCallback((gradeId: string) => {
    setGrades(prevGrades => prevGrades.filter(g => g.id !== gradeId));
  }, []);

  const submitAssignment = useCallback((gradeId: string) => {
    setGrades(prevGrades =>
      prevGrades.map(g =>
        g.id === gradeId
          ? { ...g, status: 'Submitted', submissionDate: new Date().toISOString() }
          : g
      )
    );
    addNotificationDirectly("Assignment Submitted", "Your assignment has been submitted successfully.", "success");
  }, [addNotificationDirectly]);

  const sendMessageFunc = useCallback((recipientId: string, subject: string, body: string) => {
    if (!currentUser) {
      console.error("Cannot send message: no user logged in.");
      return;
    }
    const newMessage: Message = {
      id: `msg${messages.length + Date.now()}`,
      senderId: currentUser.uid,
      senderUsername: currentUser.username,
      recipientId,
      subject,
      body,
      dateSent: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]); 
  }, [currentUser, messages]);

  const markMessageAsReadFunc = useCallback((messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  }, []);
  
  const getUnreadMessagesCountFunc = useCallback((): number => {
    if (!currentUser) return 0;
    return messages.filter(msg => msg.recipientId === currentUser.uid && !msg.isRead).length;
  }, [currentUser, messages]);

  const addSchoolEvent = useCallback((newEventData: Omit<SchoolEvent, 'id'>): SchoolEvent => {
    const newEvent: SchoolEvent = {
        ...newEventData,
        id: `evt${schoolEvents.length + Date.now()}`
    };
    setSchoolEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [schoolEvents]);

  const addDocumentResource = useCallback(async (
    resourceData: Omit<DocumentResource, 'id' | 'fileURL'>, 
    file: File
  ): Promise<DocumentResource | null> => {
    if (!currentUser || !currentUser.teacherId) {
      addNotificationDirectly("Error", "User not authorized to upload resources.", "error");
      return null;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newResource: DocumentResource = {
          ...resourceData,
          id: `docres-${Date.now()}`,
          fileURL: reader.result as string,
          teacherId: currentUser.uid,
        };
        setDocumentResources(prev => [...prev, newResource]);
        resolve(newResource);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        addNotificationDirectly("Upload Failed", "Could not read the selected file.", "error");
        reject(null);
      };
      reader.readAsDataURL(file);
    });
  }, [currentUser, addNotificationDirectly]);

  const deleteDocumentResource = useCallback((resourceId: string) => {
    setDocumentResources(prev => prev.filter(dr => dr.id !== resourceId));
  }, []);

  const contextValue: AppContextType = {
    currentUser,
    users,
    students,
    teachers,
    subjects, 
    pointTransactions,
    schoolClasses,
    grades,
    messages,
    schoolEvents,
    documentResources, 
    notifications, 
    login,
    logout,
    registerUser,
    addStudent,
    updateStudent,
    deleteStudent, 
    deleteParentUser,
    awardPoints,
    markAttendance,
    addTeacher,
    updateTeacher,
    deleteTeacher, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    addSchoolClass,
    updateSchoolClass,
    deleteSchoolClass, 
    assignTeacherToClass,
    assignStudentsToClass,
    addGrade,
    updateGrade,
    deleteGrade,
    submitAssignment,
    sendMessage: sendMessageFunc, 
    markMessageAsRead: markMessageAsReadFunc,
    getUnreadMessagesCount: getUnreadMessagesCountFunc,
    removeNotification, 
    addSchoolEvent,
    addNotificationDirectly,
    addDocumentResource, 
    deleteDocumentResource, 
  };
  
  if (authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <p>Loading application...</p>
          </div>
      );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginScreen />} />
          <Route path="/register" element={currentUser ? <Navigate to="/" /> : <RegisterScreen />} />
          <Route path="/*" element={currentUser ? <MainLayout /> : <Navigate to="/login" />}>
            <Route index element={<DashboardScreen />} />
            <Route path="messages" element={<MessagingScreen />} />
            <Route path="calendar" element={<SchoolCalendarScreen />} />
            
            {currentUser?.role === UserRole.ADMIN && (
              <>
                <Route path="admin/dashboard" element={<DashboardScreen />} />
                <Route path="admin/students" element={<AdminStudentManagement />} />
                <Route path="admin/teachers" element={<AdminTeacherManagement />} />
                <Route path="admin/classes" element={<AdminClassManagement />} />
                <Route path="admin/subjects" element={<AdminSubjectManagement />} /> 
                <Route path="admin/parents" element={<AdminParentManagement />} />
                <Route path="admin/leaderboard" element={<AdminLeaderboardScreen />} />
                <Route path="admin/reports" element={<AdminReportsScreen />} />
              </>
            )}
            {currentUser?.role === UserRole.TEACHER && (
              <>
                <Route path="teacher/dashboard" element={<DashboardScreen />} />
                <Route path="teacher/my-classes" element={<TeacherMyClassesScreen />} />
                <Route path="teacher/attendance" element={<TeacherAttendance />} />
                <Route path="teacher/points" element={<TeacherPointSystem />} />
                <Route path="teacher/grades" element={<TeacherGradebookScreen />} />
                <Route path="teacher/reports" element={<TeacherReportsScreen />} />
                <Route path="teacher/resources" element={<TeacherClassResourcesScreen />} /> 
              </>
            )}
            {currentUser?.role === UserRole.STUDENT && (
              <>
                <Route path="student/dashboard" element={<DashboardScreen />} />
                <Route path="student/profile" element={<StudentProfilePage studentId={currentUser.studentId!} />} />
                <Route path="student/schedule" element={<StudentScheduleScreen />} />
                <Route path="student/assignments" element={<StudentAssignmentsScreen />} /> 
                <Route path="student/resources" element={<StudentClassResourcesScreen />} /> 
                <Route path="student/points" element={<StudentProfilePage studentId={currentUser.studentId!} section="points"/>} />
                <Route path="student/grades" element={<StudentProfilePage studentId={currentUser.studentId!} section="grades"/>} />
                <Route path="student/attendance" element={<StudentProfilePage studentId={currentUser.studentId!} section="attendance"/>} />
                <Route path="student/leaderboard" element={<StudentLeaderboardScreen />} />
              </>
            )}
            {currentUser?.role === UserRole.PARENT && (
              <>
                <Route path="parent/dashboard" element={<DashboardScreen />} />
                <Route path="parent/child-profile" element={<StudentProfilePage studentId={currentUser.studentId!} />} />
                {/* <Route path="parent/child-resources" element={<StudentClassResourcesScreen studentIdForParent={currentUser.studentId!} />} /> */}
                <Route path="parent/child-points" element={<StudentProfilePage studentId={currentUser.studentId!} section="points"/>} />
                <Route path="parent/child-grades" element={<StudentProfilePage studentId={currentUser.studentId!} section="grades"/>} />
              </>
            )}
             <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;