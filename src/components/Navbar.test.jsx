import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
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

  it('should have correct number of navigation items', () => {
    renderNavbar()
    const menuItems = screen.getAllByRole('listitem')
    expect(menuItems).toHaveLength(5)
  })
})
