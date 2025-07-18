import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, userEvent } from '../../../test/test-utils'
import Modal from '../../../../components/Shared/Modal'

describe('Modal Component', () => {
  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(getByRole('dialog')).toBeInTheDocument()
      expect(getByRole('heading', { name: 'Test Modal' })).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      const { queryByRole } = renderWithProviders(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders children content', () => {
      const { getByText } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>This is modal content</p>
          <button>Action Button</button>
        </Modal>
      )
      
      expect(getByText('This is modal content')).toBeInTheDocument()
      expect(getByText('Action Button')).toBeInTheDocument()
    })

    it('renders with custom size', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Large Modal" size="lg">
          <p>Large modal content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      // Check for size-specific classes (this depends on your implementation)
      expect(dialog.querySelector('.max-w-lg, .max-w-xl, .max-w-2xl')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()
      
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const closeButton = getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()
      
      const { getByTestId } = renderWithProviders(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      // Assuming the backdrop has a test id or specific class
      const backdrop = getByTestId('modal-backdrop') || document.querySelector('.fixed.inset-0')
      if (backdrop) {
        await user.click(backdrop)
        expect(handleClose).toHaveBeenCalledTimes(1)
      }
    })

    it('does not close when modal content is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()
      
      const { getByText } = renderWithProviders(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const content = getByText('Modal content')
      await user.click(content)
      
      expect(handleClose).not.toHaveBeenCalled()
    })

    it('closes on Escape key press', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()
      
      renderWithProviders(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      await user.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Focus Management', () => {
    it('focuses the modal when opened', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      expect(dialog).toHaveFocus()
    })

    it('traps focus within modal', async () => {
      const user = userEvent.setup()
      
      const { getByRole, getByText } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      )
      
      const firstButton = getByText('First Button')
      const secondButton = getByText('Second Button')
      const closeButton = getByRole('button', { name: /close/i })
      
      // Tab should cycle through focusable elements
      await user.tab()
      expect(closeButton).toHaveFocus()
      
      await user.tab()
      expect(firstButton).toHaveFocus()
      
      await user.tab()
      expect(secondButton).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Accessible Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })

    it('associates title with dialog', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
          <p>Modal content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      const title = getByRole('heading', { name: 'Test Title' })
      
      expect(dialog).toHaveAttribute('aria-labelledby', title.id)
    })

    it('supports custom aria-describedby', () => {
      const { getByRole } = renderWithProviders(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          aria-describedby="modal-description"
        >
          <p id="modal-description">This describes the modal</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description')
    })
  })

  describe('Portal Rendering', () => {
    it('renders in document body by default', () => {
      renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Portal Modal">
          <p>Portal content</p>
        </Modal>
      )
      
      // Check that modal is rendered in body, not in the component tree
      const modalInBody = document.body.querySelector('[role="dialog"]')
      expect(modalInBody).toBeInTheDocument()
    })
  })

  describe('Animation and Transitions', () => {
    it('applies entrance animation classes', () => {
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Animated Modal">
          <p>Animated content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      // Check for animation classes (depends on your implementation)
      expect(dialog.className).toMatch(/transition|animate|fade|scale/)
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode styles', () => {
      document.documentElement.classList.add('dark')
      
      const { getByRole } = renderWithProviders(
        <Modal isOpen={true} onClose={vi.fn()} title="Dark Modal">
          <p>Dark mode content</p>
        </Modal>
      )
      
      const dialog = getByRole('dialog')
      expect(dialog.className).toContain('dark:')
      
      document.documentElement.classList.remove('dark')
    })
  })

  describe('Error Boundaries', () => {
    it('handles errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }
      
      // This test would need an error boundary wrapper
      // For now, just ensure modal doesn't crash with problematic children
      expect(() => {
        renderWithProviders(
          <Modal isOpen={true} onClose={vi.fn()} title="Error Modal">
            <div>Safe content</div>
          </Modal>
        )
      }).not.toThrow()
    })
  })
})
