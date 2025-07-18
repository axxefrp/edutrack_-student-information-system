import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, userEvent } from '../../../test/test-utils'
import Toast from '../../../../components/Shared/Toast'
import { ToastNotification } from '../../../types'

describe('Toast Component', () => {
  const mockNotification: ToastNotification = {
    id: 'test-toast-1',
    title: 'Test Title',
    message: 'Test message content',
    type: 'success',
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders with all notification data', () => {
      const { getByText } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={vi.fn()} />
      )
      
      expect(getByText('Test Title')).toBeInTheDocument()
      expect(getByText('Test message content')).toBeInTheDocument()
    })

    it('renders different toast types with appropriate styling', () => {
      const types: Array<ToastNotification['type']> = ['success', 'error', 'warning', 'info']
      
      types.forEach(type => {
        const notification = { ...mockNotification, type }
        const { getByRole } = renderWithProviders(
          <Toast notification={notification} onRemove={vi.fn()} />
        )
        
        const toast = getByRole('alert')
        expect(toast).toBeInTheDocument()
        
        // Check for type-specific styling classes
        if (type === 'success') {
          expect(toast.className).toMatch(/green|success/)
        } else if (type === 'error') {
          expect(toast.className).toMatch(/red|error/)
        } else if (type === 'warning') {
          expect(toast.className).toMatch(/yellow|warning/)
        } else if (type === 'info') {
          expect(toast.className).toMatch(/blue|info/)
        }
      })
    })

    it('renders without title when not provided', () => {
      const notificationWithoutTitle = {
        ...mockNotification,
        title: undefined,
      }
      
      const { getByText, queryByRole } = renderWithProviders(
        <Toast notification={notificationWithoutTitle} onRemove={vi.fn()} />
      )
      
      expect(getByText('Test message content')).toBeInTheDocument()
      expect(queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onRemove when close button is clicked', async () => {
      const handleRemove = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={handleRemove} />
      )
      
      const closeButton = getByRole('button', { name: /close|dismiss/i })
      await user.click(closeButton)
      
      expect(handleRemove).toHaveBeenCalledWith(mockNotification.id)
    })

    it('auto-removes after timeout', () => {
      const handleRemove = vi.fn()
      
      renderWithProviders(
        <Toast notification={mockNotification} onRemove={handleRemove} />
      )
      
      // Fast-forward time to trigger auto-removal
      vi.advanceTimersByTime(5000) // Assuming 5 second timeout
      
      expect(handleRemove).toHaveBeenCalledWith(mockNotification.id)
    })

    it('does not auto-remove when hovered', async () => {
      const handleRemove = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={handleRemove} />
      )
      
      const toast = getByRole('alert')
      
      // Hover over toast
      await user.hover(toast)
      
      // Fast-forward time
      vi.advanceTimersByTime(5000)
      
      // Should not be removed while hovered
      expect(handleRemove).not.toHaveBeenCalled()
      
      // Unhover
      await user.unhover(toast)
      
      // Now it should be removed after timeout
      vi.advanceTimersByTime(5000)
      expect(handleRemove).toHaveBeenCalledWith(mockNotification.id)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={vi.fn()} />
      )
      
      const toast = getByRole('alert')
      expect(toast).toHaveAttribute('aria-live', 'polite')
    })

    it('has proper role for different types', () => {
      const errorNotification = { ...mockNotification, type: 'error' as const }
      
      const { getByRole } = renderWithProviders(
        <Toast notification={errorNotification} onRemove={vi.fn()} />
      )
      
      // Error toasts might have role="alert" with aria-live="assertive"
      const toast = getByRole('alert')
      expect(toast).toBeInTheDocument()
    })

    it('close button has proper accessibility attributes', () => {
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={vi.fn()} />
      )
      
      const closeButton = getByRole('button', { name: /close|dismiss/i })
      expect(closeButton).toHaveAttribute('aria-label')
    })
  })

  describe('Animation', () => {
    it('applies entrance animation classes', () => {
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={vi.fn()} />
      )
      
      const toast = getByRole('alert')
      // Check for animation classes
      expect(toast.className).toMatch(/transition|animate|slide|fade/)
    })
  })

  describe('Icons', () => {
    it('displays appropriate icon for each type', () => {
      const types: Array<ToastNotification['type']> = ['success', 'error', 'warning', 'info']
      
      types.forEach(type => {
        const notification = { ...mockNotification, type }
        const { getByRole } = renderWithProviders(
          <Toast notification={notification} onRemove={vi.fn()} />
        )
        
        const toast = getByRole('alert')
        // Check for icon presence (this depends on your implementation)
        const icon = toast.querySelector('svg')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode styles', () => {
      document.documentElement.classList.add('dark')
      
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={vi.fn()} />
      )
      
      const toast = getByRole('alert')
      expect(toast.className).toContain('dark:')
      
      document.documentElement.classList.remove('dark')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long messages gracefully', () => {
      const longMessage = 'A'.repeat(500)
      const longNotification = {
        ...mockNotification,
        message: longMessage,
      }
      
      const { getByText } = renderWithProviders(
        <Toast notification={longNotification} onRemove={vi.fn()} />
      )
      
      expect(getByText(longMessage)).toBeInTheDocument()
    })

    it('handles missing message gracefully', () => {
      const notificationWithoutMessage = {
        ...mockNotification,
        message: '',
      }
      
      expect(() => {
        renderWithProviders(
          <Toast notification={notificationWithoutMessage} onRemove={vi.fn()} />
        )
      }).not.toThrow()
    })

    it('handles rapid removal calls', async () => {
      const handleRemove = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Toast notification={mockNotification} onRemove={handleRemove} />
      )
      
      const closeButton = getByRole('button', { name: /close|dismiss/i })
      
      // Click multiple times rapidly
      await user.click(closeButton)
      await user.click(closeButton)
      await user.click(closeButton)
      
      // Should only be called once
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })
  })
})
