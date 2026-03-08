import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Account } from './Account'
import { AuthContext } from '../context/AuthContext'

const mockNavigate = vi.fn()

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderAccount = (authContextValue = {}) => {
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
        <Account />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('Account', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render account settings page', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Account Settings')).toBeInTheDocument()
  })

  it('should display message when user is not logged in', () => {
    renderAccount({ currentUser: null, isAuthenticated: false })

    expect(screen.getByText('Please log in to view your account settings.')).toBeInTheDocument()
  })

  it('should display user profile information', () => {
    const mockUser = {
      email: 'alice@example.com',
      uid: 'abc123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('abc123')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('should display "Not Verified" badge when email is not verified', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: false,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Not Verified')).toBeInTheDocument()
  })

  it('should display session information', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Session Information')).toBeInTheDocument()
    expect(screen.getByText('Last Login:')).toBeInTheDocument()
    expect(screen.getByText('Account Created:')).toBeInTheDocument()
  })

  it('should display login method', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'google.com' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('should display Email/Password as login method', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Email/Password')).toBeInTheDocument()
  })

  it('should render security section with MFA placeholder', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Multi-Factor Authentication (MFA)')).toBeInTheDocument()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })

  it('should render logout current device button', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    expect(screen.getByText('Logout Current Device')).toBeInTheDocument()
    const logoutButton = screen.getByRole('button', { name: /^Logout$/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('should render logout all devices button', () => {
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    const logoutAllButton = screen.getByRole('button', { name: 'Logout All Devices' })
    expect(logoutAllButton).toBeInTheDocument()
  })

  it('should call signOut and navigate to home when logout button is clicked', async () => {
    const user = userEvent.setup()
    const mockSignOut = vi.fn().mockResolvedValue(undefined)
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOut: mockSignOut })

    const logoutButton = screen.getByRole('button', { name: /^Logout$/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should show confirmation when logout all devices is clicked', async () => {
    const user = userEvent.setup()
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true })

    const logoutAllButton = screen.getByRole('button', { name: 'Logout All Devices' })
    await user.click(logoutAllButton)

    expect(screen.getByRole('button', { name: 'Confirm Logout All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should call signOutAllDevices when confirm is clicked', async () => {
    const user = userEvent.setup()
    const mockSignOutAllDevices = vi.fn().mockResolvedValue(undefined)
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOutAllDevices: mockSignOutAllDevices })

    const logoutAllButton = screen.getByRole('button', { name: 'Logout All Devices' })
    await user.click(logoutAllButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirm Logout All' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockSignOutAllDevices).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should cancel logout all devices when cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockSignOutAllDevices = vi.fn()
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOutAllDevices: mockSignOutAllDevices })

    const logoutAllButton = screen.getByRole('button', { name: 'Logout All Devices' })
    await user.click(logoutAllButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockSignOutAllDevices).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Logout All Devices' })).toBeInTheDocument()
  })

  it('should display error when logout fails', async () => {
    const user = userEvent.setup()
    const mockSignOut = vi.fn().mockRejectedValue(new Error('Logout failed'))
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOut: mockSignOut })

    const logoutButton = screen.getByRole('button', { name: /^Logout$/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to logout. Please try again.')).toBeInTheDocument()
    })
  })

  it('should display error when logout all devices fails', async () => {
    const user = userEvent.setup()
    const mockSignOutAllDevices = vi.fn().mockRejectedValue(new Error('Logout all failed'))
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOutAllDevices: mockSignOutAllDevices })

    const logoutAllButton = screen.getByRole('button', { name: 'Logout All Devices' })
    await user.click(logoutAllButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirm Logout All' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to logout from all devices. Please try again.')).toBeInTheDocument()
    })
  })

  it('should disable buttons during logout', async () => {
    const user = userEvent.setup()
    const mockSignOut = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    const mockUser = {
      email: 'test@example.com',
      uid: 'user123',
      emailVerified: true,
      metadata: {
        lastSignInTime: '2026-03-08T10:00:00Z',
        creationTime: '2026-01-01T10:00:00Z',
      },
      providerData: [{ providerId: 'password' }],
    }

    renderAccount({ currentUser: mockUser, isAuthenticated: true, signOut: mockSignOut })

    const logoutButton = screen.getByRole('button', { name: /^Logout$/i })
    await user.click(logoutButton)

    expect(screen.getByRole('button', { name: 'Logging out...' })).toBeDisabled()
  })
})
