import { UserRole, Student, User, Teacher, SchoolClass, Grade, Message, SchoolEvent, Subject, DocumentResource } from './types';

export const APP_NAME = "EduTrack SIS";

export const NAVIGATION_LINKS = {
  [UserRole.ADMIN]: [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: 'Squares2X2Icon' },
    { path: '/admin/students', label: 'Manage Students', icon: 'UsersIcon' },
    { path: '/admin/teachers', label: 'Manage Teachers', icon: 'AcademicCapIcon' },
    { path: '/admin/classes', label: 'Manage Classes', icon: 'RectangleGroupIcon' },
    { path: '/admin/subjects', label: 'Manage Subjects', icon: 'TagIcon' },
    { path: '/admin/master-gradesheet', label: '🇱🇷 Master Gradesheet', icon: 'ClipboardDocumentListIcon' },
    { path: '/admin/moe-reporting', label: '📊 MoE Reporting', icon: 'ChartBarIcon' },
    { path: '/admin/academic-planner', label: '🇱🇷 Academic Planner', icon: 'CalendarDaysIcon' },
    { path: '/admin/design-showcase', label: '🎨 Design System', icon: 'SwatchIcon' },
    { path: '/admin/parents', label: 'Manage Parents', icon: 'ShieldCheckIcon' },
    { path: '/admin/point-rules', label: 'Point Rules', icon: 'SparklesIcon' },
    { path: '/admin/leaderboard', label: 'Leaderboard', icon: 'TrophyIcon' },
    { path: '/admin/reports', label: 'Admin Reports', icon: 'ChartPieIcon' },
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
    { path: '/settings', label: 'Settings', icon: 'CogIcon' },
  ],
  [UserRole.TEACHER]: [
    { path: '/teacher/dashboard', label: 'Teacher Dashboard', icon: 'Squares2X2Icon' },
    { path: '/teacher/my-classes', label: 'My Classes', icon: 'BookOpenIcon' },
    { path: '/teacher/attendance', label: 'Attendance', icon: 'ClipboardDocumentCheckIcon' },
    { path: '/teacher/points', label: 'Award Points', icon: 'SparklesIcon' },
    { path: '/teacher/grades', label: 'Gradebook', icon: 'PencilSquareIcon' },
    { path: '/teacher/comprehensive-gradebook', label: '🇱🇷 Comprehensive Gradebook', icon: 'AcademicCapIcon' },
    { path: '/teacher/master-gradesheet', label: '📤 Master Gradesheet', icon: 'ClipboardDocumentListIcon' },
    { path: '/teacher/reports', label: 'Teacher Reports', icon: 'ChartPieIcon' },
    { path: '/teacher/resources', label: 'Class Resources', icon: 'FolderArrowDownIcon' },
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
    { path: '/settings', label: 'Settings', icon: 'CogIcon' },
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
    { path: '/settings', label: 'Settings', icon: 'CogIcon' },
  ],
  [UserRole.PARENT]: [
    { path: '/parent/dashboard', label: 'Child Dashboard', icon: 'Squares2X2Icon' },
    { path: '/parent/child-profile', label: 'Child Profile', icon: 'UserCircleIcon' },
    { path: '/parent/child-points', label: 'Child Points', icon: 'SparklesIcon' },
    { path: '/parent/child-grades', label: 'Child Grades', icon: 'AcademicCapIcon' },
    { path: '/messages', label: 'Messages', icon: 'EnvelopeIcon' },
    { path: '/calendar', label: 'School Calendar', icon: 'CalendarDaysIcon' },
    { path: '/settings', label: 'Settings', icon: 'CogIcon' },
  ],
};

// MOCK_USERS has been removed. User data is now managed by Firebase.

export const MOCK_STUDENTS_INITIAL: Student[] = [
  { id: 's1', name: 'Aminata Johnson', grade: 5, points: 150, parentId: 'parent1', attendance: [{date: '2024-10-15', status: 'present'}] },
  { id: 's2', name: 'Emmanuel Kpakolo', grade: 6, points: 120, attendance: [{date: '2024-10-15', status: 'absent'}]  },
  { id: 's3', name: 'Fatima Kromah', grade: 5, points: 200, attendance: [{date: '2024-10-15', status: 'present'}]  },
  { id: 's_blake', name: 'Moses Flomo', grade: 7, points: 75, attendance: [{date: '2024-10-16', status: 'present'}] },
  { id: 's4', name: 'Princess Tubman', grade: 6, points: 180, attendance: [{date: '2024-10-16', status: 'present'}] },
  { id: 's5', name: 'Joseph Boakai Jr.', grade: 7, points: 95, attendance: [{date: '2024-10-16', status: 'late'}] }
];

