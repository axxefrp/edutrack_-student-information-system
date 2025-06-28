export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export interface User {
  uid: string; // Changed from id to uid for Firebase Auth
  username: string; // Can be derived from email or stored in profile
  email: string;
  role: UserRole;
  // For student/parent roles, this links to the student data
  studentId?: string; 
  // For teacher roles, this links to a teacher profile
  teacherId?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  points: number;
  parentId?: string; // Optional: link to a parent user uid
  attendance: { date: string; status: 'present' | 'absent' | 'late' }[];
}

export interface Teacher {
  id: string;
  userId: string; // Links to User.uid
  name: string;
  subject: string; // Primary specialization of the teacher
}

export interface PointTransaction {
  id: string;
  studentId: string;
  teacherId: string; // User uid of the teacher who awarded points
  points: number;
  reason: string;
  date: string;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string; // Link the grade to a specific class
  subjectOrAssignmentName: string; // e.g., "Math - Chapter 5 Test" or "History Essay"
  score: string; // Can be numeric "85" or letter "A-"
  maxScore?: number | string; // Optional, e.g., 100
  dateAssigned: string;
  teacherComments?: string;
  dueDate?: string; // Optional: ISO date string for assignment due date
  status?: 'Upcoming' | 'Pending Submission' | 'Submitted' | 'Graded'; // Optional: Status of the assignment
  submissionDate?: string; // Optional: ISO date string when student submitted
}

export interface RegistrationDetails {
  studentName?: string;
  studentGrade?: number;
  parentLinksToStudentId?: string;
  teacherName?: string;
  teacherSubject?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId?: string | null; // Links to Teacher.id, null if unassigned
  studentIds: string[]; // Array of Student.id
  subjectId?: string | null; // Links to Subject.id
  description?: string; // General notes about the class
}

export interface Message {
  id:string;
  senderId: string;
  senderUsername: string; // Denormalized for easy display
  recipientId: string;
  subject: string;
  body: string;
  dateSent: string; // ISO date string
  isRead: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  title?: string; // Optional title for the toast
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  audience?: UserRole[] | 'all'; // Optional: specify which roles see it, or 'all'
}

export type DocumentResourceCategory = 'Notes' | 'Assignment Brief' | 'Reading Material' | 'Other Resource';

export interface DocumentResource {
  id: string;
  classId: string;
  teacherId: string; // User uid of the teacher who uploaded
  title: string;
  description?: string;
  fileName: string;
  fileType: string; // e.g., 'application/pdf', 'image/png'
  fileURL: string; // For mock, this will be a base64 data URL
  uploadDate: string; // ISO date string
  category: DocumentResourceCategory;
}

// Minimal structure for AppContext
export interface AppContextType {
  currentUser: User | null;
  users: User[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[]; 
  pointTransactions: PointTransaction[];
  schoolClasses: SchoolClass[];
  grades: Grade[];
  messages: Message[]; 
  schoolEvents: SchoolEvent[];
  documentResources: DocumentResource[];
  notifications: ToastNotification[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (email: string, password: string, role: UserRole, details: RegistrationDetails) => Promise<{success: boolean, message: string}>;
  addStudent: (name: string, grade: number) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void; 
  deleteParentUser: (userId: string) => void;
  awardPoints: (studentId: string, points: number, reason: string, teacherId: string) => void;
  markAttendance: (studentId: string, date: string, status: 'present' | 'absent' | 'late') => void;
  addTeacher: (name: string, subject: string, userId: string) => Teacher;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void; 
  addSubject: (name: string, description?: string) => Subject; 
  updateSubject: (updatedSubject: Subject) => void; 
  deleteSubject: (subjectId: string) => void; 
  addSchoolClass: (name: string, subjectId?: string | null, description?: string) => SchoolClass; 
  updateSchoolClass: (updatedClass: SchoolClass) => void;
  deleteSchoolClass: (classId: string) => void; 
  assignTeacherToClass: (classId: string, teacherId: string | null) => void;
  assignStudentsToClass: (classId: string, studentIds: string[]) => void;
  addGrade: (newGradeData: Omit<Grade, 'id'>) => Grade;
  updateGrade: (updatedGrade: Grade) => void;
  deleteGrade: (gradeId: string) => void;
  submitAssignment: (gradeId: string) => void; 
  sendMessage: (recipientId: string, subject: string, body: string) => void; 
  markMessageAsRead: (messageId: string) => void; 
  getUnreadMessagesCount: () => number;
  removeNotification: (id: string) => void;
  addSchoolEvent: (newEventData: Omit<SchoolEvent, 'id'>) => SchoolEvent;
  addNotificationDirectly: (title: string, message: string, type: 'info' | 'success' | 'error') => void;
  addDocumentResource: (resourceData: Omit<DocumentResource, 'id' | 'fileURL'>, file: File) => Promise<DocumentResource | null>;
  deleteDocumentResource: (resourceId: string) => void;
}