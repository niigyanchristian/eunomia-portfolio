import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'
import { AuthContext } from '../context/AuthContext'

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

const renderNavbar = (authContextValue = {}) => {
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
        <Navbar />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  it('should render the navbar', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('should render the logo link with text "Portfolio"', () => {
    renderNavbar()
    const logoLink = screen.getByRole('link', { name: 'Portfolio' })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('should render all navigation links', () => {
    renderNavbar()
    const homeLink = screen.getByRole('link', { name: 'Home' })
    const aboutLink = screen.getByRole('link', { name: 'About' })
    const projectsLink = screen.getByRole('link', { name: 'Projects' })
    const skillsLink = screen.getByRole('link', { name: 'Skills' })
    const contactLink = screen.getByRole('link', { name: 'Contact' })

    expect(homeLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
    expect(projectsLink).toBeInTheDocument()
    expect(skillsLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
  })

  it('should have correct href for Home link', () => {
    renderNavbar()
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should have correct href for About link', () => {
    renderNavbar()
    const aboutLink = screen.getByRole('link', { name: 'About' })
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('should have correct href for Projects link', () => {
    renderNavbar()
    const projectsLink = screen.getByRole('link', { name: 'Projects' })
    expect(projectsLink).toHaveAttribute('href', '/projects')
  })

  it('should have correct href for Skills link', () => {
    renderNavbar()
    const skillsLink = screen.getByRole('link', { name: 'Skills' })
    expect(skillsLink).toHaveAttribute('href', '/skills')
  })

  it('should have correct href for Contact link', () => {
    renderNavbar()
    const contactLink = screen.getByRole('link', { name: 'Contact' })
    expect(contactLink).toHaveAttribute('href', '/contact')
  })

  it('should have the correct CSS class on navbar', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('navbar')
  })

  it('should have navbar-menu class on menu list', () => {
    renderNavbar()
    const menuList = screen.getByRole('list')
    expect(menuList).toHaveClass('navbar-menu')
  })

  it('should have correct number of navigation items when not authenticated', () => {
    renderNavbar({ isAuthenticated: false })
    const menuItems = screen.getAllByRole('listitem')
    expect(menuItems).toHaveLength(8)
  })

  it('should have correct number of navigation items when authenticated', () => {
    renderNavbar({ isAuthenticated: true, currentUser: { email: 'test@example.com' } })
    const menuItems = screen.getAllByRole('listitem')
    expect(menuItems).toHaveLength(8)
  })

  it('should show login link when not authenticated', () => {
    renderNavbar({ isAuthenticated: false })
    const loginLink = screen.getByRole('link', { name: 'Login' })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should not show login link when authenticated', () => {
    renderNavbar({ isAuthenticated: true, currentUser: { email: 'test@example.com' } })
    const loginLink = screen.queryByRole('link', { name: 'Login' })
    expect(loginLink).not.toBeInTheDocument()
  })

  it('should render the hamburger menu button', () => {
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    expect(hamburgerButton).toBeInTheDocument()
    expect(hamburgerButton).toHaveClass('navbar-hamburger')
  })

  it('should have correct aria attributes on hamburger button', () => {
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle mobile menu')
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should toggle mobile menu when hamburger button is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    const menu = screen.getByRole('list')

    expect(menu).not.toHaveClass('navbar-menu-open')
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(hamburgerButton)

    expect(menu).toHaveClass('navbar-menu-open')
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(hamburgerButton)

    expect(menu).not.toHaveClass('navbar-menu-open')
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not render overlay when menu is closed', () => {
    renderNavbar()
    const overlay = document.querySelector('.navbar-overlay')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should render overlay when menu is open', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })

    await user.click(hamburgerButton)

    const overlay = document.querySelector('.navbar-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('navbar-overlay')
  })

  it('should close menu when overlay is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    const menu = screen.getByRole('list')

    await user.click(hamburgerButton)
    expect(menu).toHaveClass('navbar-menu-open')

    const overlay = document.querySelector('.navbar-overlay')
    await user.click(overlay)

    expect(menu).not.toHaveClass('navbar-menu-open')
  })

  it('should close menu when a navigation link is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const hamburgerButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    const menu = screen.getByRole('list')

    await user.click(hamburgerButton)
    expect(menu).toHaveClass('navbar-menu-open')

    const homeLink = screen.getByRole('link', { name: 'Home' })
    await user.click(homeLink)

    expect(menu).not.toHaveClass('navbar-menu-open')
  })

  it('should render three hamburger lines', () => {
    renderNavbar()
    const hamburgerLines = document.querySelectorAll('.hamburger-line')
    expect(hamburgerLines).toHaveLength(3)
  })

  it('should show user menu when authenticated', () => {
    const mockUser = { email: 'test@example.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })
    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    expect(userButton).toBeInTheDocument()
  })

  it('should not show user menu when not authenticated', () => {
    renderNavbar({ isAuthenticated: false })
    const userButton = document.querySelector('.navbar-user-button')
    expect(userButton).not.toBeInTheDocument()
  })

  it('should display user email in navbar', () => {
    const mockUser = { email: 'user@test.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })
    expect(screen.getByText('user@test.com')).toBeInTheDocument()
  })

  it('should display first letter of email as avatar', () => {
    const mockUser = { email: 'alice@example.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('should toggle dropdown menu when user button is clicked', async () => {
    const user = userEvent.setup()
    const mockUser = { email: 'test@example.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })

    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    expect(userButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(userButton)

    expect(userButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should show dropdown with account settings and logout options', async () => {
    const user = userEvent.setup()
    const mockUser = { email: 'test@example.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })

    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    await user.click(userButton)

    const accountLink = screen.getByRole('link', { name: 'Account Settings' })
    const logoutButton = screen.getByRole('button', { name: 'Logout' })

    expect(accountLink).toBeInTheDocument()
    expect(accountLink).toHaveAttribute('href', '/account')
    expect(logoutButton).toBeInTheDocument()
  })

  it('should call signOut and navigate to home when logout is clicked', async () => {
    const user = userEvent.setup()
    const mockSignOut = vi.fn().mockResolvedValue(undefined)
    const mockUser = { email: 'test@example.com' }

    renderNavbar({ isAuthenticated: true, currentUser: mockUser, signOut: mockSignOut })

    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    await user.click(userButton)

    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    await user.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('should close dropdown when account settings link is clicked', async () => {
    const user = userEvent.setup()
    const mockUser = { email: 'test@example.com' }
    renderNavbar({ isAuthenticated: true, currentUser: mockUser })

    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    await user.click(userButton)

    expect(screen.getByText('Account Settings')).toBeInTheDocument()

    const accountLink = screen.getByRole('link', { name: 'Account Settings' })
    await user.click(accountLink)

    await vi.waitFor(() => {
      expect(userButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('should handle signOut error gracefully', async () => {
    const user = userEvent.setup()
    const mockSignOut = vi.fn().mockRejectedValue(new Error('Sign out failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockUser = { email: 'test@example.com' }

    renderNavbar({ isAuthenticated: true, currentUser: mockUser, signOut: mockSignOut })

    const userButton = screen.getAllByRole('button').find(btn => btn.classList.contains('navbar-user-button'))
    await user.click(userButton)

    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    await user.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})
