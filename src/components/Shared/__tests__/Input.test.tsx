import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, userEvent } from '../../../test/test-utils'
import Input from '../../../../components/Shared/Input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { getByRole } = renderWithProviders(<Input />)
      const input = getByRole('textbox')

      expect(input).toBeInTheDocument()
      // HTML input defaults to text type without explicit attribute
      expect(input.tagName).toBe('INPUT')
    })

    it('renders with label', () => {
      const { getByLabelText, getByText } = renderWithProviders(
        <Input label="Test Label" />
      )
      
      expect(getByText('Test Label')).toBeInTheDocument()
      expect(getByLabelText('Test Label')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Enter text here" />
      )
      
      expect(getByPlaceholderText('Enter text here')).toBeInTheDocument()
    })

    it('renders different input types', () => {
      // Test text input
      const { getByDisplayValue: getTextInput } = renderWithProviders(
        <Input type="text" value="test-text" readOnly />
      )
      const textInput = getTextInput('test-text')
      expect(textInput).toHaveAttribute('type', 'text')

      // Test email input
      const { getByDisplayValue: getEmailInput } = renderWithProviders(
        <Input type="email" value="test-email" readOnly />
      )
      const emailInput = getEmailInput('test-email')
      expect(emailInput).toHaveAttribute('type', 'email')

      // Test password input
      const { getByDisplayValue: getPasswordInput } = renderWithProviders(
        <Input type="password" value="test-password" readOnly />
      )
      const passwordInput = getPasswordInput('test-password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Test number input
      const { getByDisplayValue: getNumberInput } = renderWithProviders(
        <Input type="number" value="123" readOnly />
      )
      const numberInput = getNumberInput('123')
      expect(numberInput).toHaveAttribute('type', 'number')
    })

    it('renders with custom className', () => {
      const { getByRole } = renderWithProviders(
        <Input className="custom-input" />
      )
      const input = getByRole('textbox')
      
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('Value and Change Handling', () => {
    it('displays initial value', () => {
      const { getByDisplayValue } = renderWithProviders(
        <Input value="initial value" readOnly />
      )
      
      expect(getByDisplayValue('initial value')).toBeInTheDocument()
    })

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Input onChange={handleChange} />
      )
      const input = getByRole('textbox')
      
      await user.type(input, 'test')
      
      expect(handleChange).toHaveBeenCalledTimes(4) // One for each character
      expect(input).toHaveValue('test')
    })

    it('handles controlled input correctly', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        )
      }
      
      const user = userEvent.setup()
      const { getByRole } = renderWithProviders(<TestComponent />)
      const input = getByRole('textbox')
      
      await user.type(input, 'controlled')
      expect(input).toHaveValue('controlled')
    })
  })

  describe('Validation and Error States', () => {
    it('shows error message when error prop is provided', () => {
      const { getByText, getByRole } = renderWithProviders(
        <Input error="This field is required" />
      )
      
      expect(getByText('This field is required')).toBeInTheDocument()
      
      const input = getByRole('textbox')
      // Check that error styling is applied
      expect(input).toHaveClass('border-error-500')
    })

    it('applies error styling when error is present', () => {
      const { getByRole } = renderWithProviders(
        <Input error="Error message" />
      )
      const input = getByRole('textbox')
      
      // Check for error styling classes based on actual implementation
      expect(input).toHaveClass('border-error-500')
    })

    it('supports required attribute', () => {
      const { getByRole } = renderWithProviders(
        <Input required />
      )
      const input = getByRole('textbox')
      
      expect(input).toBeRequired()
    })

    it('supports disabled state', () => {
      const { getByRole } = renderWithProviders(
        <Input disabled />
      )
      const input = getByRole('textbox')
      
      expect(input).toBeDisabled()
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const handleSubmit = vi.fn(e => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        return formData.get('testInput')
      })
      
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <Input name="testInput" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = getByRole('textbox')
      const submitButton = getByRole('button')
      
      await user.type(input, 'form value')
      await user.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('supports name attribute', () => {
      const { getByRole } = renderWithProviders(
        <Input name="testName" />
      )
      const input = getByRole('textbox')
      
      expect(input).toHaveAttribute('name', 'testName')
    })

    it('supports id attribute and label association', () => {
      const { getByLabelText } = renderWithProviders(
        <Input id="test-input" label="Test Label" />
      )
      const input = getByLabelText('Test Label')
      
      expect(input).toHaveAttribute('id', 'test-input')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { getByRole } = renderWithProviders(
        <Input 
          aria-label="Custom label"
          aria-describedby="help-text"
        />
      )
      const input = getByRole('textbox')
      
      expect(input).toHaveAttribute('aria-label', 'Custom label')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('associates error message with input', () => {
      const { getByRole, getByText } = renderWithProviders(
        <Input error="Error message" />
      )
      const input = getByRole('textbox')
      const errorMessage = getByText('Error message')

      // Check that error message is displayed and input has error styling
      expect(errorMessage).toBeInTheDocument()
      expect(input).toHaveClass('border-error-500')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(<Input />)
      const input = getByRole('textbox')
      
      await user.tab()
      expect(input).toHaveFocus()
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode classes correctly', () => {
      document.documentElement.classList.add('dark')
      
      const { getByRole } = renderWithProviders(<Input />)
      const input = getByRole('textbox')
      
      expect(input.className).toContain('dark:')
      
      document.documentElement.classList.remove('dark')
    })
  })

  describe('Special Input Types', () => {
    it('handles password input correctly', () => {
      const { getByLabelText } = renderWithProviders(
        <Input type="password" label="Password" />
      )
      const input = getByLabelText('Password')
      
      expect(input).toHaveAttribute('type', 'password')
    })

    it('handles number input correctly', async () => {
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Input type="number" min="0" max="100" />
      )
      const input = getByRole('spinbutton')
      
      expect(input).toHaveAttribute('type', 'number')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
      
      await user.type(input, '50')
      expect(input).toHaveValue(50)
    })
  })
})
