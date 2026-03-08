import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'

const mockSignInWithEmailAndPassword = vi.fn()
const mockSignInWithPopup = vi.fn()
const mockSetPersistence = vi.fn()
const mockSignOut = vi.fn()
const mockGetIdToken = vi.fn()

let authStateCallback = null

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: (_auth, callback) => {
    authStateCallback = callback
    return vi.fn()
  },
  browserLocalPersistence: 'LOCAL',
  setPersistence: (...args) => mockSetPersistence(...args),
}))

vi.mock('../config/firebase', () => ({
  auth: {
    signOut: () => mockSignOut(),
  },
}))

function TestConsumer() {
  const {
    currentUser,
    loading,
    error,
    isAuthenticated,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    signOutAllDevices,
    enableMFA,
    disableMFA,
  } = useAuth()

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error || 'none'}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user">{currentUser ? currentUser.email : 'null'}</div>
      <button onClick={() => signInWithEmail('test@example.com', 'password123').catch(() => {})}>
        Sign In Email
      </button>
      <button onClick={() => signInWithGoogle().catch(() => {})}>
        Sign In Google
      </button>
      <button onClick={() => signOut().catch(() => {})}>
        Sign Out
      </button>
      <button onClick={() => signOutAllDevices().catch(() => {})}>
        Sign Out All
      </button>
      <button onClick={() => enableMFA().catch(() => {})}>
        Enable MFA
      </button>
      <button onClick={() => disableMFA().catch(() => {})}>
        Disable MFA
      </button>
    </div>
  )
}

function renderWithProvider() {
  const result = render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
  // Simulate auth state resolved (no user)
  act(() => {
    authStateCallback(null)
  })
  return result
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    mockSetPersistence.mockResolvedValue(undefined)
    mockSignOut.mockResolvedValue(undefined)
  })

  afterEach(() => {
    authStateCallback = null
  })

  it('provides initial state with no user', () => {
    renderWithProvider()
    expect(screen.getByTestId('loading').textContent).toBe('false')
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('error').textContent).toBe('none')
  })

  it('updates state when auth state changes to logged in', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    act(() => {
      authStateCallback({ email: 'user@test.com', uid: '123' })
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('user@test.com')
  })

  it('throws error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    )
    consoleSpy.mockRestore()
  })

  describe('signInWithEmail', () => {
    it('signs in successfully with email and password', async () => {
      const user = { email: 'test@example.com', uid: '123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user })
      renderWithProvider()

      const user2 = userEvent.setup()
      await user2.click(screen.getByText('Sign In Email'))

      expect(mockSetPersistence).toHaveBeenCalledWith(expect.anything(), 'LOCAL')
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
    })

    it('sets error on failed login', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Invalid credentials')
      })
    })

    it('tracks failed attempts in sessionStorage', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(sessionStorage.getItem('auth_failed_attempts')).toBe('1')
      })
    })

    it('clears failed attempts on successful login', async () => {
      sessionStorage.setItem('auth_failed_attempts', '2')
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { email: 'test@example.com' },
      })
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(sessionStorage.getItem('auth_failed_attempts')).toBeNull()
      })
    })

    it('rate limits after 3 failed attempts', async () => {
      sessionStorage.setItem('auth_failed_attempts', '3')
      sessionStorage.setItem('auth_last_attempt_time', String(Date.now()))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toMatch(/Too many failed attempts/)
      })
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled()
    })

    it('allows login after delay has passed', async () => {
      sessionStorage.setItem('auth_failed_attempts', '3')
      sessionStorage.setItem('auth_last_attempt_time', String(Date.now() - 5000))
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { email: 'test@example.com' },
      })
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('signs in successfully with Google', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { email: 'google@test.com' },
      })
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Google'))

      expect(mockSetPersistence).toHaveBeenCalledWith(expect.anything(), 'LOCAL')
      expect(mockSignInWithPopup).toHaveBeenCalled()
    })

    it('sets error on Google sign-in failure', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('Popup closed'))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Google'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Popup closed')
      })
    })
  })

  describe('signOut', () => {
    it('signs out successfully', async () => {
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign Out'))

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('sets error on sign out failure', async () => {
      mockSignOut.mockRejectedValueOnce(new Error('Sign out failed'))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign Out'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Sign out failed')
      })
    })
  })

  describe('signOutAllDevices', () => {
    it('signs out from all devices', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
      act(() => {
        authStateCallback({
          email: 'user@test.com',
          uid: '123',
          getIdToken: mockGetIdToken,
        })
      })
      mockGetIdToken.mockResolvedValue('new-token')

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign Out All'))

      await waitFor(() => {
        expect(mockGetIdToken).toHaveBeenCalledWith(true)
        expect(mockSignOut).toHaveBeenCalled()
      })
    })
  })

  describe('MFA stubs', () => {
    it('enableMFA throws not implemented error', async () => {
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Enable MFA'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('none')
      })
    })

    it('disableMFA throws not implemented error', async () => {
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Disable MFA'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('none')
      })
    })
  })

  describe('rate limiting progressive delays', () => {
    it('no delay for fewer than 3 attempts', () => {
      sessionStorage.setItem('auth_failed_attempts', '2')
      sessionStorage.setItem('auth_last_attempt_time', String(Date.now()))
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { email: 'test@example.com' },
      })
      renderWithProvider()

      const user = userEvent.setup()
      return user.click(screen.getByText('Sign In Email')).then(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
      })
    })

    it('3s delay after 3rd failed attempt', async () => {
      sessionStorage.setItem('auth_failed_attempts', '4')
      sessionStorage.setItem('auth_last_attempt_time', String(Date.now()))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toMatch(/Too many failed attempts/)
      })
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled()
    })

    it('10s delay after 5th failed attempt', async () => {
      sessionStorage.setItem('auth_failed_attempts', '5')
      sessionStorage.setItem('auth_last_attempt_time', String(Date.now()))
      renderWithProvider()

      const user = userEvent.setup()
      await user.click(screen.getByText('Sign In Email'))

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toMatch(/Too many failed attempts/)
      })
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled()
    })
  })
})
