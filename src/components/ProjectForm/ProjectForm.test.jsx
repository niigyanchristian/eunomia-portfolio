import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectForm } from './ProjectForm'

const defaultProps = {
  project: null,
  onSaveDraft: vi.fn(),
  onPublish: vi.fn(),
  onCancel: vi.fn(),
}

function setup(props = {}) {
  const merged = { ...defaultProps, ...props, onSaveDraft: vi.fn(), onPublish: vi.fn(), onCancel: vi.fn(), ...props }
  render(<ProjectForm {...merged} />)
  return merged
}

describe('ProjectForm', () => {
  describe('Rendering', () => {
    it('renders Create New Project title in create mode', () => {
      setup()
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('renders Edit Project title in edit mode', () => {
      setup({ project: { title: 'Test', description: '', customTags: [], collaborators: [] } })
      expect(screen.getByText('Edit Project')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      setup()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/completion date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/add tag/i)).toBeInTheDocument()
      expect(screen.getByText('Save as Draft')).toBeInTheDocument()
      expect(screen.getByText('Publish')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders project type radio buttons', () => {
      setup()
      expect(screen.getByLabelText('Personal')).toBeInTheDocument()
      expect(screen.getByLabelText('Client Work')).toBeInTheDocument()
      expect(screen.getByLabelText('Collaborative')).toBeInTheDocument()
    })
  })

  describe('Character counter', () => {
    it('shows 0/2000 initially', () => {
      setup()
      expect(screen.getByText('0/2000')).toBeInTheDocument()
    })

    it('updates counter as user types', async () => {
      const user = userEvent.setup()
      setup()
      const desc = screen.getByLabelText(/description/i)
      await user.type(desc, 'Hello World')
      expect(screen.getByText('11/2000')).toBeInTheDocument()
    })

    it('applies at-limit class when description reaches 2000', () => {
      setup()
      const desc = screen.getByLabelText(/description/i)
      fireEvent.change(desc, { target: { name: 'description', value: 'a'.repeat(2000) } })
      expect(screen.getByText('2000/2000')).toHaveClass('at-limit')
    })
  })

  describe('Draft validation', () => {
    it('shows error when title is empty on save draft', () => {
      const props = setup()
      fireEvent.click(screen.getByText('Save as Draft'))
      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      expect(props.onSaveDraft).not.toHaveBeenCalled()
    })

    it('shows error when title is too short', async () => {
      const user = userEvent.setup()
      const props = setup()
      await user.type(screen.getByLabelText(/title/i), 'ab')
      fireEvent.click(screen.getByText('Save as Draft'))
      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      expect(props.onSaveDraft).not.toHaveBeenCalled()
    })

    it('calls onSaveDraft when title is valid', async () => {
      const user = userEvent.setup()
      const props = setup()
      await user.type(screen.getByLabelText(/title/i), 'Valid Title')
      fireEvent.click(screen.getByText('Save as Draft'))
      expect(props.onSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Valid Title', status: 'draft' })
      )
    })
  })

  describe('Publish validation', () => {
    it('requires description, category, and projectType for publish', async () => {
      const user = userEvent.setup()
      const props = setup()
      await user.type(screen.getByLabelText(/title/i), 'Valid Title')
      fireEvent.click(screen.getByText('Publish'))
      expect(screen.getByText('Description must be at least 50 characters for publishing')).toBeInTheDocument()
      expect(screen.getByText('Category is required for publishing')).toBeInTheDocument()
      expect(screen.getByText('Project type is required for publishing')).toBeInTheDocument()
      expect(props.onPublish).not.toHaveBeenCalled()
    })

    it('calls onPublish when all publish fields are valid', async () => {
      const user = userEvent.setup()
      const props = setup()
      await user.type(screen.getByLabelText(/title/i), 'Valid Title')
      const desc = screen.getByLabelText(/description/i)
      fireEvent.change(desc, { target: { name: 'description', value: 'a'.repeat(60) } })
      await user.selectOptions(screen.getByLabelText(/category/i), 'Web Development')
      await user.click(screen.getByLabelText('Personal'))
      fireEvent.click(screen.getByText('Publish'))
      expect(props.onPublish).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Valid Title', status: 'published', category: 'Web Development', projectType: 'Personal' })
      )
    })
  })

  describe('Tags', () => {
    it('adds a tag when pressing Enter', async () => {
      const user = userEvent.setup()
      setup()
      const tagInput = screen.getByLabelText(/add tag/i)
      await user.type(tagInput, 'react{Enter}')
      expect(screen.getByText('react')).toBeInTheDocument()
    })

    it('removes a tag when clicking remove button', async () => {
      const user = userEvent.setup()
      setup()
      const tagInput = screen.getByLabelText(/add tag/i)
      await user.type(tagInput, 'react{Enter}')
      expect(screen.getByText('react')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /remove tag react/i }))
      expect(screen.queryByText('react')).not.toBeInTheDocument()
    })

    it('does not add duplicate tags', async () => {
      const user = userEvent.setup()
      setup()
      const tagInput = screen.getByLabelText(/add tag/i)
      await user.type(tagInput, 'react{Enter}')
      await user.type(tagInput, 'react{Enter}')
      const tags = screen.getAllByText('react')
      expect(tags).toHaveLength(1)
    })
  })

  describe('Collaborators', () => {
    it('adds a collaborator', async () => {
      const user = userEvent.setup()
      setup()
      await user.type(screen.getByLabelText(/collaborator name/i), 'John')
      await user.type(screen.getByLabelText(/collaborator role/i), 'Developer')
      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText(/Developer/)).toBeInTheDocument()
    })

    it('removes a collaborator', async () => {
      const user = userEvent.setup()
      setup()
      await user.type(screen.getByLabelText(/collaborator name/i), 'John')
      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('John')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /remove collaborator john/i }))
      expect(screen.queryByText('John')).not.toBeInTheDocument()
    })

    it('does not add collaborator with empty name', async () => {
      setup()
      fireEvent.click(screen.getByText('Add'))
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('Cancel', () => {
    it('calls onCancel when cancel is clicked', () => {
      const props = setup()
      fireEvent.click(screen.getByText('Cancel'))
      expect(props.onCancel).toHaveBeenCalled()
    })
  })

  describe('Edit mode', () => {
    it('populates form with existing project data', () => {
      setup({
        project: {
          title: 'Existing',
          description: 'Desc',
          completionDate: '2025-01-01',
          category: 'Design',
          customTags: ['tag1'],
          projectType: 'Personal',
          collaborators: [{ name: 'Alice', role: 'Designer' }],
        },
      })
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing')
      expect(screen.getByLabelText(/description/i)).toHaveValue('Desc')
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })
})
