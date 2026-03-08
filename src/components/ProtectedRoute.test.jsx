import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'

let mockIsAuthenticated = false
let mockLoading = false
let mockLocation = { pathname: '/profile' }
let mockNavigateCalls = []

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    loading: mockLoading,
  }),
}))

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }) => {
    mockNavigateCalls.push({ to, state, replace })
    return <div data-testid="navigate">Navigate to {to}</div>
  },
  useLocation: () => mockLocation,
}))

function ProtectedContent() {
  return <div data-testid="protected-content">Protected Content</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockIsAuthenticated = false
    mockLoading = false
    mockLocation = { pathname: '/profile' }
    mockNavigateCalls = []
  })

  it('shows loading state while checking authentication', () => {
    mockLoading = true
    mockIsAuthenticated = false

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockLoading = false
    mockIsAuthenticated = false

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument()
    expect(mockNavigateCalls).toHaveLength(1)
    expect(mockNavigateCalls[0].to).toBe('/login')
    expect(mockNavigateCalls[0].replace).toBe(true)
    expect(mockNavigateCalls[0].state).toEqual({ from: mockLocation })
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders protected content when authenticated', () => {
    mockLoading = false
    mockIsAuthenticated = true

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('preserves location state for redirect after login', () => {
    mockLoading = false
    mockIsAuthenticated = false
    mockLocation = { pathname: '/projects-manager', search: '?tab=settings' }

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(mockNavigateCalls).toHaveLength(1)
    expect(mockNavigateCalls[0].state).toEqual({
      from: { pathname: '/projects-manager', search: '?tab=settings' },
    })
  })

  it('has accessible loading state with aria attributes', () => {
    mockLoading = true

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    const loadingContainer = screen.getByRole('status')
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite')

    const spinner = loadingContainer.querySelector('.spinner')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })

  it('transitions from loading to authenticated state', () => {
    mockLoading = true
    mockIsAuthenticated = false

    const { rerender } = render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()

    mockLoading = false
    mockIsAuthenticated = true

    rerender(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('transitions from loading to redirect state', () => {
    mockLoading = true
    mockIsAuthenticated = false

    const { rerender } = render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()

    mockLoading = false
    mockIsAuthenticated = false

    rerender(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })
})
