import { UserRole, Student, User, Teacher, SchoolClass, Grade, Message, SchoolEvent, Subject, DocumentResource } from './types';

export const APP_NAME = "EduTrack SIS";

export const NAVIGATION_LINKS = {
  [UserRole.ADMIN]: [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: 'Squares2X2Icon' },
    { path: '/admin/students', label: 'Manage Students', icon: 'UsersIcon' },
    { path: '/admin/teachers', label: 'Manage Teachers', icon: 'AcademicCapIcon' },
    { path: '/admin/classes', label: 'Manage Classes', icon: 'RectangleGroupIcon' },
    { path: '/admin/subjects', label: 'Manage Subjects', icon: 'TagIcon' }, 
    { path: '/admin/parents', label: 'Manage Parents', icon: 'ShieldCheckIcon' },
    { path: '/admin/leaderboard', label: 'Leaderboard', icon: 'TrophyIcon' }, 
    { path: '/admin/reports', label: 'Admin Reports', icon: 'ChartPieIcon' },
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
  ],
  [UserRole.TEACHER]: [
    { path: '/teacher/dashboard', label: 'Teacher Dashboard', icon: 'Squares2X2Icon' },
    { path: '/teacher/my-classes', label: 'My Classes', icon: 'BookOpenIcon' },
    { path: '/teacher/attendance', label: 'Attendance', icon: 'ClipboardDocumentCheckIcon' },
    { path: '/teacher/points', label: 'Award Points', icon: 'SparklesIcon' },
    { path: '/teacher/grades', label: 'Gradebook', icon: 'PencilSquareIcon' },
    { path: '/teacher/reports', label: 'Teacher Reports', icon: 'ChartPieIcon' },
    { path: '/teacher/resources', label: 'Class Resources', icon: 'FolderArrowDownIcon' }, 
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
  ],
  [UserRole.STUDENT]: [
    { path: '/student/dashboard', label: 'My Dashboard', icon: 'Squares2X2Icon' },
    { path: '/student/profile', label: 'My Profile', icon: 'UserCircleIcon' },
    { path: '/student/schedule', label: 'My Schedule', icon: 'ClockIcon' },
    { path: '/student/assignments', label: 'My Assignments', icon: 'ClipboardDocumentListIcon' },
    { path: '/student/resources', label: 'Class Resources', icon: 'FolderArrowDownIcon' }, 
    { path: '/student/points', label: 'My Points', icon: 'SparklesIcon' },
    { path: '/student/grades', label: 'My Grades', icon: 'AcademicCapIcon' },
    { path: '/student/leaderboard', label: 'School Leaderboard', icon: 'TrophyIcon'}, // Added
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
  ],
  [UserRole.PARENT]: [
    { path: '/parent/dashboard', label: 'Child Dashboard', icon: 'Squares2X2Icon' },
    { path: '/parent/child-profile', label: 'Child Profile', icon: 'UserCircleIcon' },
    { path: '/parent/child-points', label: 'Child Points', icon: 'SparklesIcon' },
    { path: '/parent/child-grades', label: 'Child Grades', icon: 'AcademicCapIcon' },
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
  ],
};

// MOCK_USERS has been removed. User data is now managed by Firebase.

export const MOCK_STUDENTS_INITIAL: Student[] = [
  { id: 's1', name: 'Alice Wonderland', grade: 5, points: 150, parentId: 'parent1', attendance: [{date: '2024-07-28', status: 'present'}] },
  { id: 's2', name: 'Bob The Builder', grade: 6, points: 120, attendance: [{date: '2024-07-28', status: 'absent'}]  },
  { id: 's3', name: 'Charlie Brown', grade: 5, points: 200, attendance: [{date: '2024-07-28', status: 'present'}]  },
  { id: 's_blake', name: 'Blake Flame', grade: 7, points: 75, attendance: [{date: '2024-07-29', status: 'present'}] } 
];

