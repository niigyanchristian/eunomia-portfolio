import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should render the App component', () => {
    render(<App />)
    const appDiv = screen.getByRole('main')
    expect(appDiv).toBeInTheDocument()
  })

  it('should render Navbar component', () => {
    render(<App />)
    const navbar = screen.getByRole('navigation')
    expect(navbar).toBeInTheDocument()
  })

  it('should render Footer component', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should have main-content class on main element', () => {
    render(<App />)
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveClass('main-content')
  })

  it('should have App class on root div', () => {
    const { container } = render(<App />)
    const appDiv = container.querySelector('.App')
    expect(appDiv).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<App />)
    const portfolioLogo = screen.getByRole('link', { name: 'Portfolio' })
    const homeLink = screen.getByRole('link', { name: /^Home$/ })
    const aboutLink = screen.getByRole('link', { name: /^About$/ })
    const projectsLink = screen.getByRole('link', { name: /^Projects$/ })
    const skillsLink = screen.getByRole('link', { name: /^Skills$/ })
    const contactLink = screen.getByRole('link', { name: /^Contact$/ })

    expect(portfolioLogo).toBeInTheDocument()
    expect(homeLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
    expect(projectsLink).toBeInTheDocument()
    expect(skillsLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
  })

  it('should have correct href values for navigation links', () => {
    render(<App />)
    const homeLink = screen.getByRole('link', { name: /^Home$/ })
    const aboutLink = screen.getByRole('link', { name: /^About$/ })
    const projectsLink = screen.getByRole('link', { name: /^Projects$/ })
    const skillsLink = screen.getByRole('link', { name: /^Skills$/ })
    const contactLink = screen.getByRole('link', { name: /^Contact$/ })

    expect(homeLink).toHaveAttribute('href', '/')
    expect(aboutLink).toHaveAttribute('href', '/about')
    expect(projectsLink).toHaveAttribute('href', '/projects')
    expect(skillsLink).toHaveAttribute('href', '/skills')
    expect(contactLink).toHaveAttribute('href', '/contact')
  })

  it('should render footer with social links', () => {
    render(<App />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
    expect(twitterLink).toBeInTheDocument()
  })

  it('should render Home page by default', () => {
    render(<App />)
    const homeHeading = screen.getByRole('heading', { name: /John Doe/i })
    expect(homeHeading).toBeInTheDocument()
  })

  it('should maintain proper layout structure', () => {
    const { container } = render(<App />)
    const app = container.querySelector('.App')
    const navbar = container.querySelector('.navbar')
    const mainContent = container.querySelector('.main-content')
    const footer = container.querySelector('.footer')

    expect(app).toBeInTheDocument()
    expect(navbar).toBeInTheDocument()
    expect(mainContent).toBeInTheDocument()
    expect(footer).toBeInTheDocument()

    const navbarIndex = Array.from(app.children).indexOf(navbar)
    const mainContentIndex = Array.from(app.children).indexOf(mainContent)
    const footerIndex = Array.from(app.children).indexOf(footer)

    expect(navbarIndex).toBeLessThan(mainContentIndex)
    expect(mainContentIndex).toBeLessThan(footerIndex)
  })
})

describe('App - Accessibility Features', () => {
  it('should have semantic HTML structure with proper landmarks', () => {
    const { container } = render(<App />)

    const nav = container.querySelector('nav')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')

    expect(nav).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })

  it('should have main element with proper id for skip links', () => {
    render(<App />)
    const mainContent = screen.getByRole('main')

    expect(mainContent).toHaveAttribute('id', 'main-content')
  })

  it('should have proper ARIA labels on footer social links', () => {
    render(<App />)

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toHaveAttribute('aria-label', 'GitHub')
    expect(linkedinLink).toHaveAttribute('aria-label', 'LinkedIn')
    expect(twitterLink).toHaveAttribute('aria-label', 'Twitter')
  })

  it('should have external link attributes on footer social links', () => {
    render(<App />)

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('target', '_blank')

    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have proper navigation role', () => {
    render(<App />)
    const nav = screen.getByRole('navigation')

    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('navbar')
  })

  it('should have proper contentinfo role for footer', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')

    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('footer')
  })

  it('should have heading hierarchy on home page', () => {
    render(<App />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent(/John Doe/i)
  })

  it('should use semantic list structure for navigation', () => {
    const { container } = render(<App />)

    const navList = container.querySelector('.navbar-menu')
    expect(navList).toHaveClass('navbar-menu')

    const navItems = container.querySelectorAll('.navbar-item')
    expect(navItems.length).toBeGreaterThan(0)

    navItems.forEach(item => {
      const link = item.querySelector('a')
      expect(link).toBeInTheDocument()
    })
  })

  it('should have accessible link text in navigation', () => {
    render(<App />)

    const navLinks = [
      screen.getByRole('link', { name: 'Portfolio' }),
      screen.getByRole('link', { name: /^Home$/ }),
      screen.getByRole('link', { name: /^About$/ }),
      screen.getByRole('link', { name: /^Projects$/ }),
      screen.getByRole('link', { name: /^Skills$/ }),
      screen.getByRole('link', { name: /^Contact$/ }),
    ]

    navLinks.forEach(link => {
      expect(link.textContent).toBeTruthy()
      expect(link).toHaveAttribute('href')
    })
  })
})