export const MOCK_TEACHERS_INITIAL: Teacher[] = [
  { id: 't1', userId: 'user_teacher1', name: 'Mr. Samuel Konneh', subjectIds: ['subj_math', 'subj_sci'] }, // Mathematics and Science Teacher
  { id: 't2', userId: 'user_teacher2', name: 'Mrs. Grace Weah', subjectIds: ['subj_la', 'subj_libhist'] }, // Language Arts and Liberian History Teacher
  { id: 't3', userId: 'user_teacher3', name: 'Prof. James Kollie', subjectIds: ['subj_ss', 'subj_civics'] }, // Social Studies and Civics Teacher
];

export const MOCK_SUBJECTS_INITIAL: Subject[] = [
    // Core Subjects (Required by Liberian Ministry of Education)
    { id: 'subj_la', name: 'Language Arts (English)', description: 'Reading, Writing, Grammar, and Literature as per Liberian curriculum standards.' },
    { id: 'subj_math', name: 'Mathematics', description: 'Arithmetic, Algebra, Geometry following Liberian MoE mathematics curriculum.' },
    { id: 'subj_sci', name: 'General Science', description: 'Integrated Science covering Biology, Chemistry, Physics foundations.' },
    { id: 'subj_ss', name: 'Social Studies', description: 'Geography, World History, Economics, and Civics basics.' },

    // Liberian-Specific Subjects
    { id: 'subj_libhist', name: 'Liberian History', description: 'Comprehensive study of Liberian history, culture, and national heritage.' },
    { id: 'subj_civics', name: 'Civics & Citizenship', description: 'Liberian government structure, rights, responsibilities, and civic duties.' },

    // Additional Subjects
    { id: 'subj_french', name: 'French', description: 'French language instruction as part of Liberian multilingual education policy.' },
    { id: 'subj_pe', name: 'Physical Education', description: 'Sports, fitness, health education, and wellness programs.' },
    { id: 'subj_arts', name: 'Creative Arts', description: 'Traditional and contemporary Liberian arts, music, drama, and cultural expression.' },
    { id: 'subj_agri', name: 'Agriculture', description: 'Basic agricultural practices, farming techniques, and food security education.' },
    { id: 'subj_tech', name: 'Technical Education', description: 'Basic technical skills and vocational preparation.' },
    { id: 'subj_moral', name: 'Moral & Religious Education', description: 'Ethics, moral values, and religious studies.' }
];

