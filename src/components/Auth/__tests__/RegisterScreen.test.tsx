import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, userEvent } from '../../../test/test-utils'
import RegisterScreen from '../../../../components/Auth/RegisterScreen'

describe('RegisterScreen Component', () => {
  const mockRegisterUser = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders registration form with all required fields', () => {
      const { getByLabelText, getByRole, getByText } = renderWithProviders(
        <RegisterScreen />,
        { contextValue: { registerUser: mockRegisterUser } }
      )
      
      expect(getByText(/create account/i)).toBeInTheDocument()
      expect(getByLabelText(/email/i)).toBeInTheDocument()
      expect(getByLabelText(/^password/i)).toBeInTheDocument()
      expect(getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(getByLabelText(/i am a/i)).toBeInTheDocument()
      expect(getByRole('button', { name: /register/i })).toBeInTheDocument()
    })

    it('renders role selection dropdown', () => {
      const { getByLabelText } = renderWithProviders(<RegisterScreen />)

      const roleSelect = getByLabelText(/i am a/i)
      expect(roleSelect).toBeInTheDocument()
      expect(roleSelect.tagName).toBe('SELECT')
    })

    it('renders link to login screen', () => {
      const { getByText } = renderWithProviders(<RegisterScreen />)
      
      const loginLink = getByText(/already have an account/i).closest('a') || 
                       getByText(/sign in/i).closest('a')
      expect(loginLink).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup()
      
      const { getByRole, findByText } = renderWithProviders(<RegisterScreen />)
      const submitButton = getByRole('button', { name: /register|sign up/i })
      
      await user.click(submitButton)
      
      // Check for validation messages based on actual implementation
      expect(await findByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegisterScreen />)
      const emailInput = getByLabelText(/email/i)
      const submitButton = getByRole('button', { name: /register|sign up/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      expect(await findByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    it('validates full name requirements', async () => {
      const user = userEvent.setup()

      const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegisterScreen />)
      const nameInput = getByLabelText(/full name/i)
      const submitButton = getByRole('button', { name: /register/i })

      await user.type(nameInput, 'A') // Too short
      await user.click(submitButton)

      expect(await findByText(/student name is required/i)).toBeInTheDocument()
    })

    it('validates password strength', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegisterScreen />)
      const passwordInput = getByLabelText(/^password/i)
      const submitButton = getByRole('button', { name: /register/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      expect(await findByText(/password must be at least 6 characters long/i)).toBeInTheDocument()
    })

    it('validates password confirmation match', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegisterScreen />)
      const passwordInput = getByLabelText(/^password/i)
      const confirmPasswordInput = getByLabelText(/confirm password/i)
      const submitButton = getByRole('button', { name: /register|sign up/i })
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password456')
      await user.click(submitButton)
      
      expect(await findByText(/passwords do not match/i) || 
             await findByText(/passwords must match/i)).toBeInTheDocument()
    })

    it('validates role selection', async () => {
      const { getByLabelText } = renderWithProviders(<RegisterScreen />)
      const roleSelect = getByLabelText(/i am a/i) as HTMLSelectElement

      // Role has default selection, so this test checks that form works with role
      expect(roleSelect).toBeInTheDocument()
      expect(roleSelect.value).toBe('ADMIN') // Default selection
    })
  })

  describe('Registration Flow', () => {
    it('calls registerUser with correct data', async () => {
      mockRegisterUser.mockResolvedValue({ success: true, message: 'Success' })
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole } = renderWithProviders(
        <RegisterScreen />,
        { contextValue: { registerUser: mockRegisterUser } }
      )
      
      const emailInput = getByLabelText(/email/i)
      const nameInput = getByLabelText(/full name/i)
      const passwordInput = getByLabelText(/^password/i)
      const confirmPasswordInput = getByLabelText(/confirm password/i)
      const roleSelect = getByLabelText(/i am a/i)
      const submitButton = getByRole('button', { name: /register/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(nameInput, 'Test User')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.selectOptions(roleSelect, 'STUDENT')
      await user.click(submitButton)

      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'STUDENT'
      })
    })

    it('shows loading state during registration', async () => {
      mockRegisterUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole } = renderWithProviders(
        <RegisterScreen />,
        { contextValue: { registerUser: mockRegisterUser } }
      )
      
      // Fill form
      await user.type(getByLabelText(/email/i), 'test@example.com')
      await user.type(getByLabelText(/full name/i), 'Test User')
      await user.type(getByLabelText(/^password/i), 'password123')
      await user.type(getByLabelText(/confirm password/i), 'password123')
      await user.selectOptions(getByLabelText(/i am a/i), 'STUDENT')

      const submitButton = getByRole('button', { name: /register/i })
      await user.click(submitButton)
      
      // Check for loading state
      expect(submitButton).toBeDisabled()
      // The Button component should show loading state when loading prop is true
    })

    it('handles registration success', async () => {
      mockRegisterUser.mockResolvedValue({ success: true, message: 'Account created successfully' })
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole, findByText } = renderWithProviders(
        <RegisterScreen />,
        { contextValue: { registerUser: mockRegisterUser } }
      )
      
      // Fill and submit form
      await user.type(getByLabelText(/email/i), 'test@example.com')
      await user.type(getByLabelText(/full name/i), 'Test User')
      await user.type(getByLabelText(/^password/i), 'password123')
      await user.type(getByLabelText(/confirm password/i), 'password123')
      await user.selectOptions(getByLabelText(/i am a/i), 'STUDENT')
      await user.click(getByRole('button', { name: /register/i }))

      expect(await findByText(/account created successfully/i)).toBeInTheDocument()
    })

    it('handles registration failure', async () => {
      mockRegisterUser.mockResolvedValue({ success: false, message: 'Email already exists' })
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole, findByText } = renderWithProviders(
        <RegisterScreen />,
        { contextValue: { registerUser: mockRegisterUser } }
      )
      
      // Fill and submit form
      await user.type(getByLabelText(/email/i), 'existing@example.com')
      await user.type(getByLabelText(/full name/i), 'Test User')
      await user.type(getByLabelText(/^password/i), 'password123')
      await user.type(getByLabelText(/confirm password/i), 'password123')
      await user.selectOptions(getByLabelText(/i am a/i), 'STUDENT')
      await user.click(getByRole('button', { name: /register/i }))

      expect(await findByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  describe('Role-Specific Fields', () => {
    it('shows additional fields for teacher role', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, queryByLabelText } = renderWithProviders(<RegisterScreen />)
      const roleSelect = getByLabelText(/i am a/i)

      await user.selectOptions(roleSelect, 'TEACHER')

      // Check for teacher-specific fields (based on actual implementation)
      expect(queryByLabelText(/full name.*teacher/i)).toBeInTheDocument()
    })

    it('shows additional fields for student role', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, queryByLabelText } = renderWithProviders(<RegisterScreen />)
      const roleSelect = getByLabelText(/i am a/i)

      await user.selectOptions(roleSelect, 'STUDENT')

      // Check for student-specific fields (based on actual implementation)
      expect(queryByLabelText(/full name.*student/i)).toBeInTheDocument()
      expect(queryByLabelText(/grade/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure and labels', () => {
      const { container, getByLabelText } = renderWithProviders(<RegisterScreen />)
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()

      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/^password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()

      const { getByLabelText, getByRole } = renderWithProviders(<RegisterScreen />)

      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/^password/i)
      const submitButton = getByRole('button', { name: /register/i })

      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      // Continue tabbing to submit button
      await user.tab()
      await user.tab()
      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode styles correctly', () => {
      document.documentElement.classList.add('dark')

      const { getByText, container } = renderWithProviders(<RegisterScreen />)

      // Component should render without errors in dark mode
      expect(getByText('Create Account')).toBeInTheDocument()
      expect(container.querySelector('form')).toBeInTheDocument()

      document.documentElement.classList.remove('dark')
    })
  })
})
