import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from './Contact'

vi.mock('../context/ProfileContext', () => ({
  useProfile: () => ({
    profile: {
      email: '',
      location: '',
      socialLinks: { github: '', linkedin: '', twitter: '' },
    },
  }),
}))

describe('Contact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Form Rendering', () => {
    it('should render the contact form with all fields', () => {
      render(<Contact />)

      expect(screen.getByLabelText('Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Email *')).toBeInTheDocument()
      expect(screen.getByLabelText('Message *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('should render the contact header and info section', () => {
      render(<Contact />)

      expect(screen.getByText(/get in touch/i)).toBeInTheDocument()
      expect(screen.getByText(/have a question/i)).toBeInTheDocument()
      expect(screen.getByText(/contact information/i)).toBeInTheDocument()
    })

    it('should have all form fields empty initially', () => {
      render(<Contact />)

      expect(screen.getByLabelText('Name *')).toHaveValue('')
      expect(screen.getByLabelText('Email *')).toHaveValue('')
      expect(screen.getByLabelText('Message *')).toHaveValue('')
    })
  })

  describe('Form Validation - Required Fields', () => {
    it('should show error when submitting empty form', async () => {
      render(<Contact />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })

    it('should show error when only name is provided', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      await userEvent.type(nameInput, 'John Doe')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })

    it('should show error when name field contains only whitespace', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      await userEvent.type(nameInput, '   ')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })
    })

    it('should show error when email field contains only whitespace', async () => {
      render(<Contact />)

      const emailInput = screen.getByLabelText('Email *')
      await userEvent.type(emailInput, '   ')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('should show error when message field contains only whitespace', async () => {
      render(<Contact />)

      const messageInput = screen.getByLabelText('Message *')
      await userEvent.type(messageInput, '   ')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })
  })

  describe('Email Validation', () => {
    it('should show error for invalid email format', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should show error for email without @ symbol', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'invalidemail.com')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should show error for email without domain', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'user@')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should show error for email with spaces', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'user @example.com')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should accept valid email formats', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument()
      })
    })

    it('should accept email with subdomain', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'user@mail.example.co.uk')
      await userEvent.type(messageInput, 'Test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Input Handling', () => {
    it('should update form state when inputs change', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(messageInput).toHaveValue('Test message')
    })

    it('should clear error message when user types in error field', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })

      await userEvent.type(nameInput, 'John')

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
      })
    })

    it('should clear email error when user types in email field', async () => {
      render(<Contact />)

      const emailInput = screen.getByLabelText('Email *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })

      await userEvent.type(emailInput, 'test@')

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })
    })

    it('should clear message error when user types in message field', async () => {
      render(<Contact />)

      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })

      await userEvent.type(messageInput, 'Hello')

      await waitFor(() => {
        expect(screen.queryByText('Message is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://formspree.io/f/YOUR_FORM_ID',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'John Doe',
              email: 'john@example.com',
              message: 'Test message'
            })
          })
        )
      })
    })

    it('should show success message after successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument()
      })
    })

    it('should clear form fields after successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toHaveValue('')
        expect(emailInput).toHaveValue('')
        expect(messageInput).toHaveValue('')
      })
    })

    it('should show error message when submission fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false
      })

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/oops/i)).toBeInTheDocument()
      })
    })

    it('should show error message on fetch error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/oops/i)).toBeInTheDocument()
      })
    })

    it('should disable submit button while submitting', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      )

      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Sending...')

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
        expect(submitButton).toHaveTextContent('Send Message')
      })
    })

    it('should not submit form with validation errors', async () => {
      render(<Contact />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled()
      })
    })

    it('should not allow submission when only name is filled', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled()
      })
    })

    it('should not allow submission with invalid email', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.type(messageInput, 'Test message')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled()
      })
    })
  })

  describe('Form Fields Styling', () => {
    it('should add error class to field with validation error', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toHaveClass('error')
      })
    })

    it('should remove error class when field is valid after typing', async () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText('Name *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toHaveClass('error')
      })

      await userEvent.type(nameInput, 'John')

      await waitFor(() => {
        expect(nameInput).not.toHaveClass('error')
      })
    })

    it('should add error class to email field with invalid format', async () => {
      render(<Contact />)

      const emailInput = screen.getByLabelText('Email *')
      const nameInput = screen.getByLabelText('Name *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'invalid')
      await userEvent.type(messageInput, 'Test')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveClass('error')
      })
    })

    it('should add error class to message field when empty', async () => {
      render(<Contact />)

      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: /send message/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(messageInput).toHaveClass('error')
      })
    })
  })

  describe('Social Links', () => {
    it('should not render social links section when profile has no social links', () => {
      render(<Contact />)

      expect(screen.queryByLabelText('GitHub')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('LinkedIn')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Twitter')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
      expect(screen.queryByText(/connect with me/i)).not.toBeInTheDocument()
    })

    it('should show empty state hint when no contact info is set', () => {
      render(<Contact />)

      expect(screen.getByText(/update your/i)).toBeInTheDocument()
    })
  })
})
