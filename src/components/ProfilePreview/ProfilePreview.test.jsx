import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfilePreview } from './ProfilePreview'
import { ProfileContext } from '../../context/ProfileContext'

const baseProfile = {
  name: 'Jane Doe',
  headline: 'Full Stack Developer',
  bio: 'Passionate about writing clean code.',
  location: 'New York, USA',
  email: 'jane@example.com',
  phone: '+1 234 567 8900',
  website: 'https://janedoe.com',
  photoUrl: '',
  socialLinks: [
    { url: 'https://github.com/janedoe' },
    { url: 'https://linkedin.com/in/janedoe' },
  ],
  skills: ['React', 'TypeScript', 'Node.js'],
}

function renderPreview(profile = baseProfile) {
  return render(
    <ProfileContext.Provider value={{ profile, saveProfile: vi.fn() }}>
      <ProfilePreview />
    </ProfileContext.Provider>
  )
}

describe('ProfilePreview', () => {
  describe('renders profile fields from context', () => {
    it('renders the name', () => {
      renderPreview()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('renders the headline', () => {
      renderPreview()
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
    })

    it('renders the bio', () => {
      renderPreview()
      expect(screen.getByText('Passionate about writing clean code.')).toBeInTheDocument()
    })

    it('renders the location', () => {
      renderPreview()
      expect(screen.getByText(/New York, USA/)).toBeInTheDocument()
    })

    it('renders the email', () => {
      renderPreview()
      expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument()
    })

    it('renders the phone', () => {
      renderPreview()
      expect(screen.getByText(/\+1 234 567 8900/)).toBeInTheDocument()
    })

    it('renders the website', () => {
      renderPreview()
      expect(screen.getByText(/janedoe\.com/)).toBeInTheDocument()
    })

    it('shows placeholder avatar when no photoUrl', () => {
      renderPreview()
      expect(screen.getByRole('img', { name: /default avatar/i })).toBeInTheDocument()
    })

    it('shows profile photo img when photoUrl is set', () => {
      renderPreview({ ...baseProfile, photoUrl: 'data:image/jpeg;base64,abc' })
      expect(screen.getByRole('img', { name: /profile photo/i })).toBeInTheDocument()
    })
  })

  describe('social links', () => {
    it('renders social links as anchor elements', () => {
      renderPreview()
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders GitHub link with correct href', () => {
      renderPreview()
      const githubLink = screen.getByRole('link', { name: 'GitHub' })
      expect(githubLink).toHaveAttribute('href', 'https://github.com/janedoe')
    })

    it('renders LinkedIn link with correct href', () => {
      renderPreview()
      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/janedoe')
    })

    it('opens social links in a new tab', () => {
      renderPreview()
      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('does not render social section when links are empty', () => {
      renderPreview({ ...baseProfile, socialLinks: [] })
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('skills', () => {
    it('renders skills as non-interactive tag chips', () => {
      renderPreview()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('does not render remove buttons on skill chips', () => {
      renderPreview()
      expect(screen.queryByRole('button', { name: /remove react/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /remove typescript/i })).not.toBeInTheDocument()
    })

    it('does not render skills section when skills array is empty', () => {
      renderPreview({ ...baseProfile, skills: [] })
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })
  })

  describe('no form inputs or edit controls', () => {
    it('contains no text inputs', () => {
      renderPreview()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('contains no form element', () => {
      renderPreview()
      expect(document.querySelector('form')).not.toBeInTheDocument()
    })

    it('contains no buttons', () => {
      renderPreview()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
