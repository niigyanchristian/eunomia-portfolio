import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterPanel from './FilterPanel'
import { ProjectsContext } from '../../context/ProjectsContext'
import { TimeRangePreset } from '../../config/reportTemplates'

const mockProjects = [
  {
    id: '1',
    title: 'Project 1',
    status: 'published',
    category: 'Web Development',
    customTags: ['React', 'TypeScript'],
  },
  {
    id: '2',
    title: 'Project 2',
    status: 'draft',
    category: 'Mobile Development',
    customTags: ['Flutter', 'Dart'],
  },
  {
    id: '3',
    title: 'Project 3',
    status: 'published',
    category: 'Web Development',
    customTags: ['Vue', 'JavaScript'],
  },
]

const mockProjectsContext = {
  projects: mockProjects,
}

const renderWithContext = (component) => {
  return render(
    <ProjectsContext.Provider value={mockProjectsContext}>
      {component}
    </ProjectsContext.Provider>
  )
}

describe('FilterPanel', () => {
  let mockOnChange

  beforeEach(() => {
    mockOnChange = vi.fn()
  })

  it('renders filter panel with all sections', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Tags')).toBeInTheDocument()
  })

  it('renders date range preset buttons', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByRole('button', { name: 'Last 30 Days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last Quarter' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last Year' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Year to Date' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  })

  it('shows Year to Date as default active preset', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const ytdButton = screen.getByRole('button', { name: 'Year to Date' })
    expect(ytdButton).toHaveClass('active')
  })

  it('shows custom date inputs when Custom is selected', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const customButton = screen.getByRole('button', { name: 'Custom' })
    fireEvent.click(customButton)

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
  })

  it('calls onChange when date range preset is selected', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const last30DaysButton = screen.getByRole('button', { name: 'Last 30 Days' })
    fireEvent.click(last30DaysButton)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.dateRange.type).toBe(TimeRangePreset.LAST_30_DAYS)
  })

  it('renders all projects as checkboxes', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
    expect(screen.getByText('Project 3')).toBeInTheDocument()
  })

  it('toggles project selection', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const project1Checkbox = screen.getByLabelText('Project 1', { exact: false })
    fireEvent.click(project1Checkbox)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.projects).toContain('1')
  })

  it('renders status filter options', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('On hold')).toBeInTheDocument()
  })

  it('toggles status selection', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const publishedCheckbox = screen.getByLabelText('Published', { exact: false })
    fireEvent.click(publishedCheckbox)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.statuses).toContain('published')
  })

  it('renders available categories from projects', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByText('Web Development')).toBeInTheDocument()
    expect(screen.getByText('Mobile Development')).toBeInTheDocument()
  })

  it('toggles category selection', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const webDevCheckbox = screen.getByLabelText('Web Development', { exact: false })
    fireEvent.click(webDevCheckbox)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.categories).toContain('Web Development')
  })

  it('renders available tags from projects', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Flutter')).toBeInTheDocument()
    expect(screen.getByText('Dart')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  it('toggles tag selection', () => {
    renderWithContext(<FilterPanel onChange={mockOnChange} />)

    const reactCheckbox = screen.getByLabelText('React', { exact: false })
    fireEvent.click(reactCheckbox)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.tags).toContain('React')
  })

  it('clears all filters when Clear All is clicked', () => {
    renderWithContext(
      <FilterPanel
        filters={{
          projects: ['1'],
          statuses: ['published'],
          categories: ['Web Development'],
          tags: ['React'],
        }}
        onChange={mockOnChange}
      />
    )

    const clearButton = screen.getByRole('button', { name: 'Clear All' })
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalled()
    const call = mockOnChange.mock.calls[0][0]
    expect(call.projects).toEqual([])
    expect(call.statuses).toEqual([])
    expect(call.categories).toEqual([])
    expect(call.tags).toEqual([])
  })

  it('shows "No projects available" when there are no projects', () => {
    render(
      <ProjectsContext.Provider value={{ projects: [] }}>
        <FilterPanel onChange={mockOnChange} />
      </ProjectsContext.Provider>
    )

    expect(screen.getByText('No projects available')).toBeInTheDocument()
  })

  it('shows "No categories available" when there are no categories', () => {
    const projectsWithoutCategories = [
      { id: '1', title: 'Project 1', status: 'published', category: '', customTags: [] },
    ]

    render(
      <ProjectsContext.Provider value={{ projects: projectsWithoutCategories }}>
        <FilterPanel onChange={mockOnChange} />
      </ProjectsContext.Provider>
    )

    expect(screen.getByText('No categories available')).toBeInTheDocument()
  })

  it('shows "No tags available" when there are no tags', () => {
    const projectsWithoutTags = [
      { id: '1', title: 'Project 1', status: 'published', category: 'Web', customTags: [] },
    ]

    render(
      <ProjectsContext.Provider value={{ projects: projectsWithoutTags }}>
        <FilterPanel onChange={mockOnChange} />
      </ProjectsContext.Provider>
    )

    expect(screen.getByText('No tags available')).toBeInTheDocument()
  })

  it('initializes with provided filters', () => {
    const initialFilters = {
      projects: ['1', '2'],
      statuses: ['published'],
      categories: ['Web Development'],
      tags: ['React'],
    }

    renderWithContext(<FilterPanel filters={initialFilters} onChange={mockOnChange} />)

    const project1Checkbox = screen.getByLabelText('Project 1', { exact: false })
    const project2Checkbox = screen.getByLabelText('Project 2', { exact: false })
    const publishedCheckbox = screen.getByLabelText('Published', { exact: false })
    const webDevCheckbox = screen.getByLabelText('Web Development', { exact: false })
    const reactCheckbox = screen.getByLabelText('React', { exact: false })

    expect(project1Checkbox).toBeChecked()
    expect(project2Checkbox).toBeChecked()
    expect(publishedCheckbox).toBeChecked()
    expect(webDevCheckbox).toBeChecked()
    expect(reactCheckbox).toBeChecked()
  })
})
