import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, userEvent } from '../../../test/test-utils'
import Button from '../../../../components/Shared/Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { getByRole } = renderWithProviders(<Button>Click me</Button>)
      const button = getByRole('button')
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
      expect(button).toHaveClass('bg-primary-600', 'text-white')
    })

    it('renders with custom className', () => {
      const { getByRole } = renderWithProviders(
        <Button className="custom-class">Test</Button>
      )
      const button = getByRole('button')
      
      expect(button).toHaveClass('custom-class')
    })

    it('renders different variants correctly', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const

      variants.forEach(variant => {
        const { getByText } = renderWithProviders(
          <Button variant={variant}>Test {variant}</Button>
        )
        const button = getByText(`Test ${variant}`)
        expect(button).toBeInTheDocument()

        // Check that variant-specific classes are applied
        if (variant === 'primary') {
          expect(button).toHaveClass('bg-primary-600')
        } else if (variant === 'secondary') {
          expect(button).toHaveClass('bg-secondary-600')
        }
      })
    })

    it('renders different sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach(size => {
        const { getByText } = renderWithProviders(
          <Button size={size}>Test {size}</Button>
        )
        const button = getByText(`Test ${size}`)
        expect(button).toBeInTheDocument()

        // Check that size-specific classes are applied
        if (size === 'sm') {
          expect(button).toHaveClass('px-3', 'py-1.5')
        } else if (size === 'md') {
          expect(button).toHaveClass('px-4', 'py-2')
        }
      })
    })
  })

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      )
      const button = getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Button onClick={handleClick} disabled>Click me</Button>
      )
      const button = getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })

    it('supports keyboard navigation', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      )
      const button = getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      const { getByRole } = renderWithProviders(
        <Button loading>Loading...</Button>
      )
      const button = getByRole('button')

      expect(button).toBeDisabled()

      // Check for loading spinner (should have animate-spin class)
      const spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not show loading spinner when not loading', () => {
      const { getByRole } = renderWithProviders(
        <Button>Not loading</Button>
      )
      const button = getByRole('button')
      
      expect(button).not.toBeDisabled()
      expect(button).not.toHaveAttribute('aria-busy')
      
      const spinner = button.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('works as submit button', () => {
      const handleSubmit = vi.fn(e => e.preventDefault())
      
      const { getByRole } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      const button = getByRole('button')
      
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('works as reset button', () => {
      const { getByRole } = renderWithProviders(
        <form>
          <Button type="reset">Reset</Button>
        </form>
      )
      const button = getByRole('button')
      
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { getByRole } = renderWithProviders(
        <Button aria-label="Custom label">Button</Button>
      )
      const button = getByRole('button')
      
      expect(button).toHaveAttribute('aria-label', 'Custom label')
    })

    it('supports aria-describedby', () => {
      const { getByRole } = renderWithProviders(
        <Button aria-describedby="help-text">Button</Button>
      )
      const button = getByRole('button')
      
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('has proper focus styles', () => {
      const { getByRole } = renderWithProviders(<Button>Focus me</Button>)
      const button = getByRole('button')
      
      // Check that focus styles are applied based on actual implementation
      expect(button).toHaveClass('focus:outline-none', 'focus:shadow-focus')
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode classes correctly', () => {
      // Add dark class to document for testing
      document.documentElement.classList.add('dark')
      
      const { getByRole } = renderWithProviders(<Button>Dark mode</Button>)
      const button = getByRole('button')
      
      // The button should have dark mode classes in its className
      expect(button.className).toContain('dark:')
      
      // Cleanup
      document.documentElement.classList.remove('dark')
    })
  })
})
