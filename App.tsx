
import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider } from './hooks/useTheme';
import { auth, db } from './firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { User, UserRole, Student, Teacher, PointTransaction, AppContextType, RegistrationDetails, SchoolClass, Grade, Message, ToastNotification, SchoolEvent, Subject, DocumentResource, PointRule, PointRuleSuggestion } from './types';

// Declare global EduTrackLoader interface
declare global {
  interface Window {
    EduTrackLoader?: {
      updateProgress: (percent: number, message?: string) => void;
      hide: () => void;
    };
  }
}
import { evaluateRulesForStudents } from './utils/pointRuleEngine';
import { createOptimizedListener, clearCache } from './utils/firebaseQueryOptimization';
import { serviceWorkerManager } from './utils/serviceWorkerManager';
import OfflineStatusIndicator from './components/Shared/OfflineStatusIndicator';
// Core components (loaded immediately)
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import LandingPage from './components/Landing/LandingPage';
import MainLayout from './components/Layout/MainLayout';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import LazyLoadingSpinner from './components/Shared/LazyLoadingSpinner';

// Admin components (lazy loaded)
const AdminStudentManagement = lazy(() => import('./components/Admin/AdminStudentManagement'));
const AdminTeacherManagement = lazy(() => import('./components/Admin/AdminTeacherManagement'));
const AdminClassManagement = lazy(() => import('./components/Admin/AdminClassManagement'));
const AdminSubjectManagement = lazy(() => import('./components/Admin/AdminSubjectManagement'));
const AdminParentManagement = lazy(() => import('./components/Admin/AdminParentManagement'));
const AdminLeaderboardScreen = lazy(() => import('./components/Admin/AdminLeaderboardScreen'));
const AdminTeacherProfileView = lazy(() => import('./components/Admin/AdminTeacherProfileView'));
const AdminStudentProfileView = lazy(() => import('./components/Admin/AdminStudentProfileView'));
const AdminPointRulesManagement = lazy(() => import('./components/Admin/AdminPointRulesManagement'));
// Settings and shared components (lazy loaded)
const SettingsScreen = lazy(() => import('./components/Settings/SettingsScreen'));
const MessagingScreen = lazy(() => import('./components/Messaging/MessagingScreen'));

// Teacher components (lazy loaded)
const TeacherPointSystem = lazy(() => import('./components/Teacher/TeacherPointSystem'));
const TeacherAttendance = lazy(() => import('./components/Teacher/TeacherAttendance'));
const TeacherMyClassesScreen = lazy(() => import('./components/Teacher/TeacherMyClassesScreen'));
const TeacherGradebookScreen = lazy(() => import('./components/Teacher/TeacherGradebookScreen'));
const ComprehensiveTeacherGradebook = lazy(() => import('./components/Teacher/ComprehensiveTeacherGradebook'));
const TeacherMasterGradesheetScreen = lazy(() => import('./components/Teacher/TeacherMasterGradesheetScreen'));
const TeacherClassResourcesScreen = lazy(() => import('./components/Teacher/TeacherClassResources'));
const TeacherReportsScreen = lazy(() => import('./components/Reporting/TeacherReportsScreen'));

// Student components (lazy loaded)
const StudentProfilePage = lazy(() => import('./components/Student/StudentProfilePage'));
const StudentScheduleScreen = lazy(() => import('./components/Student/StudentScheduleScreen'));
const StudentAssignmentsScreen = lazy(() => import('./components/Student/StudentAssignmentsScreen'));
const StudentClassResourcesScreen = lazy(() => import('./components/Student/StudentClassResources'));
const StudentLeaderboardScreen = lazy(() => import('./components/Student/StudentLeaderboardScreen'));

// Calendar and reporting components (lazy loaded)
const SchoolCalendarScreen = lazy(() => import('./components/Calendar/SchoolCalendarScreen'));
const LiberianAcademicPlannerScreen = lazy(() => import('./components/Calendar/LiberianAcademicPlannerScreen'));
const LiberianCulturalShowcase = lazy(() => import('./components/Calendar/LiberianCulturalShowcase'));
const AdminReportsScreen = lazy(() => import('./components/Reporting/AdminReportsScreen'));
const AdminMasterGradesheetScreen = lazy(() => import('./components/Admin/AdminMasterGradesheetScreen'));
const AdminMoEReportingScreen = lazy(() => import('./components/Admin/AdminMoEReportingScreen'));


