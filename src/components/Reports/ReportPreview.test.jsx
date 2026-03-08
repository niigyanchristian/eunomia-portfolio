import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportPreview } from './ReportPreview'

vi.mock('../Charts/LineChart', () => ({
  LineChart: ({ data }) => <div data-testid="line-chart">LineChart: {data?.length || 0} items</div>
}))

vi.mock('../Charts/BarChart', () => ({
  BarChart: ({ data }) => <div data-testid="bar-chart">BarChart: {data?.length || 0} items</div>
}))

vi.mock('../Charts/PieChart', () => ({
  PieChart: ({ data }) => <div data-testid="pie-chart">PieChart: {data?.length || 0} items</div>
}))

vi.mock('../Charts/AreaChart', () => ({
  AreaChart: ({ data }) => <div data-testid="area-chart">AreaChart: {data?.length || 0} items</div>
}))

vi.mock('./MetricsCard', () => ({
  MetricsCard: ({ title, value }) => (
    <div data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title}: {value}
    </div>
  )
}))

vi.mock('./DataTable', () => ({
  DataTable: ({ data, columns }) => (
    <div data-testid="data-table">
      DataTable: {data?.length || 0} rows, {columns?.length || 0} columns
    </div>
  )
}))

describe('ReportPreview', () => {
  const mockReport = {
    id: 'report-1',
    title: 'Test Report',
    createdAt: '2026-03-01T10:00:00Z',
    data: {
      summary: {
        totalProjects: 10,
        filteredFrom: 15,
        filtersApplied: 2
      },
      metrics: {
        totalProjects: 10,
        completionRate: 75.5,
        overdueProjects: 2,
        atRiskProjects: 1,
        velocity: 2.5,
        categoryBreakdown: {
          'Web': 5,
          'Mobile': 3,
          'Desktop': 2
        },
        statusDistribution: {
          'published': 7,
          'draft': 3
        },
        timeline: [
          { label: 'Jan', published: 2, draft: 1 },
          { label: 'Feb', published: 3, draft: 1 }
        ],
        recentUpdates: [
          { id: '1', title: 'Project A', status: 'published', updatedAt: '2026-02-15T10:00:00Z' }
        ],
        milestones: [
          { id: '1', title: 'Project B', status: 'published', completionDate: '2026-03-15T10:00:00Z' }
        ]
      },
      comparisons: {
        yoy: 15.5,
        qoq: -5.2,
        currentPeriod: 10,
        previousYear: 8,
        previousQuarter: 11
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders report title and metadata', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByText('Test Report')).toBeInTheDocument()
    expect(screen.getByText(/Generated on March 01, 2026/)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ReportPreview loading={true} />)
    expect(screen.getByText('Loading report...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<ReportPreview error="Failed to load report" />)
    expect(screen.getByText('Failed to load report')).toBeInTheDocument()
  })

  it('shows empty state when no report data', () => {
    render(<ReportPreview report={null} />)
    expect(screen.getByText('No report data available')).toBeInTheDocument()
  })

  it('renders metrics cards for available metrics', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByTestId('metric-total-projects')).toBeInTheDocument()
    expect(screen.getByTestId('metric-completion-rate')).toBeInTheDocument()
    expect(screen.getByTestId('metric-overdue-projects')).toBeInTheDocument()
    expect(screen.getByTestId('metric-at-risk-projects')).toBeInTheDocument()
    expect(screen.getByTestId('metric-average-velocity')).toBeInTheDocument()
  })

  it('renders category breakdown pie chart when data available', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByText(/PieChart: 3 items/)).toBeInTheDocument()
  })

  it('renders status distribution bar chart when data available', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText(/BarChart: 2 items/)).toBeInTheDocument()
  })

  it('renders timeline area chart when data available', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByText(/AreaChart: 2 items/)).toBeInTheDocument()
  })

  it('renders recent updates table when data available', () => {
    render(<ReportPreview report={mockReport} />)
    const tables = screen.getAllByTestId('data-table')
    expect(tables.length).toBeGreaterThan(0)
  })

  it('renders milestones table when data available', () => {
    render(<ReportPreview report={mockReport} />)
    const tables = screen.getAllByTestId('data-table')
    expect(tables.length).toBeGreaterThan(0)
  })

  it('displays report summary', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.getByText(/Showing 10 projects/)).toBeInTheDocument()
    expect(screen.getByText(/2 filters applied/)).toBeInTheDocument()
  })

  it('renders export button when onExport provided', () => {
    const onExport = vi.fn()
    render(<ReportPreview report={mockReport} onExport={onExport} />)
    expect(screen.getByText('Export Report')).toBeInTheDocument()
  })

  it('renders print button when onExport provided', () => {
    const onExport = vi.fn()
    render(<ReportPreview report={mockReport} onExport={onExport} />)
    expect(screen.getByText('Print')).toBeInTheDocument()
  })

  it('calls onExport with correct parameters when export clicked', () => {
    const onExport = vi.fn()
    render(<ReportPreview report={mockReport} onExport={onExport} />)

    const exportButton = screen.getByText('Export Report')
    fireEvent.click(exportButton)

    expect(onExport).toHaveBeenCalledWith('report-1', 'pdf')
  })

  it('changes export format when selecting from dropdown', () => {
    const onExport = vi.fn()
    render(<ReportPreview report={mockReport} onExport={onExport} />)

    const formatSelect = screen.getByDisplayValue('PDF')
    fireEvent.change(formatSelect, { target: { value: 'excel' } })

    const exportButton = screen.getByText('Export Report')
    fireEvent.click(exportButton)

    expect(onExport).toHaveBeenCalledWith('report-1', 'excel')
  })

  it('calls window.print when print button clicked', () => {
    const onExport = vi.fn()
    const originalPrint = window.print
    window.print = vi.fn()

    render(<ReportPreview report={mockReport} onExport={onExport} />)

    const printButton = screen.getByText('Print')
    fireEvent.click(printButton)

    expect(window.print).toHaveBeenCalled()

    window.print = originalPrint
  })

  it('does not render charts when metrics are missing', () => {
    const minimalReport = {
      ...mockReport,
      data: {
        summary: mockReport.data.summary,
        metrics: {
          totalProjects: 10
        },
        comparisons: {}
      }
    }
    render(<ReportPreview report={minimalReport} />)
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('does not render export controls when onExport not provided', () => {
    render(<ReportPreview report={mockReport} />)
    expect(screen.queryByText('Export Report')).not.toBeInTheDocument()
    expect(screen.queryByText('Print')).not.toBeInTheDocument()
  })
})
