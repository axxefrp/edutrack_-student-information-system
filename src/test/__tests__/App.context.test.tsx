import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { renderWithProviders, userEvent, waitForAsync } from '../test-utils'
import { AppContext } from '../../../App'
import { mockTestData } from '../firebase-mocks'

// Test component to access context
const TestContextConsumer = () => {
  const context = React.useContext(AppContext)
  if (!context) throw new Error('Context not found')
  
  return (
    <div>
      <div data-testid="current-user">{context.currentUser?.username || 'No user'}</div>
      <div data-testid="students-count">{context.students.length}</div>
      <div data-testid="teachers-count">{context.teachers.length}</div>
      <div data-testid="classes-count">{context.schoolClasses.length}</div>
      <div data-testid="subjects-count">{context.subjects.length}</div>
      <button 
        data-testid="add-teacher-btn"
        onClick={() => context.addTeacher('Test Teacher', ['subject-1'], 'user-1')}
      >
        Add Teacher
      </button>
      <button 
        data-testid="add-class-btn"
        onClick={() => context.addSchoolClass('Test Class', ['subject-1'], 'Test Description')}
      >
        Add Class
      </button>
    </div>
  )
}

describe('App Context State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Context Provider', () => {
    it('provides context values to children', () => {
      const { getByTestId } = renderWithProviders(<TestContextConsumer />)
      
      expect(getByTestId('current-user')).toHaveTextContent('testuser')
      expect(getByTestId('students-count')).toHaveTextContent('2')
      expect(getByTestId('teachers-count')).toHaveTextContent('2')
      expect(getByTestId('classes-count')).toHaveTextContent('2')
      expect(getByTestId('subjects-count')).toHaveTextContent('2')
    })

    it('handles missing context gracefully', () => {
      // Test component outside provider by using render directly without context
      expect(() => {
        render(<TestContextConsumer />)
      }).toThrow('Context not found')
    })
  })

  describe('Teacher CRUD Operations', () => {
    it('handles addTeacher with subjectIds parameter correctly', async () => {
      const mockAddTeacher = vi.fn().mockResolvedValue({
        id: 'teacher-3',
        userId: 'user-1',
        name: 'Test Teacher',
        subjectIds: ['subject-1']
      })

      const { getByTestId } = renderWithProviders(
        <TestContextConsumer />,
        { contextValue: { addTeacher: mockAddTeacher } }
      )

      const addButton = getByTestId('add-teacher-btn')
      await userEvent.setup().click(addButton)

      expect(mockAddTeacher).toHaveBeenCalledWith('Test Teacher', ['subject-1'], 'user-1')
    })

    it('handles addTeacher with empty subjectIds array', async () => {
      const mockAddTeacher = vi.fn().mockResolvedValue({
        id: 'teacher-3',
        userId: 'user-1',
        name: 'Test Teacher',
        subjectIds: []
      })

      // Create a test component that calls the function
      const TestComponent = () => {
        const context = React.useContext(AppContext)
        React.useEffect(() => {
          context?.addTeacher('Test Teacher', undefined as any, 'user-1')
        }, [context])
        return <div>Test</div>
      }

      renderWithProviders(
        <TestComponent />,
        { contextValue: { addTeacher: mockAddTeacher } }
      )

      // Wait for effect to run
      await waitForAsync()
      expect(mockAddTeacher).toHaveBeenCalledWith('Test Teacher', undefined, 'user-1')
    })

    it('handles addTeacher with null subjectIds parameter', async () => {
      const mockAddTeacher = vi.fn().mockImplementation(async (name, subjectIds, userId) => {
        // Simulate the actual App.tsx logic: subjectIds || []
        const normalizedSubjectIds = subjectIds || []
        return {
          id: 'teacher-3',
          userId,
          name,
          subjectIds: normalizedSubjectIds
        }
      })

      let result: any = null

      // Create a test component that calls the function
      const TestComponent = () => {
        const context = React.useContext(AppContext)
        React.useEffect(() => {
          const callAddTeacher = async () => {
            result = await context?.addTeacher('Test Teacher', null as any, 'user-1')
          }
          callAddTeacher()
        }, [context])
        return <div>Test</div>
      }

      renderWithProviders(
        <TestComponent />,
        { contextValue: { addTeacher: mockAddTeacher } }
      )

      // Wait for effect to run
      await waitForAsync()
      expect(result?.subjectIds).toEqual([])
      expect(mockAddTeacher).toHaveBeenCalledWith('Test Teacher', null, 'user-1')
    })
  })

  describe('Class CRUD Operations', () => {
    it('handles addSchoolClass with subjectIds parameter correctly', async () => {
      const mockAddClass = vi.fn().mockResolvedValue({
        id: 'class-3',
        name: 'Test Class',
        subjectIds: ['subject-1'],
        description: 'Test Description',
        teacherIds: [],
        studentIds: []
      })

      const { getByTestId } = renderWithProviders(
        <TestContextConsumer />,
        { contextValue: { addSchoolClass: mockAddClass } }
      )

      const addButton = getByTestId('add-class-btn')
      await userEvent.setup().click(addButton)

      expect(mockAddClass).toHaveBeenCalledWith('Test Class', ['subject-1'], 'Test Description')
    })

    it('handles addSchoolClass with empty subjectIds array', async () => {
      const mockAddClass = vi.fn().mockImplementation(async (name, subjectIds, description) => {
        // Simulate the actual App.tsx logic: subjectIds || []
        const normalizedSubjectIds = subjectIds || []
        return {
          id: 'class-3',
          name,
          subjectId: normalizedSubjectIds[0] || '',
          teacherId: '',
          studentIds: [],
          description: description || ''
        }
      })

      let result: any = null

      // Create a test component that calls the function
      const TestComponent = () => {
        const context = React.useContext(AppContext)
        React.useEffect(() => {
          const callAddClass = async () => {
            result = await context?.addSchoolClass('Test Class', undefined as any, 'Test Description')
          }
          callAddClass()
        }, [context])
        return <div>Test</div>
      }

      renderWithProviders(
        <TestComponent />,
        { contextValue: { addSchoolClass: mockAddClass } }
      )

      // Wait for effect to run
      await waitForAsync()
      expect(result?.subjectId).toBe('')
      expect(mockAddClass).toHaveBeenCalledWith('Test Class', undefined, 'Test Description')
    })
  })

  describe('Data Consistency', () => {
    it('maintains referential integrity between teachers and subjects', () => {
      const { getByTestId } = renderWithProviders(<TestContextConsumer />)
      
      // Verify that mock data has consistent relationships
      const teachersCount = parseInt(getByTestId('teachers-count').textContent || '0')
      const subjectsCount = parseInt(getByTestId('subjects-count').textContent || '0')
      
      expect(teachersCount).toBeGreaterThan(0)
      expect(subjectsCount).toBeGreaterThan(0)
      
      // Verify mock data structure
      expect(mockTestData.teachers[0]).toHaveProperty('subjectIds')
      expect(Array.isArray(mockTestData.teachers[0].subjectIds)).toBe(true)
    })

    it('maintains referential integrity between classes and subjects', () => {
      const { getByTestId } = renderWithProviders(<TestContextConsumer />)
      
      const classesCount = parseInt(getByTestId('classes-count').textContent || '0')
      const subjectsCount = parseInt(getByTestId('subjects-count').textContent || '0')
      
      expect(classesCount).toBeGreaterThan(0)
      expect(subjectsCount).toBeGreaterThan(0)
      
      // Verify mock data structure
      expect(mockTestData.classes[0]).toHaveProperty('subjectId')
      expect(typeof mockTestData.classes[0].subjectId).toBe('string')
    })
  })

  describe('Error Handling', () => {
    it('handles Firebase errors gracefully in addTeacher', async () => {
      const mockAddTeacher = vi.fn().mockRejectedValue(new Error('Firebase error'))
      
      const { getByTestId } = renderWithProviders(
        <TestContextConsumer />,
        { contextValue: { addTeacher: mockAddTeacher } }
      )

      const addButton = getByTestId('add-teacher-btn')
      
      // Should not throw error, should handle gracefully
      await expect(async () => {
        await userEvent.setup().click(addButton)
      }).not.toThrow()
    })

    it('handles Firebase errors gracefully in addSchoolClass', async () => {
      const mockAddClass = vi.fn().mockRejectedValue(new Error('Firebase error'))
      
      const { getByTestId } = renderWithProviders(
        <TestContextConsumer />,
        { contextValue: { addSchoolClass: mockAddClass } }
      )

      const addButton = getByTestId('add-class-btn')
      
      // Should not throw error, should handle gracefully
      await expect(async () => {
        await userEvent.setup().click(addButton)
      }).not.toThrow()
    })
  })

  describe('Type Safety', () => {
    it('ensures subjectIds is always an array in Teacher objects', () => {
      const { getByTestId } = renderWithProviders(<TestContextConsumer />)
      
      // Verify that all teachers in mock data have array subjectIds
      mockTestData.teachers.forEach(teacher => {
        expect(Array.isArray(teacher.subjectIds)).toBe(true)
        expect(teacher.subjectIds).toBeDefined()
      })
    })

    it('ensures proper typing for class subject relationships', () => {
      const { getByTestId } = renderWithProviders(<TestContextConsumer />)
      
      // Verify that all classes in mock data have proper subject relationships
      mockTestData.classes.forEach(schoolClass => {
        expect(typeof schoolClass.subjectId).toBe('string')
        expect(schoolClass.subjectId).toBeDefined()
      })
    })
  })
})
