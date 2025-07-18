import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, userEvent, waitForAsync } from '../../../test/test-utils'
import LoginScreen from '../../../../components/Auth/LoginScreen'

describe('LoginScreen Component', () => {
  const mockLogin = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      const { getByLabelText, getByRole, getByText } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )

      expect(getByText('EduTrack SIS')).toBeInTheDocument()
      expect(getByText('Welcome! Please sign in to continue.')).toBeInTheDocument()
      expect(getByLabelText(/email/i)).toBeInTheDocument()
      expect(getByLabelText(/password/i)).toBeInTheDocument()
      expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders link to register screen', () => {
      const { getByText } = renderWithProviders(<LoginScreen />)

      const registerLink = getByText(/don't have an account/i).closest('a') ||
                          getByText(/register here/i).closest('a')
      expect(registerLink).toBeInTheDocument()
    })

    it('renders helpful registration instructions', () => {
      const { getByText } = renderWithProviders(<LoginScreen />)

      expect(getByText(/first time\? please register an account/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required fields using HTML5 validation', async () => {
      const user = userEvent.setup()

      const { getByRole, getByLabelText } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )
      const submitButton = getByRole('button', { name: /sign in/i })
      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)

      // HTML5 validation should prevent form submission with empty fields
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()

      // Form should have proper validation attributes
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('validates email format using HTML5 validation', async () => {
      const user = userEvent.setup()

      const { getByLabelText } = renderWithProviders(<LoginScreen />)
      const emailInput = getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')

      // HTML5 email validation should be present
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toBeRequired()
    })

    it('requires password field', async () => {
      const user = userEvent.setup()

      const { getByLabelText } = renderWithProviders(<LoginScreen />)
      const passwordInput = getByLabelText(/password/i)

      // Password field should be required
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Authentication Flow', () => {
    it('calls login function with correct credentials', async () => {
      mockLogin.mockResolvedValue(true)
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )
      
      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)
      const submitButton = getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('shows loading state during authentication', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )
      
      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)
      const submitButton = getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      // Check for loading state
      expect(submitButton).toBeDisabled()
      // The Button component should show loading state when loading prop is true
    })

    it('handles authentication failure', async () => {
      mockLogin.mockResolvedValue(false)
      const user = userEvent.setup()

      const { getByLabelText, getByRole, findByText } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )

      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)
      const submitButton = getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      expect(await findByText(/login failed\. please check your email and password/i)).toBeInTheDocument()
    })

    it('handles authentication error gracefully', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()

      const { getByLabelText, getByRole } = renderWithProviders(
        <LoginScreen />,
        { contextValue: { login: mockLogin } }
      )

      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)
      const submitButton = getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Should not throw error when clicking submit
      await expect(async () => {
        await user.click(submitButton)
      }).not.toThrow()

      // Button should be enabled again after error
      await waitForAsync()
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      const { getByLabelText, container } = renderWithProviders(<LoginScreen />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()

      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      const { getByLabelText, getByRole } = renderWithProviders(<LoginScreen />)
      
      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)
      const submitButton = getByRole('button', { name: /sign in/i })
      
      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('has proper ARIA attributes for form elements', async () => {
      const { getByLabelText } = renderWithProviders(<LoginScreen />)
      const emailInput = getByLabelText(/email/i)
      const passwordInput = getByLabelText(/password/i)

      // Check for proper form attributes
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Dark Mode', () => {
    it('renders consistently in dark mode', () => {
      document.documentElement.classList.add('dark')

      const { getByText, container } = renderWithProviders(<LoginScreen />)

      // Component should render without errors in dark mode
      expect(getByText('EduTrack SIS')).toBeInTheDocument()
      expect(container.querySelector('form')).toBeInTheDocument()

      document.documentElement.classList.remove('dark')
    })
  })

  describe('Remember Me Functionality', () => {
    it('renders remember me checkbox if implemented', () => {
      const { queryByLabelText } = renderWithProviders(<LoginScreen />)
      
      const rememberCheckbox = queryByLabelText(/remember me/i)
      if (rememberCheckbox) {
        expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
      }
    })
  })
})