export const MOCK_SCHOOL_CLASSES_INITIAL: SchoolClass[] = [
    { id: 'c1', name: 'Grade 5 Alpha', teacherIds: ['t1'], studentIds: ['s1', 's3'], subjectIds: ['subj_math'], description: 'Morning session focusing on Mathematics for 5th graders.' },
    { id: 'c2', name: 'Grade 6 Science Enthusiasts', teacherIds: ['t2'], studentIds: ['s2'], subjectIds: ['subj_sci'], description: 'Focus on practical science projects.'},
    { id: 'c3', name: 'Grade 5 Language Arts', teacherIds: ['t1'], studentIds: ['s1', 's3'], subjectIds: ['subj_la'], description: 'Developing reading and writing skills.'},
    { id: 'c4', name: 'Grade 7 Liberian History', teacherIds: ['t2'], studentIds: ['s_blake', 's2'], subjectIds: ['subj_libhist'], description: 'Covering key events and figures in Liberian history.'},
    { id: 'c5', name: 'Grade 7 French Beginners', teacherIds: ['t1'], studentIds: ['s3', 's_blake'], subjectIds: ['subj_french'], description: 'Introduction to French vocabulary and grammar.'},
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
        subjectId: 'subj_math',
        subjectOrAssignmentName: 'Mathematics - First Term Test',
        assessmentType: 'Test',
        score: '85',
        maxScore: 100,
        dateAssigned: '2024-10-15',
        dueDate: '2024-10-14',
        status: 'Graded',
        teacherComments: 'Good effort, needs to review fractions.',
        liberianGrade: 'A1',
        continuousAssessment: 82,
        externalExamination: 86,
        term: 1,
        isWAECSubject: false
    },
    {
        id: 'g2',
        studentId: 's1',
        classId: 'c3', // Grade 5 Language Arts
        subjectId: 'subj_la',
        subjectOrAssignmentName: 'Language Arts - Book Report',
        assessmentType: 'Assignment',
        score: '88',
        maxScore: 100,
        dateAssigned: '2024-10-22',
        dueDate: '2024-10-21',
        status: 'Graded',
        teacherComments: 'Excellent presentation!',
        liberianGrade: 'A1',
        continuousAssessment: 85,
        externalExamination: 90,
        term: 1,
        isWAECSubject: false
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
        subjectId: 'subj_sci',
        subjectOrAssignmentName: 'Science Project Proposal',
        assessmentType: 'Project',
        score: '75',
        maxScore: 100,
        dateAssigned: lastWeek.toISOString().split('T')[0],
        dueDate: lastWeek.toISOString().split('T')[0],
        status: 'Graded',
        liberianGrade: 'A2',
        continuousAssessment: 78,
        externalExamination: 73,
        term: 1,
        isWAECSubject: true
    },
    // Additional sample grades for comprehensive testing
    {
        id: 'g9',
        studentId: 's3',
        classId: 'c1', // Grade 5 Alpha (Math)
        subjectId: 'subj_math',
        subjectOrAssignmentName: 'Mathematics - Second Term Quiz',
        assessmentType: 'Quiz',
        score: '92',
        maxScore: 100,
        dateAssigned: '2025-02-10',
        status: 'Graded',
        teacherComments: 'Excellent understanding of concepts.',
        liberianGrade: 'A1',
        continuousAssessment: 90,
        externalExamination: 93,
        term: 2,
        isWAECSubject: false
    },
    {
        id: 'g10',
        studentId: 's4',
        classId: 'c2', // Science
        subjectId: 'subj_sci',
        subjectOrAssignmentName: 'General Science - Laboratory Practical',
        assessmentType: 'Exam',
        score: '67',
        maxScore: 100,
        dateAssigned: '2025-02-15',
        status: 'Graded',
        teacherComments: 'Good practical skills, needs theory improvement.',
        liberianGrade: 'B2',
        continuousAssessment: 70,
        externalExamination: 65,
        term: 2,
        isWAECSubject: true
    },
    {
        id: 'g11',
        studentId: 's5',
        classId: 'c4', // Liberian History
        subjectId: 'subj_libhist',
        subjectOrAssignmentName: 'Liberian History - Independence Essay',
        assessmentType: 'Assignment',
        score: '58',
        maxScore: 100,
        dateAssigned: '2025-01-20',
        status: 'Graded',
        teacherComments: 'Shows understanding but needs more detail.',
        liberianGrade: 'C4',
        continuousAssessment: 60,
        externalExamination: 57,
        term: 2,
        isWAECSubject: false,
        submissionStatus: 'Draft',
        submittedToAdmin: false
    },
    // Sample submitted grades for demonstration
    {
        id: 'g12',
        studentId: 's1',
        classId: 'c1',
        subjectId: 'subj_math',
        subjectOrAssignmentName: 'Mathematics - Final Term Grade',
        assessmentType: 'Exam',
        score: '87',
        maxScore: 100,
        dateAssigned: '2024-12-15',
        status: 'Graded',
        teacherComments: 'Excellent performance throughout the term.',
        liberianGrade: 'A1',
        continuousAssessment: 85,
        externalExamination: 88,
        term: 1,
        isWAECSubject: true,
        submissionStatus: 'Submitted',
        submittedToAdmin: true,
        submittedDate: '2024-12-20',
        submittedBy: 't1',
        isFinalGrade: true,
        isLocked: true
    },
    {
        id: 'g13',
        studentId: 's3',
        classId: 'c3',
        subjectId: 'subj_la',
        subjectOrAssignmentName: 'Language Arts - Final Term Grade',
        assessmentType: 'Exam',
        score: '79',
        maxScore: 100,
        dateAssigned: '2024-12-15',
        status: 'Graded',
        teacherComments: 'Good improvement in writing skills.',
        liberianGrade: 'A2',
        continuousAssessment: 82,
        externalExamination: 77,
        term: 1,
        isWAECSubject: true,
        submissionStatus: 'Approved',
        submittedToAdmin: true,
        submittedDate: '2024-12-20',
        submittedBy: 't1',
        approvedBy: 'admin1',
        approvedDate: '2024-12-22',
        isFinalGrade: true,
        isLocked: true
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
  // Term 1 Events (September - December)
  {
    id: 'evt1',
    title: 'First Term Opening - Academic Year 2024/2025',
    date: '2024-09-02',
    description: 'Official opening of schools for the 2024/2025 academic year. All students and teachers report to school.',
    audience: 'all',
  },
  // Note: Liberian cultural events are now automatically generated by the liberianCalendarSystem
  // This includes Independence Day, Thanksgiving Day, Armed Forces Day, etc.
  {
    id: 'evt3',
    title: 'First Term Mid-Term Examinations',
    date: '2024-10-14',
    description: 'Mid-term examinations for all grades (Elementary through Senior High). Check examination timetable.',
    audience: 'all',
  },
  {
    id: 'evt4',
    title: 'Thanksgiving Day Holiday',
    date: '2024-11-07',
    description: 'National Thanksgiving Day holiday. Schools closed.',
    audience: 'all',
  },
  {
    id: 'evt5',
    title: 'First Term Final Examinations',
    date: '2024-12-02',
    description: 'First term final examinations begin. Students must be present for all scheduled exams.',
    audience: 'all',
  },
  {
    id: 'evt6',
    title: 'Christmas Holiday Break Begins',
    date: '2024-12-20',
    description: 'Schools close for Christmas and New Year holidays. Classes resume in January.',
    audience: 'all',
  },
  // Term 2 Events (January - April)
  {
    id: 'evt7',
    title: 'Second Term Opening',
    date: '2025-01-13',
    description: 'Schools reopen for the second term. All students and staff report.',
    audience: 'all',
  },
  {
    id: 'evt8',
    title: 'Armed Forces Day Holiday',
    date: '2025-02-11',
    description: 'National Armed Forces Day holiday. Schools closed.',
    audience: 'all',
  },
  {
    id: 'evt9',
    title: 'Second Term Mid-Term Examinations',
    date: '2025-02-24',
    description: 'Second term mid-term examinations for all grade levels.',
    audience: 'all',
  },
  {
    id: 'evt10',
    title: 'Decoration Day Holiday',
    date: '2025-03-12',
    description: 'National Decoration Day holiday. Schools closed.',
    audience: 'all',
  },
  {
    id: 'evt11',
    title: 'Parent-Teacher Conference Week',
    date: '2025-03-17',
    description: 'Week-long parent-teacher conferences to discuss student progress. Parents encouraged to attend.',
    audience: [UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN],
  },
  {
    id: 'evt12',
    title: 'Good Friday Holiday',
    date: '2025-04-18',
    description: 'Good Friday national holiday. Schools closed.',
    audience: 'all',
  },
  {
    id: 'evt13',
    title: 'Second Term Final Examinations',
    date: '2025-04-21',
    description: 'Second term final examinations begin.',
    audience: 'all',
  },
  // Term 3 Events (May - July)
  {
    id: 'evt14',
    title: 'Third Term Opening',
    date: '2025-05-05',
    description: 'Schools reopen for the third and final term of the academic year.',
    audience: 'all',
  },
  {
    id: 'evt15',
    title: 'Unification Day Holiday',
    date: '2025-05-14',
    description: 'National Unification Day holiday. Schools closed.',
    audience: 'all',
  },
  {
    id: 'evt16',
    title: 'WAEC Examinations Begin',
    date: '2025-05-19',
    description: 'West African Senior School Certificate Examinations (WASSCE) begin for Grade 12 students.',
    audience: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
  },
  {
    id: 'evt17',
    title: 'Third Term Mid-Term Examinations',
    date: '2025-06-02',
    description: 'Third term mid-term examinations for Grades 1-11.',
    audience: 'all',
  },
  {
    id: 'evt18',
    title: 'Final Examinations & Graduation Preparation',
    date: '2025-07-07',
    description: 'Final examinations for all grades and graduation preparation activities.',
    audience: 'all',
  },
  {
    id: 'evt19',
    title: 'Graduation Ceremonies',
    date: '2025-07-21',
    description: 'Graduation ceremonies for completing students. Academic year 2024/2025 concludes.',
    audience: 'all',
  }
];

export const MOCK_DOCUMENT_RESOURCES_INITIAL: DocumentResource[] = []; // Initially empty