import { vi } from 'vitest'
import { User, Student, Teacher, SchoolClass, Grade, Message, SchoolEvent, Subject, DocumentResource, PointTransaction, PointRule, PointRuleSuggestion } from '../../types'

// Mock Firebase User
export const createMockFirebaseUser = (overrides = {}) => ({
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  ...overrides,
})

// Mock App User
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-uid-123',
  email: 'test@example.com',
  username: 'testuser',
  role: 'STUDENT',
  ...overrides,
})

// Mock Student
export const createMockStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 'student-1',
  name: 'Test Student',
  grade: 5,
  points: 100,
  attendance: [{ date: '2024-01-15', status: 'present' }],
  ...overrides,
})

// Mock Teacher
export const createMockTeacher = (overrides: Partial<Teacher> = {}): Teacher => ({
  id: 'teacher-1',
  userId: 'user-teacher-1',
  name: 'Test Teacher',
  subjectIds: ['subject-1'],
  ...overrides,
})

// Mock Class
export const createMockClass = (overrides: Partial<SchoolClass> = {}): SchoolClass => ({
  id: 'class-1',
  name: 'Math 101',
  teacherId: 'teacher-1',
  studentIds: ['student-1', 'student-2'],
  subjectId: 'subject-1',
  description: 'Basic Mathematics',
  ...overrides,
})

// Mock Grade
export const createMockGrade = (overrides: Partial<Grade> = {}): Grade => ({
  id: 'grade-1',
  studentId: 'student-1',
  classId: 'class-1',
  subjectOrAssignmentName: 'Math Quiz 1',
  score: 85,
  maxScore: 100,
  dateAssigned: '2024-01-15',
  teacherComments: 'Good work!',
  status: 'Graded',
  ...overrides,
})

// Mock Message
export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'message-1',
  senderId: 'user-1',
  recipientId: 'user-2',
  content: 'Test message',
  timestamp: '2024-01-15T10:00:00Z',
  isRead: false,
  ...overrides,
})

// Mock Subject
export const createMockSubject = (overrides: Partial<Subject> = {}): Subject => ({
  id: 'subject-1',
  name: 'Mathematics',
  description: 'Basic Mathematics Course',
  ...overrides,
})

// Mock Point Transaction
export const createMockPointTransaction = (overrides: Partial<PointTransaction> = {}): PointTransaction => ({
  id: 'transaction-1',
  studentId: 'student-1',
  points: 10,
  reason: 'Good behavior',
  awardedBy: 'teacher-1',
  date: '2024-01-15',
  ...overrides,
})

// Mock Firebase Auth
export const createMockAuth = () => ({
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    // Simulate immediate call with no user
    callback(null)
    // Return unsubscribe function
    return vi.fn()
  }),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: createMockFirebaseUser(),
  }),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: createMockFirebaseUser(),
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
})

// Mock Firestore Document
export const createMockDocumentSnapshot = (data: any, exists = true) => ({
  exists: () => exists,
  data: () => data,
  id: data?.id || 'mock-doc-id',
})

// Mock Firestore Collection Snapshot
export const createMockCollectionSnapshot = (docs: any[]) => ({
  docs: docs.map(doc => createMockDocumentSnapshot(doc)),
  size: docs.length,
  empty: docs.length === 0,
})

// Mock Firestore
export const createMockFirestore = () => {
  const mockDoc = vi.fn().mockReturnValue({
    id: 'mock-doc-id',
  })
  
  const mockCollection = vi.fn().mockReturnValue({
    doc: mockDoc,
  })

  return {
    collection: mockCollection,
    doc: mockDoc,
    getDoc: vi.fn().mockResolvedValue(createMockDocumentSnapshot({ id: 'test' })),
    setDoc: vi.fn().mockResolvedValue(undefined),
    addDoc: vi.fn().mockResolvedValue({ id: 'new-doc-id' }),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    onSnapshot: vi.fn((callback) => {
      // Simulate immediate call with empty data
      callback(createMockCollectionSnapshot([]))
      // Return unsubscribe function
      return vi.fn()
    }),
  }
}

// Mock Firebase Storage
export const createMockStorage = () => ({
  ref: vi.fn().mockReturnValue({
    name: 'test-file.pdf',
    fullPath: 'test/test-file.pdf',
  }),
  uploadBytes: vi.fn().mockResolvedValue({
    metadata: { name: 'test-file.pdf' },
  }),
  getDownloadURL: vi.fn().mockResolvedValue('https://example.com/test-file.pdf'),
})

// Test Data Collections
export const mockTestData = {
  users: [
    createMockUser({ uid: 'admin-1', role: 'ADMIN', username: 'admin' }),
    createMockUser({ uid: 'teacher-1', role: 'TEACHER', username: 'teacher', teacherId: 'teacher-1' }),
    createMockUser({ uid: 'student-1', role: 'STUDENT', username: 'student', studentId: 'student-1' }),
    createMockUser({ uid: 'parent-1', role: 'PARENT', username: 'parent' }),
  ],
  students: [
    createMockStudent({ id: 'student-1', name: 'Alice Johnson', grade: 5, points: 150 }),
    createMockStudent({ id: 'student-2', name: 'Bob Smith', grade: 6, points: 120 }),
  ],
  teachers: [
    createMockTeacher({ id: 'teacher-1', name: 'Ms. Johnson', subjectIds: ['subject-1'] }),
    createMockTeacher({ id: 'teacher-2', name: 'Mr. Brown', subjectIds: ['subject-2'] }),
  ],
  classes: [
    createMockClass({ id: 'class-1', name: 'Math 5A', teacherId: 'teacher-1', subjectId: 'subject-1' }),
    createMockClass({ id: 'class-2', name: 'Science 6B', teacherId: 'teacher-2', subjectId: 'subject-2' }),
  ],
  subjects: [
    createMockSubject({ id: 'subject-1', name: 'Mathematics' }),
    createMockSubject({ id: 'subject-2', name: 'Science' }),
  ],
  grades: [
    createMockGrade({ id: 'grade-1', studentId: 'student-1', classId: 'class-1', score: 85 }),
    createMockGrade({ id: 'grade-2', studentId: 'student-2', classId: 'class-1', score: 92 }),
  ],
  messages: [
    createMockMessage({ id: 'msg-1', senderId: 'teacher-1', recipientId: 'student-1' }),
  ],
  pointTransactions: [
    createMockPointTransaction({ id: 'pt-1', studentId: 'student-1', points: 10 }),
  ],
}
