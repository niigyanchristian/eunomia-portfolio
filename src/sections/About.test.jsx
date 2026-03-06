import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// eslint-disable-next-line no-unused-vars
import { About } from '../pages/About'

const renderAbout = () => {
  return render(<About />)
}

describe('About', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the about section', () => {
    const { container } = renderAbout()
    const aboutSection = container.querySelector('section.about')
    expect(aboutSection).toBeInTheDocument()
    expect(aboutSection).toHaveClass('about')
  })

  it('should render the about title', () => {
    renderAbout()
    const title = screen.getByRole('heading', { level: 1, name: 'About Me' })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('about-title')
  })

  it('should render the intro section with heading', () => {
    renderAbout()
    const introHeading = screen.getByRole('heading', { level: 2, name: "Hello, I'm John Doe" })
    expect(introHeading).toBeInTheDocument()
  })

  it('should render the intro description', () => {
    renderAbout()
    const introText = screen.getByText(/I'm a passionate Full Stack Developer with a keen eye for design/)
    expect(introText).toBeInTheDocument()
  })

  it('should render the background section with heading', () => {
    renderAbout()
    const backgroundHeading = screen.getByRole('heading', { level: 2, name: 'Background' })
    expect(backgroundHeading).toBeInTheDocument()
  })

  it('should render background paragraphs', () => {
    renderAbout()
    const journeyText = screen.getByText(/My journey in tech started during college/)
    const exploringText = screen.getByText(/When I'm not coding/)
    expect(journeyText).toBeInTheDocument()
    expect(exploringText).toBeInTheDocument()
  })

  it('should render the experience section with heading', () => {
    renderAbout()
    const experienceHeading = screen.getByRole('heading', { level: 2, name: 'Experience Summary' })
    expect(experienceHeading).toBeInTheDocument()
  })

  it('should render all experience items', () => {
    renderAbout()
    const frontendHeading = screen.getByRole('heading', { level: 3, name: 'Frontend Development' })
    const backendHeading = screen.getByRole('heading', { level: 3, name: 'Backend Development' })
    const uiuxHeading = screen.getByRole('heading', { level: 3, name: 'UI/UX Design' })

    expect(frontendHeading).toBeInTheDocument()
    expect(backendHeading).toBeInTheDocument()
    expect(uiuxHeading).toBeInTheDocument()
  })

  it('should render frontend development description', () => {
    renderAbout()
    const frontendText = screen.getByText(/Proficient in React, Vue\.js, and modern JavaScript/)
    expect(frontendText).toBeInTheDocument()
  })

  it('should render backend development description', () => {
    renderAbout()
    const backendText = screen.getByText(/Skilled in Node\.js, Express, and RESTful API design/)
    expect(backendText).toBeInTheDocument()
  })

  it('should render UI/UX design description', () => {
    renderAbout()
    const uiuxText = screen.getByText(/Strong understanding of design principles, typography, and color theory/)
    expect(uiuxText).toBeInTheDocument()
  })

  it('should render the resume download button', () => {
    renderAbout()
    const resumeButton = screen.getByRole('button')
    expect(resumeButton).toBeInTheDocument()
    expect(resumeButton).toHaveClass('resume-download-button')
    expect(resumeButton).toHaveTextContent('Download Resume')
  })

  it('should have proper aria-label on resume button', () => {
    renderAbout()
    const resumeButton = screen.getByRole('button')
    expect(resumeButton).toHaveAttribute('aria-label', 'Download resume')
  })

  it('should trigger resume download when button is clicked', () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    renderAbout()
    const resumeButton = screen.getByRole('button')
    fireEvent.click(resumeButton)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should create link with correct href for resume download', () => {
    const linkElement = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(linkElement)

    renderAbout()
    const resumeButton = screen.getByRole('button')
    fireEvent.click(resumeButton)

    expect(linkElement.href).toBe('/resume.pdf')
    expect(linkElement.download).toBe('John_Doe_Resume.pdf')
    expect(linkElement.click).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })

  it('should render about-container div', () => {
    const { container } = renderAbout()
    const aboutContainer = container.querySelector('.about-container')
    expect(aboutContainer).toBeInTheDocument()
  })

  it('should render experience-list with proper items', () => {
    const { container } = renderAbout()
    const experienceList = container.querySelector('.experience-list')
    const experienceItems = container.querySelectorAll('.experience-item')

    expect(experienceList).toBeInTheDocument()
    expect(experienceItems).toHaveLength(3)
  })

  it('should render about-cta section', () => {
    const { container } = renderAbout()
    const aboutCta = container.querySelector('.about-cta')
    expect(aboutCta).toBeInTheDocument()
  })

  it('should have proper structure', () => {
    const { container } = renderAbout()
    const aboutSection = container.querySelector('section.about')
    const aboutContainer = aboutSection.querySelector('.about-container')
    const aboutTitle = aboutContainer.querySelector('.about-title')

    expect(aboutSection).toBeInTheDocument()
    expect(aboutContainer).toBeInTheDocument()
    expect(aboutTitle).toBeInTheDocument()
  })
})
