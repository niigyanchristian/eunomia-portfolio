import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// eslint-disable-next-line no-unused-vars
import { BrowserRouter } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { Home } from '../pages/Home'

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  )
}

describe('Home', () => {
  it('should render the home section', () => {
    const { container } = renderHome()
    const homeSection = container.querySelector('section.home')
    expect(homeSection).toBeInTheDocument()
    expect(homeSection).toHaveClass('home')
  })

  it('should render the hero title "John Doe"', () => {
    renderHome()
    const title = screen.getByRole('heading', { level: 1, name: 'John Doe' })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('hero-title')
  })

  it('should render the hero subtitle', () => {
    renderHome()
    const subtitle = screen.getByRole('heading', { level: 2, name: /Full Stack Developer & UI\/UX Enthusiast/ })
    expect(subtitle).toBeInTheDocument()
    expect(subtitle).toHaveClass('hero-subtitle')
  })

  it('should render the hero summary', () => {
    renderHome()
    const summary = screen.getByText(/Passionate about building elegant, performant web applications/)
    expect(summary).toBeInTheDocument()
    expect(summary).toHaveClass('hero-summary')
  })

  it('should render the CTA button with correct text', () => {
    renderHome()
    const ctaButton = screen.getByRole('button')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveClass('cta-button')
    expect(ctaButton).toHaveTextContent('Get In Touch')
  })

  it('should have proper aria-label on CTA button', () => {
    renderHome()
    const ctaButton = screen.getByRole('button')
    expect(ctaButton).toHaveAttribute('aria-label', 'Get in touch')
  })

  it('should call navigate when CTA button is clicked', () => {
    renderHome()
    const ctaButton = screen.getByRole('button', { name: 'Get In Touch' })
    fireEvent.click(ctaButton)
    expect(window.location.pathname).toBe('/contact')
  })

  it('should render home-container div', () => {
    const { container } = renderHome()
    const homeContainer = container.querySelector('.home-container')
    expect(homeContainer).toBeInTheDocument()
  })

  it('should render hero div', () => {
    const { container } = renderHome()
    const hero = container.querySelector('.hero')
    expect(hero).toBeInTheDocument()
  })

  it('should have proper structure with container and hero', () => {
    const { container } = renderHome()
    const homeSection = container.querySelector('section.home')
    const homeContainer = homeSection.querySelector('.home-container')
    const hero = homeContainer.querySelector('.hero')

    expect(homeSection).toBeInTheDocument()
    expect(homeContainer).toBeInTheDocument()
    expect(hero).toBeInTheDocument()
  })
})
