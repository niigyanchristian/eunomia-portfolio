import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ProjectsManager } from './ProjectsManager'
import { ProjectsContext } from '../context/ProjectsContext'

const mockProjects = [
  { id: '1', title: 'Draft One', description: 'A draft project', category: 'Design', customTags: ['UI'], projectType: 'Personal', status: 'draft', collaborators: [] },
  { id: '2', title: 'Published One', description: 'A published project', category: 'Web Development', customTags: ['React'], projectType: 'Client Work', status: 'published', collaborators: [] },
  { id: '3', title: 'Draft Two', description: 'Another draft', category: 'Data Science', customTags: [], projectType: 'Collaborative', status: 'draft', collaborators: [] },
]

const createMockContext = (projects = mockProjects) => ({
  projects,
  addProject: vi.fn((data) => ({ id: 'new-id', ...data })),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  publishProject: vi.fn(),
  saveDraft: vi.fn(),
})

function renderManager(contextOverrides = {}) {
  const ctx = { ...createMockContext(), ...contextOverrides }
  render(
    <ProjectsContext.Provider value={ctx}>
      <ProjectsManager />
    </ProjectsContext.Provider>
  )
  return ctx
}

describe('ProjectsManager', () => {
  describe('Initial render', () => {
    it('renders the title', () => {
      renderManager()
      expect(screen.getByText('Manage Projects')).toBeInTheDocument()
    })

    it('renders the create button', () => {
      renderManager()
      expect(screen.getByText('+ Create New Project')).toBeInTheDocument()
    })

    it('renders filter tabs', () => {
      renderManager()
      expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Drafts' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Published' })).toBeInTheDocument()
    })

    it('renders all project cards by default', () => {
      renderManager()
      expect(screen.getByText('Draft One')).toBeInTheDocument()
      expect(screen.getByText('Published One')).toBeInTheDocument()
      expect(screen.getByText('Draft Two')).toBeInTheDocument()
    })
  })

  describe('Filter tabs', () => {
    it('shows only drafts when Drafts tab is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByRole('tab', { name: 'Drafts' }))
      expect(screen.getByText('Draft One')).toBeInTheDocument()
      expect(screen.getByText('Draft Two')).toBeInTheDocument()
      expect(screen.queryByText('Published One')).not.toBeInTheDocument()
    })

    it('shows only published when Published tab is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByRole('tab', { name: 'Published' }))
      expect(screen.getByText('Published One')).toBeInTheDocument()
      expect(screen.queryByText('Draft One')).not.toBeInTheDocument()
      expect(screen.queryByText('Draft Two')).not.toBeInTheDocument()
    })

    it('shows all projects when All tab is clicked after filtering', () => {
      renderManager()
      fireEvent.click(screen.getByRole('tab', { name: 'Drafts' }))
      fireEvent.click(screen.getByRole('tab', { name: 'All' }))
      expect(screen.getByText('Draft One')).toBeInTheDocument()
      expect(screen.getByText('Published One')).toBeInTheDocument()
    })

    it('highlights active filter tab', () => {
      renderManager()
      const draftsTab = screen.getByRole('tab', { name: 'Drafts' })
      fireEvent.click(draftsTab)
      expect(draftsTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Empty states', () => {
    it('shows empty message when no projects exist', () => {
      renderManager({ projects: [] })
      expect(screen.getByText(/no projects yet/i)).toBeInTheDocument()
    })

    it('shows empty drafts message', () => {
      const ctx = createMockContext([mockProjects[1]])
      renderManager(ctx)
      fireEvent.click(screen.getByRole('tab', { name: 'Drafts' }))
      expect(screen.getByText(/no draft projects/i)).toBeInTheDocument()
    })

    it('shows empty published message', () => {
      const ctx = createMockContext([mockProjects[0]])
      renderManager(ctx)
      fireEvent.click(screen.getByRole('tab', { name: 'Published' }))
      expect(screen.getByText(/no published projects/i)).toBeInTheDocument()
    })
  })

  describe('Create project', () => {
    it('shows project form when create button is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByText('+ Create New Project'))
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
      expect(screen.queryByText('+ Create New Project')).not.toBeInTheDocument()
    })

    it('hides form when cancel is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByText('+ Create New Project'))
      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.getByText('+ Create New Project')).toBeInTheDocument()
    })
  })

  describe('Edit project', () => {
    it('shows project form with edit title when edit is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByRole('button', { name: /edit draft one/i }))
      expect(screen.getByText('Edit Project')).toBeInTheDocument()
    })
  })

  describe('Delete project', () => {
    it('shows confirmation dialog when delete is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByRole('button', { name: /delete draft one/i }))
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })

    it('calls deleteProject when confirmed', () => {
      const ctx = renderManager()
      fireEvent.click(screen.getByRole('button', { name: /delete draft one/i }))
      fireEvent.click(screen.getByText('Delete', { selector: '.btn-confirm-delete' }))
      expect(ctx.deleteProject).toHaveBeenCalledWith('1')
    })

    it('closes dialog when cancel is clicked', () => {
      renderManager()
      fireEvent.click(screen.getByRole('button', { name: /delete draft one/i }))
      const dialog = screen.getByRole('alertdialog')
      fireEvent.click(within(dialog).getByText('Cancel'))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})
