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
  subjectIds: string[]; // Array of Subject.id (multiple subjects)
}

export interface PointTransaction {
  id: string;
  studentId: string;
  teacherId: string; // User uid of the teacher who awarded points
  points: number;
  reason: string;
  date: string;
}

export type AssessmentType = 'Quiz' | 'Test' | 'Exam' | 'Assignment' | 'Project' | 'Participation' | 'Homework' | 'Other';

// Liberian Grading System (Based on WAEC Standards)
export type LiberianGradeScale = 'A1' | 'A2' | 'A3' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';

export interface LiberianGradeInfo {
  grade: LiberianGradeScale;
  description: string;
  percentage: string;
  points: number;
  isCredit: boolean; // A1-C6 are credit grades for university admission
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string; // Link the grade to a specific class
  subjectId?: string; // Link to specific subject within the class
  subjectOrAssignmentName: string; // e.g., "Math - Chapter 5 Test" or "History Essay"
  assessmentType: AssessmentType; // Categorize the type of assessment
  score: string; // Can be numeric "85" or letter "A-" or Liberian grade "A1", "B2", etc.
  maxScore?: number | string; // Optional, e.g., 100
  weight?: number; // Optional: Weight of this assessment (e.g., 0.3 for 30%)
  dateAssigned: string;
  teacherComments?: string;
  dueDate?: string; // Optional: ISO date string for assignment due date
  status?: 'Upcoming' | 'Pending Submission' | 'Submitted' | 'Graded'; // Optional: Status of the assignment
  submissionDate?: string; // Optional: ISO date string when student submitted

  // Liberian-specific grading fields
  liberianGrade?: LiberianGradeScale; // Official Liberian grade scale (A1-F9)
  continuousAssessment?: number; // Internal assessment score (30% of final grade)
  externalExamination?: number; // External exam score (70% of final grade)
  term?: 1 | 2 | 3; // Academic term (Liberian schools have 3 terms)
  isWAECSubject?: boolean; // Whether this is a WAEC examination subject
}

export interface RegistrationDetails {
  studentName?: string;
  studentGrade?: number;
  parentLinksToStudentId?: string;
  teacherName?: string;
  teacherSubject?: string; // legacy, can be removed later
  teacherSubjectIds?: string[]; // for multi-subject teacher registration
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherIds: string[]; // Array of Teacher.id (multiple teachers per class)
  studentIds: string[]; // Array of Student.id
  subjectIds: string[]; // Array of Subject.id (multiple subjects per class)
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

// Point Rules System Types
export type PointRuleCondition = 'attendance_perfect_week' | 'assignment_submitted_early' | 'assignment_high_score' | 'participation_active' | 'behavior_excellent' | 'improvement_significant';

export type PointRuleTrigger = 'automatic' | 'teacher_suggestion';

export interface PointRule {
  id: string;
  name: string;
  description: string;
  condition: PointRuleCondition;
  points: number;
  trigger: PointRuleTrigger;
  isActive: boolean;
  createdBy: string; // Admin user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Condition-specific parameters
  parameters?: {
    minScore?: number; // For assignment_high_score
    daysEarly?: number; // For assignment_submitted_early
    improvementThreshold?: number; // For improvement_significant
    subjectId?: string; // Optional subject restriction
    gradeLevel?: number; // Optional grade level restriction
  };
}

export interface PointRuleSuggestion {
  id: string;
  ruleId: string;
  studentId: string;
  teacherId: string;
  reason: string;
  suggestedPoints: number;
  isApplied: boolean;
  createdAt: string; // ISO date string
  appliedAt?: string; // ISO date string when teacher applied the suggestion
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
  pointRules: PointRule[];
  pointRuleSuggestions: PointRuleSuggestion[];
  notifications: ToastNotification[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (email: string, password: string, role: UserRole, details: RegistrationDetails) => Promise<{success: boolean, message: string}>;
  addStudent: (name: string, grade: number) => Promise<Student | null>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  deleteParentUser: (userId: string) => void;
  awardPoints: (studentId: string, points: number, reason: string, teacherId: string) => void;
  markAttendance: (studentId: string, date: string, status: 'present' | 'absent' | 'late') => void;
  addTeacher: (name: string, subjectIds: string[], userId: string) => Promise<Teacher | null>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
  addSubject: (name: string, description?: string) => Promise<Subject | null>;
  updateSubject: (updatedSubject: Subject) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addSchoolClass: (name: string, subjectIds: string[], description?: string) => Promise<SchoolClass | null>;
  updateSchoolClass: (updatedClass: SchoolClass) => Promise<void>;
  deleteSchoolClass: (classId: string) => Promise<void>;
  assignTeachersToClass: (classId: string, teacherIds: string[]) => void;
  assignStudentsToClass: (classId: string, studentIds: string[]) => void;
  addGrade: (newGradeData: Omit<Grade, 'id'>) => Promise<Grade | null>;
  updateGrade: (updatedGrade: Grade) => Promise<void>;
  deleteGrade: (gradeId: string) => Promise<void>;
  submitAssignment: (gradeId: string) => void; 
  sendMessage: (recipientId: string, subject: string, body: string) => void; 
  markMessageAsRead: (messageId: string) => void; 
  getUnreadMessagesCount: () => number;
  removeNotification: (id: string) => void;
  addSchoolEvent: (newEventData: Omit<SchoolEvent, 'id'>) => Promise<SchoolEvent | null>;
  addNotificationDirectly: (title: string, message: string, type: 'info' | 'success' | 'error') => void;
  addDocumentResource: (resourceData: Omit<DocumentResource, 'id' | 'fileURL'>, file: File) => Promise<DocumentResource | null>;
  deleteDocumentResource: (resourceId: string) => Promise<void>;
  // Point Rules System
  addPointRule: (ruleData: Omit<PointRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PointRule | null>;
  updatePointRule: (updatedRule: PointRule) => Promise<void>;
  deletePointRule: (ruleId: string) => Promise<void>;
  generatePointSuggestions: (studentId: string, teacherId: string) => PointRuleSuggestion[];
  applyPointSuggestion: (suggestionId: string) => Promise<void>;
  dismissPointSuggestion: (suggestionId: string) => Promise<void>;
}