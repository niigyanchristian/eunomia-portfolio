import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should render the footer', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should have footer CSS class', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('footer')
  })

  it('should display current year in copyright text', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    const copyrightText = screen.getByText(new RegExp(`${currentYear}`))
    expect(copyrightText).toBeInTheDocument()
  })

  it('should display copyright text with Portfolio', () => {
    render(<Footer />)
    const copyrightText = screen.getByText(/Portfolio/)
    expect(copyrightText).toBeInTheDocument()
  })

  it('should render all social media links', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
    expect(twitterLink).toBeInTheDocument()
  })

  it('should have correct href for GitHub link', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('href', 'https://github.com')
  })

  it('should have correct href for LinkedIn link', () => {
    render(<Footer />)
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com')
  })

  it('should have correct href for Twitter link', () => {
    render(<Footer />)
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com')
  })

  it('should open social links in new tab', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('target', '_blank')
  })

  it('should have rel attribute for security on external links', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have aria-label on social links for accessibility', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })

    expect(githubLink).toHaveAttribute('aria-label', 'GitHub')
    expect(linkedinLink).toHaveAttribute('aria-label', 'LinkedIn')
    expect(twitterLink).toHaveAttribute('aria-label', 'Twitter')
  })

  it('should render footer container with correct class', () => {
    const { container } = render(<Footer />)
    const footerContainer = container.querySelector('.footer-container')
    expect(footerContainer).toBeInTheDocument()
  })

  it('should render footer content with correct class', () => {
    const { container } = render(<Footer />)
    const footerContent = container.querySelector('.footer-content')
    expect(footerContent).toBeInTheDocument()
  })

  it('should render footer social section with correct class', () => {
    const { container } = render(<Footer />)
    const footerSocial = container.querySelector('.footer-social')
    expect(footerSocial).toBeInTheDocument()
  })
})
