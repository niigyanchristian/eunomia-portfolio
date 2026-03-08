import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'This is a test description for the project card component that should display properly.',
  category: 'Web Development',
  customTags: ['React', 'Node.js'],
  projectType: 'Personal',
  status: 'draft',
  collaborators: [],
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders truncated description at 150 chars', () => {
    const longDesc = 'a'.repeat(200)
    render(
      <ProjectCard
        project={{ ...mockProject, description: longDesc }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const desc = screen.getByText(/^a+…$/)
    expect(desc.textContent.length).toBeLessThanOrEqual(151)
  })

  it('renders full description when under 150 chars', () => {
    const shortDesc = 'Short description'
    render(
      <ProjectCard
        project={{ ...mockProject, description: shortDesc }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Short description')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Web Development')).toBeInTheDocument()
  })

  it('renders tag chips', () => {
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('renders draft status badge', () => {
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders published status badge', () => {
    render(
      <ProjectCard
        project={{ ...mockProject, status: 'published' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders project type', () => {
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<ProjectCard project={mockProject} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit test project/i }))
    expect(onEdit).toHaveBeenCalledWith(mockProject)
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<ProjectCard project={mockProject} onEdit={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete test project/i }))
    expect(onDelete).toHaveBeenCalledWith(mockProject)
  })

  it('handles missing tags gracefully', () => {
    render(
      <ProjectCard
        project={{ ...mockProject, customTags: [] }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('handles missing description gracefully', () => {
    render(
      <ProjectCard
        project={{ ...mockProject, description: '' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })
})
