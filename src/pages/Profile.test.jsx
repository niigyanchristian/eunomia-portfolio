import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Profile } from './Profile'
import { ProfileProvider } from '../context/ProfileContext'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function renderProfile() {
  return render(
    <ProfileProvider>
      <Profile />
    </ProfileProvider>
  )
}

describe('Profile Page', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('Initial render', () => {
    it('renders the profile title', () => {
      renderProfile()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders Edit Profile button when not in edit mode', () => {
      renderProfile()
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
    })

    it('renders Preview Profile button when not in edit mode', () => {
      renderProfile()
      expect(screen.getByRole('button', { name: /preview profile/i })).toBeInTheDocument()
    })
  })

  describe('Form rendering', () => {
    it('shows the edit form with all fields when Edit Profile is clicked', async () => {
      renderProfile()

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Headline')).toBeInTheDocument()
      expect(screen.getByLabelText('Bio')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone')).toBeInTheDocument()
      expect(screen.getByLabelText('Website')).toBeInTheDocument()
    })

    it('shows Save and Cancel buttons in edit mode', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    })
  })

  describe('Bio character counter', () => {
    it('shows 0/500 counter initially', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(screen.getByText('0/500')).toBeInTheDocument()
    })

    it('updates the bio counter as the user types', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const bioField = screen.getByLabelText('Bio')
      await userEvent.type(bioField, 'Hello')

      expect(screen.getByText('5/500')).toBeInTheDocument()
    })

    it('enforces the 500 character limit', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const bioField = screen.getByLabelText('Bio')
      const longText = 'a'.repeat(510)
      await userEvent.type(bioField, longText)

      expect(bioField.value.length).toBeLessThanOrEqual(500)
      expect(screen.getByText('500/500')).toBeInTheDocument()
    })

    it('applies at-limit class when bio reaches 500 characters', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const bioField = screen.getByLabelText('Bio')
      fireEvent.change(bioField, { target: { name: 'bio', value: 'a'.repeat(500) } })

      await waitFor(() => {
        expect(screen.getByText('500/500')).toHaveClass('at-limit')
      })
    })
  })

  describe('Save behavior', () => {
    it('writes to localStorage when Save is clicked', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const nameField = screen.getByLabelText('Name')
      await userEvent.type(nameField, 'Jane Doe')

      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'portfolio_profile',
          expect.stringContaining('Jane Doe')
        )
      })
    })

    it('exits edit mode after saving', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
      })
    })

    it('persists saved values in the profile view', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const nameField = screen.getByLabelText('Name')
      await userEvent.type(nameField, 'Jane Doe')

      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Preview toggle', () => {
    it('clicking Preview Profile in edit mode renders ProfilePreview', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
      fireEvent.click(screen.getByRole('button', { name: /preview profile/i }))

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument()
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    it('clicking Back to Edit renders the edit form', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
      fireEvent.click(screen.getByRole('button', { name: /preview profile/i }))
      fireEvent.click(screen.getByRole('button', { name: /back to edit/i }))

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.queryByTestId('profile-preview')).not.toBeInTheDocument()
    })

    it('clicking Preview Profile from view mode also renders ProfilePreview', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /preview profile/i }))

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument()
    })

    it('Back to Edit button is shown in preview mode', () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
      fireEvent.click(screen.getByRole('button', { name: /preview profile/i }))

      expect(screen.getByRole('button', { name: /back to edit/i })).toBeInTheDocument()
    })
  })

  describe('Cancel behavior', () => {
    it('discards unsaved changes when Cancel is clicked', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const nameField = screen.getByLabelText('Name')
      await userEvent.type(nameField, 'Unsaved Name')

      fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

      await waitFor(() => {
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
        expect(screen.queryByText('Unsaved Name')).not.toBeInTheDocument()
      })
    })

    it('does not write to localStorage when Cancel is clicked', async () => {
      renderProfile()
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

      const nameField = screen.getByLabelText('Name')
      await userEvent.type(nameField, 'Unsaved Name')

      fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('reverts to the last saved state after cancel', async () => {
      renderProfile()

      // Save initial data
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
      const nameField = screen.getByLabelText('Name')
      await userEvent.type(nameField, 'Saved Name')
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      await waitFor(() => expect(screen.getByText('Saved Name')).toBeInTheDocument())

      // Start editing again and type new unsaved name
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
      const nameField2 = screen.getByLabelText('Name')
      await userEvent.clear(nameField2)
      await userEvent.type(nameField2, 'Unsaved Name')

      // Cancel - should revert to saved state
      fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

      await waitFor(() => {
        expect(screen.getByText('Saved Name')).toBeInTheDocument()
        expect(screen.queryByText('Unsaved Name')).not.toBeInTheDocument()
      })
    })
  })
})
