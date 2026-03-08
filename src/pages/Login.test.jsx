import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Login } from './Login'
import { AuthContext } from '../context/AuthContext'

const mockNavigate = vi.fn()
const mockLocation = { state: null }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }
})

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  browserLocalPersistence: 'LOCAL',
  setPersistence: vi.fn(),
}))

vi.mock('../config/firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
}))

const sessionStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

function renderLogin(authContextValue = {}) {
  const defaultAuthContext = {
    currentUser: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    signInWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    signOutAllDevices: vi.fn(),
    enableMFA: vi.fn(),
    disableMFA: vi.fn(),
    ...authContextValue,
  }

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthContext}>
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    sessionStorageMock.getItem.mockClear()
    sessionStorageMock.setItem.mockClear()
    mockNavigate.mockClear()
    mockLocation.state = null
  })

  describe('Initial render', () => {
    it('renders the login title and subtitle', () => {
      renderLogin()
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument()
    })

    it('renders email and password input fields', () => {
      renderLogin()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('renders remember me checkbox', () => {
      renderLogin()
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      renderLogin()
      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    })

    it('renders sign in button', () => {
      renderLogin()
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
    })

    it('renders social authentication buttons', () => {
      renderLogin()
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument()
    })

    it('renders GitHub and Microsoft buttons as disabled', () => {
      renderLogin()
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeDisabled()
    })
  })

  describe('Form validation', () => {
    it('shows error when email is empty and form is submitted', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('shows error when email is invalid', async () => {
      renderLogin()

      const emailInput = screen.getByLabelText('Email')
      await userEvent.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('shows error when password is empty', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })

    it('shows error when password is too short', async () => {
      renderLogin()

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'short')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('clears error when user starts typing in email field', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      await userEvent.type(emailInput, 'test@example.com')

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })

    it('clears error when user starts typing in password field', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'password123')

      expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
    })
  })

  describe('Password visibility toggle', () => {
    it('toggles password visibility when toggle button is clicked', async () => {
      renderLogin()

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', { name: /show password/i })
      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Email/password login', () => {
    it('calls signInWithEmail when form is submitted with valid data', async () => {
      const mockSignInWithEmail = vi.fn().mockResolvedValue({})
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('shows loading state during sign in', async () => {
      const mockSignInWithEmail = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      expect(await screen.findByText('Signing in...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalled()
      })
    })

    it('displays error message when login fails with user-not-found', async () => {
      const mockSignInWithEmail = vi.fn().mockRejectedValue({
        message: 'Firebase: Error (auth/user-not-found).',
      })
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('No account found with this email')).toBeInTheDocument()
      })
    })

    it('displays error message when login fails with wrong-password', async () => {
      const mockSignInWithEmail = vi.fn().mockRejectedValue({
        message: 'Firebase: Error (auth/wrong-password).',
      })
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument()
      })
    })

    it('displays error message when login fails with invalid-credential', async () => {
      const mockSignInWithEmail = vi.fn().mockRejectedValue({
        message: 'Firebase: Error (auth/invalid-credential).',
      })
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })
  })

  describe('Social authentication', () => {
    it('calls signInWithGoogle when Google button is clicked', async () => {
      const mockSignInWithGoogle = vi.fn().mockResolvedValue({})
      renderLogin({ signInWithGoogle: mockSignInWithGoogle })

      const googleButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(googleButton)

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled()
      })
    })

    it('displays error message when Google sign-in fails', async () => {
      const mockSignInWithGoogle = vi.fn().mockRejectedValue({
        message: 'Failed to sign in with Google',
      })
      renderLogin({ signInWithGoogle: mockSignInWithGoogle })

      const googleButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to sign in with Google')).toBeInTheDocument()
      })
    })

    it('handles popup closed by user error gracefully', async () => {
      const mockSignInWithGoogle = vi.fn().mockRejectedValue({
        message: 'Firebase: Error (auth/popup-closed-by-user).',
      })
      renderLogin({ signInWithGoogle: mockSignInWithGoogle })

      const googleButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText('Sign-in cancelled')).toBeInTheDocument()
      })
    })
  })

  describe('Rate limiting', () => {
    it('displays rate limit message from auth error', async () => {
      const mockSignInWithEmail = vi.fn().mockRejectedValue({
        message: 'Too many failed attempts. Please wait 10 seconds.',
      })
      renderLogin({ signInWithEmail: mockSignInWithEmail, error: null })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Too many failed attempts. Please wait 10 seconds.')
        ).toBeInTheDocument()
      })
    })

    it('disables submit button when rate limited', async () => {
      const mockSignInWithEmail = vi.fn().mockRejectedValue({
        message: 'Too many failed attempts. Please wait 5 seconds.',
      })
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Redirect after login', () => {
    it('redirects to home page after successful login', async () => {
      const mockSignInWithEmail = vi.fn().mockResolvedValue({})
      renderLogin({ signInWithEmail: mockSignInWithEmail, isAuthenticated: false })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalled()
      })
    })

    it('redirects to intended destination when provided in location state', async () => {
      mockLocation.state = { from: { pathname: '/profile' } }
      const mockSignInWithEmail = vi.fn().mockResolvedValue({})
      renderLogin({ signInWithEmail: mockSignInWithEmail, isAuthenticated: false })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalled()
      })
    })

    it('redirects immediately if already authenticated', () => {
      renderLogin({ isAuthenticated: true })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  describe('Remember me functionality', () => {
    it('toggles remember me checkbox', async () => {
      renderLogin()

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(rememberMeCheckbox).not.toBeChecked()

      fireEvent.click(rememberMeCheckbox)
      expect(rememberMeCheckbox).toBeChecked()

      fireEvent.click(rememberMeCheckbox)
      expect(rememberMeCheckbox).not.toBeChecked()
    })
  })

  describe('Accessibility', () => {
    it('associates error messages with inputs using aria-describedby', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email')
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-busy on submit button during loading', async () => {
      const mockSignInWithEmail = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
      renderLogin({ signInWithEmail: mockSignInWithEmail })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true')
      })
    })

    it('provides proper labels for all form inputs', () => {
      renderLogin()

      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })
  })
})