describe('App - Responsive Behavior', () => {
  let originalInnerWidth

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    vi.resetModules()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('should render with desktop viewport width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })

    const { container } = render(<App />)
    const app = container.querySelector('.App')

    expect(app).toBeInTheDocument()
    expect(app).toHaveClass('App')
  })

  it('should render with tablet viewport width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { container } = render(<App />)
    const app = container.querySelector('.App')

    expect(app).toBeInTheDocument()
    expect(app).toHaveClass('App')
  })

  it('should render with mobile viewport width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    })

    const { container } = render(<App />)
    const app = container.querySelector('.App')

    expect(app).toBeInTheDocument()
    expect(app).toHaveClass('App')
  })

  it('should have root App element that fills viewport', () => {
    render(<App />)
    const app = screen.getByRole('main').closest('.App')

    expect(app).toBeInTheDocument()
    expect(app).toHaveClass('App')
  })

  it('should use proper class structure for responsive layout', () => {
    const { container } = render(<App />)
    const app = container.querySelector('.App')

    expect(app).toHaveClass('App')
    expect(app.children.length).toBeGreaterThan(0)
  })

  it('should have main content area with proper class', () => {
    const { container } = render(<App />)
    const mainContent = container.querySelector('.main-content')

    expect(mainContent).toBeInTheDocument()
    expect(mainContent).toHaveClass('main-content')
  })

  it('should be accessible at various viewport widths', () => {
    const viewports = [
      { width: 320, name: 'mobile' },
      { width: 768, name: 'tablet' },
      { width: 1024, name: 'desktop' },
      { width: 1440, name: 'large desktop' },
    ]

    viewports.forEach(({ width }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      })

      const { container } = render(<App />)

      const nav = container.querySelector('nav')
      const main = container.querySelector('main')
      const footer = container.querySelector('footer')

      expect(nav).toBeInTheDocument()
      expect(main).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })
  })

  it('should maintain responsive layout with navbar container', () => {
    const { container } = render(<App />)
    const navbarContainer = container.querySelector('.navbar-container')

    expect(navbarContainer).toBeInTheDocument()
    expect(navbarContainer).toHaveClass('navbar-container')
  })

  it('should render navbar with proper structure for responsive design', () => {
    const { container } = render(<App />)
    const navbar = container.querySelector('.navbar')

    expect(navbar).toBeInTheDocument()
    expect(navbar).toHaveClass('navbar')
  })

  it('should have responsive footer layout', () => {
    const { container } = render(<App />)
    const footer = container.querySelector('.footer')

    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('footer')
  })
})

describe('App - Semantic HTML Validation', () => {
  it('should use nav element for navigation', () => {
    const { container } = render(<App />)
    const nav = container.querySelector('nav')

    expect(nav).toBeInTheDocument()
    expect(nav.tagName).toBe('NAV')
  })

  it('should use main element for main content', () => {
    const { container } = render(<App />)
    const main = container.querySelector('main')

    expect(main).toBeInTheDocument()
    expect(main.tagName).toBe('MAIN')
  })

  it('should use footer element for page footer', () => {
    const { container } = render(<App />)
    const footer = container.querySelector('footer')

    expect(footer).toBeInTheDocument()
    expect(footer.tagName).toBe('FOOTER')
  })

  it('should have properly nested semantic structure', () => {
    const { container } = render(<App />)
    const app = container.querySelector('.App')

    const children = Array.from(app.children)
    const navIndex = children.findIndex(child => child.tagName === 'NAV')
    const mainIndex = children.findIndex(child => child.tagName === 'MAIN')
    const footerIndex = children.findIndex(child => child.tagName === 'FOOTER')

    expect(navIndex).toBeGreaterThanOrEqual(0)
    expect(mainIndex).toBeGreaterThanOrEqual(0)
    expect(footerIndex).toBeGreaterThanOrEqual(0)

    expect(navIndex).toBeLessThan(mainIndex)
    expect(mainIndex).toBeLessThan(footerIndex)
  })

  it('should use ul/li elements in navigation menu', () => {
    const { container } = render(<App />)

    const navList = container.querySelector('.navbar-menu')
    expect(navList.tagName).toBe('UL')

    const navItems = container.querySelectorAll('.navbar-item')
    navItems.forEach(item => {
      expect(item.tagName).toBe('LI')
    })
  })

  it('should contain accessible links with href attributes', () => {
    render(<App />)

    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
      expect(link.textContent.trim()).toBeTruthy()
    })
  })

  it('should have appropriate page structure for screen readers', () => {
    const { container } = render(<App />)

    const nav = container.querySelector('nav')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')

    expect(nav.parentElement).toEqual(main.parentElement)
    expect(footer.parentElement).toEqual(main.parentElement)
  })
})
