import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ReportBuilder from './ReportBuilder'
import { ReportsContext } from '../context/ReportsContext'
import { ProjectsContext } from '../context/ProjectsContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockReportsContext = {
  createCustomReport: vi.fn(),
  loading: false,
  error: null,
  customReports: [],
  availableTemplates: [],
}

const mockProjectsContext = {
  projects: [
    { id: '1', title: 'Project 1', status: 'published', category: 'Web', customTags: ['tag1'] },
    { id: '2', title: 'Project 2', status: 'draft', category: 'Mobile', customTags: ['tag2'] },
  ],
}

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <ProjectsContext.Provider value={mockProjectsContext}>
        <ReportsContext.Provider value={mockReportsContext}>
          {component}
        </ReportsContext.Provider>
      </ProjectsContext.Provider>
    </BrowserRouter>
  )
}

describe('ReportBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders report builder with wizard steps', () => {
    renderWithContext(<ReportBuilder />)

    expect(screen.getByText('Custom Report Builder')).toBeInTheDocument()
    expect(screen.getByText('Select report type or start from scratch')).toBeInTheDocument()
    expect(screen.getByText('Configure filters')).toBeInTheDocument()
    expect(screen.getByText('Select metrics')).toBeInTheDocument()
    expect(screen.getByText('Choose chart types')).toBeInTheDocument()
    expect(screen.getByText('Configure layout and formatting')).toBeInTheDocument()
    expect(screen.getByText('Preview and save/export')).toBeInTheDocument()
  })

  it('shows step 1 content by default', () => {
    renderWithContext(<ReportBuilder />)

    const stepHeaders = screen.getAllByText('Select Report Template')
    expect(stepHeaders.length).toBeGreaterThan(0)
    expect(screen.getByText('Choose a pre-configured template or start from scratch')).toBeInTheDocument()
  })

  it('navigates to next step when Next button is clicked', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)

    expect(screen.getByText('Configure Filters')).toBeInTheDocument()
    expect(screen.getByText('Set date range, projects, and other filters')).toBeInTheDocument()
  })

  it('navigates to previous step when Previous button is clicked', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)

    expect(screen.getByText('Configure Filters')).toBeInTheDocument()

    const previousButton = screen.getByRole('button', { name: 'Previous' })
    fireEvent.click(previousButton)

    expect(screen.getByText('Choose a pre-configured template or start from scratch')).toBeInTheDocument()
  })

  it('disables Previous button on first step', () => {
    renderWithContext(<ReportBuilder />)

    const previousButton = screen.getByRole('button', { name: 'Previous' })
    expect(previousButton).toBeDisabled()
  })

  it('shows metrics step after navigating through wizard', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)

    expect(screen.getByText('Choose the metrics to include in your report')).toBeInTheDocument()
  })

  it('disables Next button on metrics step when no metrics selected', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)

    expect(nextButton).toBeDisabled()
  })

  it('shows layout configuration step', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)

    expect(screen.getByText('Customize the report layout and formatting')).toBeInTheDocument()
    expect(screen.getByLabelText('Report Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('shows preview step with summary', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton)
    }

    expect(screen.getByText('Review your report and save for later use')).toBeInTheDocument()
    expect(screen.getAllByText('Report Summary')[0]).toBeInTheDocument()
  })

  it('closes builder when Close button is clicked', () => {
    renderWithContext(<ReportBuilder />)

    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)

    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  it('calls createCustomReport when Save button is clicked', async () => {
    const mockReport = { id: 'test-report-id' }
    const createMock = vi.fn().mockResolvedValue(mockReport)
    const contextWithMock = { ...mockReportsContext, createCustomReport: createMock }

    render(
      <BrowserRouter>
        <ProjectsContext.Provider value={mockProjectsContext}>
          <ReportsContext.Provider value={contextWithMock}>
            <ReportBuilder />
          </ReportsContext.Provider>
        </ProjectsContext.Provider>
      </BrowserRouter>
    )

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton)
    }

    const titleInput = screen.getByLabelText('Report Title')
    fireEvent.change(titleInput, { target: { value: 'My Custom Report' } })

    fireEvent.click(nextButton)

    const saveButton = screen.getByRole('button', { name: 'Save Report' })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(createMock).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reports/test-report-id')
    })
  })

  it('shows loading state when saving report', async () => {
    const loadingContext = { ...mockReportsContext, loading: true }

    render(
      <BrowserRouter>
        <ProjectsContext.Provider value={mockProjectsContext}>
          <ReportsContext.Provider value={loadingContext}>
            <ReportBuilder />
          </ReportsContext.Provider>
        </ProjectsContext.Provider>
      </BrowserRouter>
    )

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton)
    }

    const titleInput = screen.getByLabelText('Report Title')
    fireEvent.change(titleInput, { target: { value: 'My Custom Report' } })

    fireEvent.click(nextButton)

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  })

  it('updates report title in layout step', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton)
    }

    const titleInput = screen.getByLabelText('Report Title')
    fireEvent.change(titleInput, { target: { value: 'Test Report Title' } })

    expect(titleInput).toHaveValue('Test Report Title')
  })

  it('updates layout columns in layout step', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton)
    }

    const twoColumnsRadio = screen.getByLabelText('2 Columns')
    fireEvent.click(twoColumnsRadio)

    expect(twoColumnsRadio).toBeChecked()
  })

  it('disables Save button when title is empty', () => {
    renderWithContext(<ReportBuilder />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton)
    }

    const saveButton = screen.getByRole('button', { name: 'Save Report' })
    expect(saveButton).toBeDisabled()
  })
})