export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Remaining mock data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); 
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>([]);
  const [documentResources, setDocumentResources] = useState<DocumentResource[]>([]);
  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [pointRuleSuggestions, setPointRuleSuggestions] = useState<PointRuleSuggestion[]>([]);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  
  // Firebase Auth and Firestore listeners
  // Optimized Firestore point transactions listener
  useEffect(() => {
    const unsubscribeTransactions = createOptimizedListener<PointTransaction>(
      'pointTransactions',
      (transactionsData) => setPointTransactions(transactionsData),
      (error) => {
        console.error("❌ Error in optimized point transactions listener:", error);
        setPointTransactions([]);
      }
    );
    return () => unsubscribeTransactions();
  }, []);
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn("Firebase initialization timeout - continuing with offline mode");
        setAuthLoading(false);
        setFirebaseError("Connection timeout - running in offline mode");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading]);

  // Update loading progress when React app starts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.EduTrackLoader) {
      window.EduTrackLoader.updateProgress(60, 'Initializing Firebase services...');
    }
  }, []);

  // Hide initial loader when auth loading completes
  useEffect(() => {
    if (!authLoading && typeof window !== 'undefined' && window.EduTrackLoader) {
      window.EduTrackLoader.updateProgress(100, 'Ready!');
      setTimeout(() => {
        window.EduTrackLoader?.hide();
      }, 500);
    }
  }, [authLoading]);

  // Initialize service worker for Liberian school offline functionality
  useEffect(() => {
    // Service worker is automatically initialized via serviceWorkerManager import
    console.log('🇱🇷 EduTrack Service Worker initialized for Liberian schools');

    // Prefetch critical data for offline access
    if (currentUser) {
      const criticalUrls = [
        '/#/admin/students',
        '/#/teacher/my-classes',
        '/#/teacher/attendance',
        '/#/admin/classes'
      ];
      serviceWorkerManager.prefetchData(criticalUrls);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
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
        setFirebaseError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error in auth state change:", error);
        setCurrentUser(null);
        setFirebaseError("Firebase connection error");
      } finally {
        setAuthLoading(false);
      }
    });

    const usersCollectionRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        console.log('👥 Users loaded:', snapshot.docs.length);
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      },
      (error) => {
        console.error("❌ Error listening to users:", error);
        console.error("Error code:", error.code, "Error message:", error.message);
        setUsers([]);
      }
    );

    // Optimized Firestore students listener
    const unsubscribeStudents = createOptimizedListener<Student>(
      'students',
      (studentsData) => setStudents(studentsData),
      (error) => {
        console.error("❌ Error in optimized students listener:", error);
        setStudents([]);
      }
    );

    // Optimized Firestore teachers listener
    const unsubscribeTeachers = createOptimizedListener<Teacher>(
      'teachers',
      (teachersData) => {
        console.log('Teachers loaded from optimized Firestore:', teachersData.length, teachersData);
        setTeachers(teachersData);
      },
      (error) => {
        console.error("❌ Error in optimized teachers listener:", error);
        setTeachers([]);
      }
    );

    // Optimized Firestore classes listener
    const unsubscribeClasses = createOptimizedListener<SchoolClass>(
      'classes',
      (classesData) => {
        // Defensive: ensure subjectIds and teacherIds are always arrays
        const processedClasses = classesData.map(classData => {
          const data = classData as any; // Type assertion for legacy data compatibility
          return {
            ...classData,
            subjectIds: Array.isArray(classData.subjectIds) ? classData.subjectIds : [],
            teacherIds: Array.isArray(classData.teacherIds) ? classData.teacherIds : (data.teacherId ? [data.teacherId] : []),
          };
        });
        setSchoolClasses(processedClasses);
      },
      (error) => {
        console.error("❌ Error in optimized classes listener:", error);
        setSchoolClasses([]);
      }
    );

    // Firestore subjects listener
    const subjectsCollectionRef = collection(db, "subjects");
    const unsubscribeSubjects = onSnapshot(subjectsCollectionRef, (snapshot) => {
      const subjectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Defensive: ensure required fields exist and are strings
        if (typeof data.name !== 'string' || !doc.id) {
          console.warn('Malformed subject document:', doc.id, data);
          return null;
        }
        return { ...data, id: doc.id } as Subject;
      }).filter(Boolean);
      setSubjects(subjectsData as Subject[]);
    });

    // Optimized Firestore grades listener
    const unsubscribeGrades = createOptimizedListener<Grade>(
      'grades',
      (gradesData) => setGrades(gradesData),
      (error) => {
        console.error("❌ Error in optimized grades listener:", error);
        setGrades([]);
      }
    );

    // Firestore messages listener
    const messagesCollectionRef = collection(db, "messages");
    const unsubscribeMessages = onSnapshot(messagesCollectionRef, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
      setMessages(messagesData);
    });

    // Firestore events listener
    const eventsCollectionRef = collection(db, "events");
    const unsubscribeEvents = onSnapshot(eventsCollectionRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SchoolEvent));
      setSchoolEvents(eventsData);
    });

    // Firestore document resources listener
    const resourcesCollectionRef = collection(db, "resources");
    const unsubscribeResources = onSnapshot(resourcesCollectionRef, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DocumentResource));
      setDocumentResources(resourcesData);
    });

    // Firestore point rules listener
    const pointRulesCollectionRef = collection(db, "pointRules");
    const unsubscribePointRules = onSnapshot(pointRulesCollectionRef, (snapshot) => {
      const pointRulesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PointRule));
      setPointRules(pointRulesData);
    });

    // Firestore point rule suggestions listener
    const suggestionsCollectionRef = collection(db, "pointRuleSuggestions");
    const unsubscribeSuggestions = onSnapshot(suggestionsCollectionRef, (snapshot) => {
      const suggestionsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PointRuleSuggestion));
      setPointRuleSuggestions(suggestionsData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
      unsubscribeStudents();
      unsubscribeTeachers();
      unsubscribeClasses();
      unsubscribeSubjects();
      unsubscribeGrades();
      unsubscribeMessages();
      unsubscribeEvents();
      unsubscribeResources();
      unsubscribePointRules();
      unsubscribeSuggestions();
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
      // Clear Firebase query cache to prevent memory leaks
      clearCache();
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
      // Removed unused newStudent and newTeacher variables
      let newUserProfile: Omit<User, 'uid' | 'email'> = {
        username: email.split('@')[0],
        role: role,
      };

      // Helper to generate unique ID with prefix and 4 random digits
      const generateUniqueId = async (prefix: string, collection: string) => {
        let unique = false;
        let id = '';
        while (!unique) {
          id = prefix + Math.floor(1000 + Math.random() * 9000);
          const docRef = doc(db, collection, id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) unique = true;
        }
        return id;
      };

      if (role === UserRole.STUDENT && details.studentName && details.studentGrade !== undefined) {
        // Generate unique student ID (STxxxx)
        const studentId = await generateUniqueId('ST', 'students');
        await setDoc(doc(db, 'students', studentId), {
          id: studentId,
          name: details.studentName,
          grade: details.studentGrade,
          points: 0,
          attendance: []
        });
        newUserProfile.studentId = studentId;
      } else if (role === UserRole.TEACHER && details.teacherName && Array.isArray(details.teacherSubjectIds) && details.teacherSubjectIds.length > 0) {
        // Validate that all subject IDs exist
        const validSubjectIds = details.teacherSubjectIds.filter(subjectId =>
          subjects.some(subject => subject.id === subjectId)
        );

        if (validSubjectIds.length === 0) {
          return { success: false, message: "Please select at least one valid subject." };
        }

        // Generate unique teacher ID (TCxxxx)
        const teacherId = await generateUniqueId('TC', 'teachers');
        console.log('Creating teacher with ID:', teacherId, 'for user:', firebaseUser.uid);

        await setDoc(doc(db, 'teachers', teacherId), {
          id: teacherId,
          userId: firebaseUser.uid,
          name: details.teacherName,
          subjectIds: validSubjectIds
        });

        console.log('Teacher created successfully:', teacherId);
        newUserProfile.teacherId = teacherId;
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
      } else if (role === UserRole.ADMIN) {
        // Only one admin allowed, with a fixed ID
        const adminId = 'ADMIN001';
        await setDoc(doc(db, 'admins', adminId), { id: adminId, role: UserRole.ADMIN });
      }
      // Remove any undefined fields before writing to Firestore
      const filteredUserProfile = Object.fromEntries(
        Object.entries(newUserProfile).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, "users", firebaseUser.uid), filteredUserProfile);
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

  // Firestore-backed Student CRUD
  const addStudent = useCallback(async (name: string, grade: number): Promise<Student | null> => {
    try {
      const docRef = await addDoc(collection(db, "students"), {
        name,
        grade,
        points: 0,
        attendance: []
      });
      const newStudent: Student = { id: docRef.id, name, grade, points: 0, attendance: [] };
      return newStudent;
    } catch (error) {
      console.error("Error adding student to Firestore:", error);
      return null;
    }
  }, []);

  const updateStudent = useCallback(async (updatedStudent: Student) => {
    try {
      const { id, ...studentData } = updatedStudent;
      await updateDoc(doc(db, "students", id), studentData);
    } catch (error) {
      console.error("Error updating student in Firestore:", error);
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: string) => {
    try {
      await deleteDoc(doc(db, "students", studentId));
      // Optionally: delete related grades, point transactions, and update classes in Firestore as well
    } catch (error) {
      console.error("Error deleting student from Firestore:", error);
    }
  }, []);

  const deleteParentUser = useCallback((userId: string) => {
    // Firestore-backed parent deletion
    const parentUser = users.find(u => u.uid === userId && u.role === UserRole.PARENT);
    (async () => {
      try {
        if (parentUser && parentUser.studentId) {
          // Remove parentId from student in Firestore
          const studentRef = doc(db, "students", parentUser.studentId);
          await updateDoc(studentRef, { parentId: null });
        }
        // Delete parent user document from Firestore
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error("Error deleting parent user from Firestore:", error);
      }
    })();
  }, [users]);

  const awardPoints = useCallback((studentId: string, points: number, reason: string, teacherId: string) => {
    (async () => {
      try {
        // Update student points in Firestore
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const studentData = studentSnap.data();
          await updateDoc(studentRef, { points: (studentData.points || 0) + points });
        }
        // Add point transaction to Firestore
        await addDoc(collection(db, "pointTransactions"), {
          studentId,
          teacherId,
          points,
          reason,
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error("Error awarding points in Firestore:", error);
      }
    })();
  }, []);
  
  const markAttendance = useCallback((studentId: string, date: string, status: 'present' | 'absent' | 'late') => {
    (async () => {
      try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const studentData = studentSnap.data();
          const prevAttendance = Array.isArray(studentData.attendance) ? studentData.attendance : [];
          const updatedAttendance = prevAttendance.filter((att: any) => att.date !== date);
          updatedAttendance.push({ date, status });
          await updateDoc(studentRef, { attendance: updatedAttendance });
        }
      } catch (error) {
        console.error("Error marking attendance in Firestore:", error);
      }
    })();
  }, []);


  // Firestore-backed Teacher CRUD
  const addTeacher = useCallback(async (name: string, subjectIds: string[], userId: string): Promise<Teacher | null> => {
    try {
      // Generate unique teacher ID (TCxxxx) to be consistent with registration
      const generateUniqueId = async (prefix: string, collection: string) => {
        let unique = false;
        let id = '';
        while (!unique) {
          id = prefix + Math.floor(1000 + Math.random() * 9000);
          const docRef = doc(db, collection, id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) unique = true;
        }
        return id;
      };

      const teacherId = await generateUniqueId('TC', 'teachers');
      await setDoc(doc(db, 'teachers', teacherId), {
        id: teacherId,
        userId,
        name,
        subjectIds: subjectIds || []
      });

      const newTeacher: Teacher = {
        id: teacherId,
        userId,
        name,
        subjectIds: subjectIds || []
      };
      return newTeacher;
    } catch (error) {
      console.error("Error adding teacher to Firestore:", error);
      return null;
    }
  }, []);

  const updateTeacher = useCallback(async (updatedTeacher: Teacher) => {
    try {
      const { id, ...teacherData } = updatedTeacher;
      await updateDoc(doc(db, "teachers", id), teacherData);
    } catch (error) {
      console.error("Error updating teacher in Firestore:", error);
    }
  }, []);

  const deleteTeacher = useCallback(async (teacherId: string) => {
    try {
      await deleteDoc(doc(db, "teachers", teacherId));
      setSchoolClasses(prev =>
        prev.map(sc => ({
          ...sc,
          teacherIds: sc.teacherIds.filter(id => id !== teacherId)
        }))
      );
      setDocumentResources(prev => prev.filter(dr => dr.teacherId !== users.find(u => u.teacherId === teacherId)?.uid));
    } catch (error) {
      console.error("Error deleting teacher from Firestore:", error);
    }
  }, [users]);


  // Firestore-backed Subject CRUD
  const addSubject = useCallback(async (name: string, description?: string): Promise<Subject | null> => {
    try {
      const docRef = await addDoc(collection(db, "subjects"), {
        name,
        description: description || ''
      });
      const newSubject: Subject = { id: docRef.id, name, description: description || '' };
      return newSubject;
    } catch (error) {
      console.error("Error adding subject to Firestore:", error);
      return null;
    }
  }, []);

  const updateSubject = useCallback(async (updatedSubject: Subject) => {
    try {
      const { id, ...subjectData } = updatedSubject;
      await updateDoc(doc(db, "subjects", id), subjectData);
    } catch (error) {
      console.error("Error updating subject in Firestore:", error);
    }
  }, []);

  const deleteSubject = useCallback(async (subjectId: string) => {
    try {
      await deleteDoc(doc(db, "subjects", subjectId));
      setSchoolClasses(prevClasses =>
        prevClasses.map(sc =>
          sc.subjectIds && sc.subjectIds.includes(subjectId)
            ? { ...sc, subjectIds: sc.subjectIds.filter(id => id !== subjectId) }
            : sc
        )
      );
    } catch (error) {
      console.error("Error deleting subject from Firestore:", error);
    }
  }, []);


  // Firestore-backed Class CRUD
  const addSchoolClass = useCallback(async (name: string, subjectIds: string[], description?: string): Promise<SchoolClass | null> => {
    try {
      const docRef = await addDoc(collection(db, "classes"), {
        name,
        subjectIds: subjectIds || [],
        description: description || '',
        teacherIds: [],
        studentIds: []
      });
      const newClass: SchoolClass = { id: docRef.id, name, subjectIds: subjectIds || [], description: description || '', teacherIds: [], studentIds: [] };
      return newClass;
    } catch (error) {
      console.error("Error adding class to Firestore:", error);
      return null;
    }
  }, []);

  const updateSchoolClass = useCallback(async (updatedClass: SchoolClass) => {
    try {
      const { id, ...classData } = updatedClass;
      await updateDoc(doc(db, "classes", id), classData);
    } catch (error) {
      console.error("Error updating class in Firestore:", error);
    }
  }, []);

  const deleteSchoolClass = useCallback(async (classId: string) => {
    try {
      await deleteDoc(doc(db, "classes", classId));
      setGrades(prev => prev.filter(g => g.classId !== classId));
      setDocumentResources(prev => prev.filter(dr => dr.classId !== classId));
    } catch (error) {
      console.error("Error deleting class from Firestore:", error);
    }
  }, []);

  const assignTeachersToClass = useCallback((classId: string, teacherIds: string[]) => {
    setSchoolClasses(prevClasses =>
      prevClasses.map(sc => sc.id === classId ? { ...sc, teacherIds: teacherIds } : sc)
    );
  }, []);

  const assignStudentsToClass = useCallback((classId: string, studentIds: string[]) => {
    setSchoolClasses(prevClasses =>
      prevClasses.map(sc => sc.id === classId ? { ...sc, studentIds: studentIds } : sc)
    );
  }, []);


  // Firestore-backed Grade CRUD
  const addGrade = useCallback(async (newGradeData: Omit<Grade, 'id'>): Promise<Grade | null> => {
    try {
      const docRef = await addDoc(collection(db, "grades"), newGradeData);
      const newGrade: Grade = { ...newGradeData, id: docRef.id };
      return newGrade;
    } catch (error) {
      console.error("Error adding grade to Firestore:", error);
      return null;
    }
  }, []);

  const updateGrade = useCallback(async (updatedGrade: Grade) => {
    try {
      const { id, ...gradeData } = updatedGrade;
      await updateDoc(doc(db, "grades", id), gradeData);
    } catch (error) {
      console.error("Error updating grade in Firestore:", error);
    }
  }, []);

  const deleteGrade = useCallback(async (gradeId: string) => {
    try {
      await deleteDoc(doc(db, "grades", gradeId));
    } catch (error) {
      console.error("Error deleting grade from Firestore:", error);
    }
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


  // Firestore-backed Message CRUD
  const sendMessageFunc = useCallback(async (recipientId: string, subject: string, body: string) => {
    if (!currentUser) {
      console.error("Cannot send message: no user logged in.");
      return;
    }
    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        senderUsername: currentUser.username,
        recipientId,
        subject,
        body,
        dateSent: new Date().toISOString(),
        isRead: false,
      });
    } catch (error) {
      console.error("Error sending message to Firestore:", error);
    }
  }, [currentUser]);


  const markMessageAsReadFunc = useCallback(async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), { isRead: true });
    } catch (error) {
      console.error("Error marking message as read in Firestore:", error);
    }
  }, []);
  
  const getUnreadMessagesCountFunc = useCallback((): number => {
    if (!currentUser) return 0;
    return messages.filter(msg => msg.recipientId === currentUser.uid && !msg.isRead).length;
  }, [currentUser, messages]);


  // Firestore-backed Event CRUD
  const addSchoolEvent = useCallback(async (newEventData: Omit<SchoolEvent, 'id'>): Promise<SchoolEvent | null> => {
    try {
      const docRef = await addDoc(collection(db, "events"), newEventData);
      const newEvent: SchoolEvent = { ...newEventData, id: docRef.id };
      return newEvent;
    } catch (error) {
      console.error("Error adding event to Firestore:", error);
      return null;
    }
  }, []);


  // Firestore-backed Document Resource CRUD (with Firebase Storage)
  const addDocumentResource = useCallback(async (
    resourceData: Omit<DocumentResource, 'id' | 'fileURL'>,
    file: File
  ): Promise<DocumentResource | null> => {
    if (!currentUser || !currentUser.teacherId) {
      addNotificationDirectly("Error", "User not authorized to upload resources.", "error");
      return null;
    }
    try {
      // Dynamically import Firebase Storage SDK
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const storage = getStorage();
      // Use a unique path for each file
      const storageRef = ref(storage, `resources/${resourceData.classId}/${Date.now()}_${file.name}`);
      // Upload file
      await uploadBytes(storageRef, file);
      // Get download URL
      const fileURL = await getDownloadURL(storageRef);
      // Save resource metadata in Firestore
      const docRef = await addDoc(collection(db, "resources"), {
        ...resourceData,
        fileURL,
        teacherId: currentUser.uid,
        uploadDate: new Date().toISOString(),
      });
      const newResource: DocumentResource = {
        ...resourceData,
        id: docRef.id,
        fileURL,
        teacherId: currentUser.uid,
        uploadDate: new Date().toISOString(),
      };
      return newResource;
    } catch (error) {
      console.error("Error uploading resource to Firebase Storage/Firestore:", error);
      addNotificationDirectly("Upload Failed", "Could not upload the resource.", "error");
      return null;
    }
  }, [currentUser, addNotificationDirectly]);

  const deleteDocumentResource = useCallback(async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, "resources", resourceId));
    } catch (error) {
      console.error("Error deleting resource from Firestore:", error);
    }
  }, []);

  // Point Rules CRUD operations
  const addPointRule = useCallback(async (ruleData: Omit<PointRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PointRule | null> => {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, "pointRules"), {
        ...ruleData,
        createdAt: now,
        updatedAt: now
      });
      const newRule: PointRule = {
        id: docRef.id,
        ...ruleData,
        createdAt: now,
        updatedAt: now
      };
      return newRule;
    } catch (error) {
      console.error("Error adding point rule to Firestore:", error);
      return null;
    }
  }, []);

  const updatePointRule = useCallback(async (updatedRule: PointRule) => {
    try {
      const { id, ...ruleData } = updatedRule;
      await updateDoc(doc(db, "pointRules", id), {
        ...ruleData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating point rule in Firestore:", error);
    }
  }, []);

  const deletePointRule = useCallback(async (ruleId: string) => {
    try {
      await deleteDoc(doc(db, "pointRules", ruleId));
      // Also delete any related suggestions
      const suggestionsToDelete = pointRuleSuggestions.filter(s => s.ruleId === ruleId);
      for (const suggestion of suggestionsToDelete) {
        await deleteDoc(doc(db, "pointRuleSuggestions", suggestion.id));
      }
    } catch (error) {
      console.error("Error deleting point rule from Firestore:", error);
    }
  }, [pointRuleSuggestions]);

  // Point Rule Suggestions functions
  const generatePointSuggestions = useCallback((studentId: string, teacherId: string): PointRuleSuggestion[] => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];

    const suggestions = evaluateRulesForStudents(
      pointRules,
      [student],
      grades,
      pointTransactions,
      schoolClasses,
      teacherId
    );

    return suggestions;
  }, [pointRules, students, grades, pointTransactions, schoolClasses]);

  const applyPointSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const suggestion = pointRuleSuggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      // Award the points
      await awardPoints(suggestion.studentId, suggestion.suggestedPoints, suggestion.reason, suggestion.teacherId);

      // Mark suggestion as applied
      await updateDoc(doc(db, "pointRuleSuggestions", suggestionId), {
        isApplied: true,
        appliedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error applying point suggestion:", error);
    }
  }, [pointRuleSuggestions, awardPoints]);

  const dismissPointSuggestion = useCallback(async (suggestionId: string) => {
    try {
      await deleteDoc(doc(db, "pointRuleSuggestions", suggestionId));
    } catch (error) {
      console.error("Error dismissing point suggestion:", error);
    }
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
    pointRules,
    pointRuleSuggestions,
    notifications,
    login,
    logout,
    registerUser,
    addStudent, // Now async: (name: string, grade: number) => Promise<Student | null>
    updateStudent,
    deleteStudent, 
    deleteParentUser,
    awardPoints,
    markAttendance,
    addTeacher, // Now async: (name: string, subjectIds: string[], userId: string) => Promise<Teacher | null>
    updateTeacher,
    deleteTeacher, 
    addSubject, // Now async: (name: string, description?: string) => Promise<Subject | null>
    updateSubject,
    deleteSubject,
    addSchoolClass, // Now async: (name: string, subjectId?: string | null, description?: string) => Promise<SchoolClass | null>
    updateSchoolClass,
    deleteSchoolClass, 
    assignTeachersToClass,
    assignStudentsToClass,
    addGrade, // Now async: (newGradeData: Omit<Grade, 'id'>) => Promise<Grade | null>
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
    // Point Rules System
    addPointRule,
    updatePointRule,
    deletePointRule,
    generatePointSuggestions,
    applyPointSuggestion,
    dismissPointSuggestion,
  };
  
  // Show loading state using the unified loader (no separate React loading screen)
  if (authLoading) {
      // Update the unified loader with Firebase connection status
      if (typeof window !== 'undefined' && window.EduTrackLoader) {
        const message = firebaseError
          ? `Connection issue: ${firebaseError}`
          : 'Connecting to Firebase services...';
        window.EduTrackLoader.updateProgress(80, message);
      }
      return null; // Let the HTML loader handle the display
  }

  // Fallback: If user is missing required fields, show a message
  const missingProfileInfo =
    currentUser && (
      (currentUser.role === UserRole.STUDENT && !currentUser.studentId) ||
      (currentUser.role === UserRole.TEACHER && !currentUser.teacherId) ||
      (currentUser.role === UserRole.PARENT && !currentUser.studentId)
    );

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginScreen />} />
          <Route path="/register" element={currentUser ? <Navigate to="/" /> : <RegisterScreen />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/*" element={
            !currentUser ? <Navigate to="/landing" /> : missingProfileInfo ? (
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded shadow text-center">
                  <h2 className="text-xl font-bold mb-2">Profile Setup Incomplete</h2>
                  <p className="mb-4">Your account is missing required profile information. Please contact an administrator.</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={logout}>Logout</button>
                </div>
              </div>
            ) : (
              <Suspense fallback={<LazyLoadingSpinner message="Loading application..." />}>
                <MainLayout />
              </Suspense>
            )
          }>
            <Route index element={<DashboardScreen />} />
            <Route path="messages" element={
              <Suspense fallback={<LazyLoadingSpinner message="Loading messages..." />}>
                <MessagingScreen />
              </Suspense>
            } />
            <Route path="calendar" element={
              <Suspense fallback={<LazyLoadingSpinner message="Loading calendar..." />}>
                <SchoolCalendarScreen />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<LazyLoadingSpinner message="Loading settings..." />}>
                <SettingsScreen />
              </Suspense>
            } />
            {/* ...existing code for role-based routes... */}
            {currentUser?.role === UserRole.ADMIN && (
              <>
                <Route path="admin/dashboard" element={<DashboardScreen />} />
                <Route path="admin/students" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading student management..." />}>
                    <AdminStudentManagement />
                  </Suspense>
                } />
                <Route path="admin/students/:studentId" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading student profile..." />}>
                    <AdminStudentProfileView />
                  </Suspense>
                } />
                <Route path="admin/teachers" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading teacher management..." />}>
                    <AdminTeacherManagement />
                  </Suspense>
                } />
                <Route path="admin/teachers/:teacherId" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading teacher profile..." />}>
                    <AdminTeacherProfileView />
                  </Suspense>
                } />
                <Route path="admin/classes" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading class management..." />}>
                    <AdminClassManagement />
                  </Suspense>
                } />
                <Route path="admin/subjects" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading subject management..." />}>
                    <AdminSubjectManagement />
                  </Suspense>
                } />
                <Route path="admin/master-gradesheet" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading master gradesheet..." />}>
                    <AdminMasterGradesheetScreen />
                  </Suspense>
                } />
                <Route path="admin/moe-reporting" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading MoE reporting..." />}>
                    <AdminMoEReportingScreen />
                  </Suspense>
                } />
                <Route path="admin/academic-planner" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading academic planner..." />}>
                    <LiberianAcademicPlannerScreen />
                  </Suspense>
                } />
                <Route path="admin/design-showcase" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading cultural showcase..." />}>
                    <LiberianCulturalShowcase />
                  </Suspense>
                } />
                <Route path="admin/parents" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading parent management..." />}>
                    <AdminParentManagement />
                  </Suspense>
                } />
                <Route path="admin/point-rules" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading point rules..." />}>
                    <AdminPointRulesManagement />
                  </Suspense>
                } />
                <Route path="admin/leaderboard" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading leaderboard..." />}>
                    <AdminLeaderboardScreen />
                  </Suspense>
                } />
                <Route path="admin/reports" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading reports..." />}>
                    <AdminReportsScreen />
                  </Suspense>
                } />
              </>
            )}
            {currentUser?.role === UserRole.TEACHER && (
              <>
                <Route path="teacher/dashboard" element={<DashboardScreen />} />
                <Route path="teacher/my-classes" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading classes..." />}>
                    <TeacherMyClassesScreen />
                  </Suspense>
                } />
                <Route path="teacher/attendance" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading attendance..." />}>
                    <TeacherAttendance />
                  </Suspense>
                } />
                <Route path="teacher/points" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading point system..." />}>
                    <TeacherPointSystem />
                  </Suspense>
                } />
                <Route path="teacher/grades" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading gradebook..." />}>
                    <TeacherGradebookScreen />
                  </Suspense>
                } />
                <Route path="teacher/comprehensive-gradebook" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading comprehensive gradebook..." />}>
                    <ComprehensiveTeacherGradebook />
                  </Suspense>
                } />
                <Route path="teacher/master-gradesheet" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading master gradesheet..." />}>
                    <TeacherMasterGradesheetScreen />
                  </Suspense>
                } />
                <Route path="teacher/reports" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading reports..." />}>
                    <TeacherReportsScreen />
                  </Suspense>
                } />
                <Route path="teacher/resources" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading resources..." />}>
                    <TeacherClassResourcesScreen />
                  </Suspense>
                } />
              </>
            )}
            {currentUser?.role === UserRole.STUDENT && (
              <>
                <Route path="student/dashboard" element={<DashboardScreen />} />
                <Route path="student/profile" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading profile..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} />
                  </Suspense>
                } />
                <Route path="student/schedule" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading schedule..." />}>
                    <StudentScheduleScreen />
                  </Suspense>
                } />
                <Route path="student/assignments" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading assignments..." />}>
                    <StudentAssignmentsScreen />
                  </Suspense>
                } />
                <Route path="student/resources" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading resources..." />}>
                    <StudentClassResourcesScreen />
                  </Suspense>
                } />
                <Route path="student/points" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading points..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} section="points"/>
                  </Suspense>
                } />
                <Route path="student/grades" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading grades..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} section="grades"/>
                  </Suspense>
                } />
                <Route path="student/attendance" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading attendance..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} section="attendance"/>
                  </Suspense>
                } />
                <Route path="student/leaderboard" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading leaderboard..." />}>
                    <StudentLeaderboardScreen />
                  </Suspense>
                } />
              </>
            )}
            {currentUser?.role === UserRole.PARENT && (
              <>
                <Route path="parent/dashboard" element={<DashboardScreen />} />
                <Route path="parent/child-profile" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading child profile..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} />
                  </Suspense>
                } />
                {/* <Route path="parent/child-resources" element={<StudentClassResourcesScreen studentIdForParent={currentUser.studentId!} />} /> */}
                <Route path="parent/child-points" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading child points..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} section="points"/>
                  </Suspense>
                } />
                <Route path="parent/child-grades" element={
                  <Suspense fallback={<LazyLoadingSpinner message="Loading child grades..." />}>
                    <StudentProfilePage studentId={currentUser.studentId!} section="grades"/>
                  </Suspense>
                } />
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