export const MOCK_TEACHERS_INITIAL: Teacher[] = [
  { id: 't1', userId: 'user_teacher1', name: 'Prof. Dumbledore', subject: 'Mathematics' }, // userId is now a dangling reference, will be fixed when teachers are moved to Firestore.
  { id: 't2', userId: 'user_teacher2', name: 'Ms. Frizzle', subject: 'Science' },
];

export const MOCK_SUBJECTS_INITIAL: Subject[] = [
    { id: 'subj_la', name: 'Language Arts (English)', description: 'Reading, Writing, Grammar, and Literature.' },
    { id: 'subj_math', name: 'Mathematics', description: 'Arithmetic, Algebra, Geometry, etc.' },
    { id: 'subj_sci', name: 'General Science', description: 'Biology, Chemistry, Physics foundations.' },
    { id: 'subj_ss', name: 'Social Studies', description: 'Geography, World History, Economics basics.' },
    { id: 'subj_libhist', name: 'Liberian History', description: 'History of Liberia and its people.' },
    { id: 'subj_civics', name: 'Civics & Citizenship', description: 'Government, Rights, and Responsibilities.' },
    { id: 'subj_french', name: 'French', description: 'Introduction to the French language.' },
    { id: 'subj_pe', name: 'Physical Education', description: 'Sports and physical fitness activities.' },
    { id: 'subj_arts', name: 'Creative Arts', description: 'Drawing, Painting, Music basics.' },
];

export const MOCK_SCHOOL_CLASSES_INITIAL: SchoolClass[] = [
    { id: 'c1', name: 'Grade 5 Alpha', teacherId: 't1', studentIds: ['s1', 's3'], subjectId: 'subj_math', description: 'Morning session focusing on Mathematics for 5th graders.' },
    { id: 'c2', name: 'Grade 6 Science Enthusiasts', teacherId: 't2', studentIds: ['s2'], subjectId: 'subj_sci', description: 'Focus on practical science projects.'},
    { id: 'c3', name: 'Grade 5 Language Arts', teacherId: 't1', studentIds: ['s1', 's3'], subjectId: 'subj_la', description: 'Developing reading and writing skills.'},
    { id: 'c4', name: 'Grade 7 Liberian History', teacherId: 't2', studentIds: ['s_blake', 's2'], subjectId: 'subj_libhist', description: 'Covering key events and figures in Liberian history.'},
    { id: 'c5', name: 'Grade 7 French Beginners', teacherId: 't1', studentIds: ['s3', 's_blake'], subjectId: 'subj_french', description: 'Introduction to French vocabulary and grammar.'},
];

export const MOCK_POINT_TRANSACTIONS_INITIAL = [
  { id: 'pt1', studentId: 's1', teacherId: 'uid_of_teacher1', points: 10, reason: 'Homework Completion', date: '2024-07-20' },
  { id: 'pt2', studentId: 's3', teacherId: 'uid_of_teacher1', points: 15, reason: 'Class Participation', date: '2024-07-22' },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeksLater = new Date();
twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);


