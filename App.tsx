
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider } from './hooks/useTheme';
import { auth, db } from './firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { User, UserRole, Student, Teacher, PointTransaction, AppContextType, RegistrationDetails, SchoolClass, Grade, Message, ToastNotification, SchoolEvent, Subject, DocumentResource, PointRule, PointRuleSuggestion } from './types';
import { evaluateRulesForStudents } from './utils/pointRuleEngine';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import LandingPage from './components/Landing/LandingPage';
import MainLayout from './components/Layout/MainLayout';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import AdminStudentManagement from './components/Admin/AdminStudentManagement';
import AdminTeacherManagement from './components/Admin/AdminTeacherManagement';
import AdminClassManagement from './components/Admin/AdminClassManagement';
import AdminSubjectManagement from './components/Admin/AdminSubjectManagement';
import AdminParentManagement from './components/Admin/AdminParentManagement';
import AdminLeaderboardScreen from './components/Admin/AdminLeaderboardScreen';
import AdminTeacherProfileView from './components/Admin/AdminTeacherProfileView';
import AdminStudentProfileView from './components/Admin/AdminStudentProfileView';
import AdminPointRulesManagement from './components/Admin/AdminPointRulesManagement';
import SettingsScreen from './components/Settings/SettingsScreen';
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


export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

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
  // Firestore point transactions listener
  useEffect(() => {
    const transactionsCollectionRef = collection(db, "pointTransactions");
    const unsubscribeTransactions = onSnapshot(transactionsCollectionRef, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PointTransaction));
      setPointTransactions(transactionsData);
    });
    return () => unsubscribeTransactions();
  }, []);
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

    // Firestore students listener
    const studentsCollectionRef = collection(db, "students");
    const unsubscribeStudents = onSnapshot(studentsCollectionRef, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
      setStudents(studentsData);
    });

    // Firestore teachers listener
    const teachersCollectionRef = collection(db, "teachers");
    const unsubscribeTeachers = onSnapshot(teachersCollectionRef, (snapshot) => {
      const teachersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Teacher));
      console.log('Teachers loaded from Firestore:', teachersData.length, teachersData);
      setTeachers(teachersData);
    });

    // Firestore classes listener
    const classesCollectionRef = collection(db, "classes");
    const unsubscribeClasses = onSnapshot(classesCollectionRef, (snapshot) => {
      const classesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Defensive: ensure subjectIds and teacherIds are always arrays
        return {
          ...data,
          id: doc.id,
          subjectIds: Array.isArray(data.subjectIds) ? data.subjectIds : [],
          teacherIds: Array.isArray(data.teacherIds) ? data.teacherIds : (data.teacherId ? [data.teacherId] : []),
        } as SchoolClass;
      });
      setSchoolClasses(classesData);
    });

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

    // Firestore grades listener
    const gradesCollectionRef = collection(db, "grades");
    const unsubscribeGrades = onSnapshot(gradesCollectionRef, (snapshot) => {
      const gradesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Grade));
      setGrades(gradesData);
    });

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
  
  if (authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <p>Loading application...</p>
          </div>
      );
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
            ) : <MainLayout />
          }>
            <Route index element={<DashboardScreen />} />
            <Route path="messages" element={<MessagingScreen />} />
            <Route path="calendar" element={<SchoolCalendarScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            {/* ...existing code for role-based routes... */}
            {currentUser?.role === UserRole.ADMIN && (
              <>
                <Route path="admin/dashboard" element={<DashboardScreen />} />
                <Route path="admin/students" element={<AdminStudentManagement />} />
                <Route path="admin/students/:studentId" element={<AdminStudentProfileView />} />
                <Route path="admin/teachers" element={<AdminTeacherManagement />} />
                <Route path="admin/teachers/:teacherId" element={<AdminTeacherProfileView />} />
                <Route path="admin/classes" element={<AdminClassManagement />} />
                <Route path="admin/subjects" element={<AdminSubjectManagement />} />
                <Route path="admin/parents" element={<AdminParentManagement />} />
                <Route path="admin/point-rules" element={<AdminPointRulesManagement />} />
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