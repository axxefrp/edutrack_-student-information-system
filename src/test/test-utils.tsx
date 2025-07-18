import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppContext, AppContextType } from '../../App'
import { mockTestData, createMockUser } from './firebase-mocks'
import { User, UserRole } from '../../types'

// Mock AppContext with default values
const createMockAppContext = (overrides: Partial<AppContextType> = {}): AppContextType => ({
  // User state
  currentUser: createMockUser(),
  users: mockTestData.users,
  authLoading: false,
  
  // Data collections
  students: mockTestData.students,
  teachers: mockTestData.teachers,
  schoolClasses: mockTestData.classes,
  subjects: mockTestData.subjects,
  grades: mockTestData.grades,
  messages: mockTestData.messages,
  pointTransactions: mockTestData.pointTransactions,
  schoolEvents: [],
  documentResources: [],
  pointRules: [],
  pointRuleSuggestions: [],
  notifications: [],

  // Auth functions
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn().mockResolvedValue(undefined),
  registerUser: vi.fn().mockResolvedValue({ success: true, message: 'Success' }),

  // CRUD functions - Students
  addStudent: vi.fn().mockResolvedValue(mockTestData.students[0]),
  updateStudent: vi.fn().mockResolvedValue(mockTestData.students[0]),
  deleteStudent: vi.fn().mockResolvedValue(undefined),

  // CRUD functions - Teachers
  addTeacher: vi.fn().mockResolvedValue(mockTestData.teachers[0]),
  updateTeacher: vi.fn().mockResolvedValue(mockTestData.teachers[0]),
  deleteTeacher: vi.fn().mockResolvedValue(undefined),

  // CRUD functions - Classes
  addClass: vi.fn().mockResolvedValue(mockTestData.classes[0]),
  updateClass: vi.fn().mockResolvedValue(mockTestData.classes[0]),
  deleteClass: vi.fn().mockResolvedValue(undefined),

  // CRUD functions - Subjects
  addSubject: vi.fn().mockResolvedValue(mockTestData.subjects[0]),
  updateSubject: vi.fn().mockResolvedValue(mockTestData.subjects[0]),
  deleteSubject: vi.fn().mockResolvedValue(undefined),

  // CRUD functions - Grades
  addGrade: vi.fn().mockResolvedValue(mockTestData.grades[0]),
  updateGrade: vi.fn().mockResolvedValue(mockTestData.grades[0]),
  deleteGrade: vi.fn().mockResolvedValue(undefined),

  // Point system functions
  awardPoints: vi.fn().mockResolvedValue(mockTestData.pointTransactions[0]),
  addPointRule: vi.fn().mockResolvedValue(null),
  updatePointRule: vi.fn().mockResolvedValue(null),
  deletePointRule: vi.fn().mockResolvedValue(undefined),
  applyPointSuggestion: vi.fn().mockResolvedValue(undefined),
  dismissPointSuggestion: vi.fn().mockResolvedValue(undefined),

  // Messaging functions
  sendMessage: vi.fn().mockResolvedValue(mockTestData.messages[0]),
  markMessageAsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadMessagesCount: vi.fn().mockReturnValue(0),

  // Event functions
  addSchoolEvent: vi.fn().mockResolvedValue(null),

  // Resource functions
  addDocumentResource: vi.fn().mockResolvedValue(null),
  deleteDocumentResource: vi.fn().mockResolvedValue(undefined),

  // Notification functions
  addNotification: vi.fn(),
  removeNotification: vi.fn(),

  // Utility functions
  updateAttendance: vi.fn().mockResolvedValue(undefined),

  ...overrides,
})

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  contextValue?: Partial<AppContextType>
  currentUser?: User | null
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    contextValue = {},
    currentUser = createMockUser(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const mockContext = createMockAppContext({
    currentUser,
    ...contextValue,
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <AppContext.Provider value={mockContext}>
        {children}
      </AppContext.Provider>
    </MemoryRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Helper to render with specific user role
export const renderWithRole = (
  ui: ReactElement,
  role: UserRole,
  options: CustomRenderOptions = {}
) => {
  const user = createMockUser({ role })
  return renderWithProviders(ui, { ...options, currentUser: user })
}

// Helper to render without authentication
export const renderWithoutAuth = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  return renderWithProviders(ui, { ...options, currentUser: null })
}

// Helper to create mock form events
export const createMockFormEvent = (formData: Record<string, string>) => {
  const form = document.createElement('form')
  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  return {
    preventDefault: vi.fn(),
    target: form,
    currentTarget: form,
  } as unknown as React.FormEvent<HTMLFormElement>
}

// Helper to create mock file for upload testing
export const createMockFile = (
  name = 'test.pdf',
  size = 1024,
  type = 'application/pdf'
): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Common test assertions
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