export const MOCK_GRADES_INITIAL: Grade[] = [
    { 
        id: 'g1', 
        studentId: 's1', 
        classId: 'c1', // Grade 5 Alpha (Math)
        subjectOrAssignmentName: 'Math - Chapter 1 Test', 
        score: '85', 
        maxScore: '100',
        dateAssigned: '2024-07-20',
        dueDate: '2024-07-19',
        status: 'Graded',
        teacherComments: 'Good effort, needs to review fractions.' 
    },
    { 
        id: 'g2', 
        studentId: 's1', 
        classId: 'c3', // Grade 5 Language Arts
        subjectOrAssignmentName: 'Language Arts - Book Report', 
        score: 'A-', 
        dateAssigned: '2024-07-22',
        dueDate: '2024-07-21',
        status: 'Graded', 
        teacherComments: 'Excellent presentation!' 
    },
    { 
        id: 'g3', 
        studentId: 's3', 
        classId: 'c1', // Grade 5 Alpha (Math)
        subjectOrAssignmentName: 'Math - Chapter 1 Test', 
        score: '92',
        maxScore: '100', 
        dateAssigned: '2024-07-20',
        dueDate: '2024-07-19',
        status: 'Graded',
    },
    { 
        id: 'g4', 
        studentId: 's_blake', 
        classId: 'c4', // Grade 7 Liberian History
        subjectOrAssignmentName: 'Liberian History - Early Settlers Quiz', 
        score: '78',
        maxScore: '100', 
        dateAssigned: '2024-07-25',
        dueDate: '2024-07-24',
        status: 'Graded',
    },
    {
        id: 'g5',
        studentId: 's1',
        classId: 'c1', // Math
        subjectOrAssignmentName: 'Math Homework - Fractions',
        score: '', // No score yet
        maxScore: '20',
        dateAssigned: lastWeek.toISOString().split('T')[0],
        dueDate: tomorrow.toISOString().split('T')[0],
        status: 'Pending Submission',
        teacherComments: 'Remember to show your work.'
    },
    {
        id: 'g6',
        studentId: 's1',
        classId: 'c3', // Language Arts
        subjectOrAssignmentName: 'Upcoming Essay - My Hero',
        score: '',
        dateAssigned: new Date().toISOString().split('T')[0],
        dueDate: nextWeek.toISOString().split('T')[0],
        status: 'Upcoming',
        teacherComments: 'Focus on structure and evidence.'
    },
    {
        id: 'g7',
        studentId: 's_blake',
        classId: 'c5', // French
        subjectOrAssignmentName: 'French Vocabulary Quiz 1',
        score: '',
        maxScore: '50',
        dateAssigned: new Date().toISOString().split('T')[0],
        dueDate: twoWeeksLater.toISOString().split('T')[0],
        status: 'Upcoming',
    },
    {
        id: 'g8',
        studentId: 's2',
        classId: 'c2', // Science
        subjectOrAssignmentName: 'Science Project Proposal',
        score: '',
        dateAssigned: lastWeek.toISOString().split('T')[0],
        dueDate: lastWeek.toISOString().split('T')[0], // Due last week, implies submitted or pending
        status: 'Pending Submission', // Assuming not yet graded
    }
];

export const MOCK_MESSAGES_INITIAL: Message[] = [
  {
    id: 'msg1',
    senderId: 'user_teacher1', 
    senderUsername: 'teacher',
    recipientId: 'student1', 
    subject: 'Welcome to Grade 5 Math!',
    body: 'Dear Alice,\n\nWelcome to my Grade 5 Math class! I look forward to a great year.\n\nBest,\nProf. Dumbledore',
    dateSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    isRead: false,
  },
  {
    id: 'msg2',
    senderId: 'admin1', 
    senderUsername: 'admin',
    recipientId: 'user_teacher1', 
    subject: 'Staff Meeting Reminder',
    body: 'Hello Prof. Dumbledore,\n\nJust a reminder about the staff meeting tomorrow at 10 AM.\n\nRegards,\nAdmin',
    dateSent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    isRead: true,
  },
];

export const MOCK_SCHOOL_EVENTS_INITIAL: SchoolEvent[] = [
  {
    id: 'evt1',
    title: 'Mid-Term Examinations Start',
    date: '2024-10-14',
    description: 'Mid-term exams for all grades (Grade 5 - Grade 12) will commence. Please check the detailed schedule on the notice board.',
    audience: 'all',
  },
  {
    id: 'evt2',
    title: 'Parent-Teacher Conference Day',
    date: '2024-10-25',
    description: 'Opportunity for parents to discuss student progress with teachers. Sign-up sheets will be available a week prior.',
    audience: [UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN],
  },
];

export const MOCK_DOCUMENT_RESOURCES_INITIAL: DocumentResource[] = []; // Initially empty