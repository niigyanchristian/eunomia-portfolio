import { describe, it, expect } from 'vitest'
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
    const homeHeading = screen.getByRole('heading', { name: /Welcome to My Portfolio/i })
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
