import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SocialLinks } from './SocialLinks'
import { ProfileContext } from '../../context/ProfileContext'

function makeProfile(socialLinks = []) {
  return {
    name: '',
    headline: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    photoUrl: '',
    socialLinks,
    skills: [],
  }
}

function renderWithContext(profile, saveProfile = vi.fn()) {
  return render(
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      <SocialLinks />
    </ProfileContext.Provider>
  )
}

describe('SocialLinks', () => {
  it('renders empty state with Add Link button', () => {
    renderWithContext(makeProfile([]))
    expect(screen.getByRole('button', { name: /add link/i })).toBeInTheDocument()
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  })

  it('clicking Add Link shows a new URL input', () => {
    renderWithContext(makeProfile([]))
    fireEvent.click(screen.getByRole('button', { name: /add link/i }))
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  it('entering a GitHub URL auto-labels it GitHub', () => {
    renderWithContext(makeProfile([{ url: '' }]))
    const input = screen.getByRole('textbox', { name: /social link 1/i })
    fireEvent.change(input, { target: { value: 'https://github.com/user' } })
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('Add button is disabled when 10 links exist', () => {
    const tenLinks = Array.from({ length: 10 }, (_, i) => ({ url: `https://example.com/${i}` }))
    renderWithContext(makeProfile(tenLinks))
    expect(screen.getByRole('button', { name: /add link/i })).toBeDisabled()
  })

  it('Remove button deletes the corresponding link entry', () => {
    const links = [
      { url: 'https://github.com/user' },
      { url: 'https://linkedin.com/in/user' },
    ]
    renderWithContext(makeProfile(links))
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: /remove link 1/i }))
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })
})
