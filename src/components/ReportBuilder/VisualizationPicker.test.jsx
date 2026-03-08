import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VisualizationPicker from './VisualizationPicker'
import { ChartType } from '../../config/reportTemplates'

describe('VisualizationPicker', () => {
  let mockOnChange

  beforeEach(() => {
    mockOnChange = vi.fn()
  })

  it('renders visualization picker with header', () => {
    render(<VisualizationPicker onChange={mockOnChange} />)

    expect(screen.getByText('Choose Visualizations')).toBeInTheDocument()
    expect(screen.getByText('Select chart type for each metric')).toBeInTheDocument()
  })

  it('shows "No metrics selected" message when no metrics provided', () => {
    render(<VisualizationPicker metrics={[]} onChange={mockOnChange} />)

    expect(screen.getByText('No metrics selected. Please select metrics first.')).toBeInTheDocument()
  })

  it('displays metrics list when metrics are provided', () => {
    const metrics = ['completionRate', 'velocity', 'statusDistribution']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Velocity')).toBeInTheDocument()
    expect(screen.getByText('Status Distribution')).toBeInTheDocument()
  })

  it('shows chart types panel when a metric is selected', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
    expect(screen.getByText('Area Chart')).toBeInTheDocument()
    expect(screen.getByText('Scatter Plot')).toBeInTheDocument()
    expect(screen.getByText('Composed Chart')).toBeInTheDocument()
    expect(screen.getByText('Radar Chart')).toBeInTheDocument()
  })

  it('calls onChange when chart type is selected', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const barChartCard = screen.getByText('Bar Chart').closest('div')
    fireEvent.click(barChartCard)

    expect(mockOnChange).toHaveBeenCalledWith({ completionRate: ChartType.BAR })
  })

  it('highlights selected metric in metrics list', () => {
    const metrics = ['completionRate', 'velocity']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const completionRateButton = screen.getByText('Completion Rate').closest('button')
    expect(completionRateButton).toHaveClass('active')
  })

  it('switches active metric when different metric is clicked', () => {
    const metrics = ['completionRate', 'velocity']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const velocityButton = screen.getByText('Velocity').closest('button')
    fireEvent.click(velocityButton)

    expect(velocityButton).toHaveClass('active')
    expect(screen.getByText(/Chart Type for/)).toHaveTextContent('Velocity')
  })

  it('shows selected chart indicator for metrics with visualizations', () => {
    const metrics = ['completionRate']
    const visualizations = { completionRate: ChartType.BAR }

    render(<VisualizationPicker metrics={metrics} visualizations={visualizations} onChange={mockOnChange} />)

    const metricButton = screen.getByText('Completion Rate').closest('button')
    expect(metricButton).toHaveTextContent('📊')
  })

  it('highlights selected chart type', () => {
    const metrics = ['completionRate']
    const visualizations = { completionRate: ChartType.BAR }

    render(<VisualizationPicker metrics={metrics} visualizations={visualizations} onChange={mockOnChange} />)

    const barChartCard = screen.getByText('Bar Chart').closest('div')
    expect(barChartCard).toHaveClass('selected')
  })

  it('shows recommended badge for recommended chart types', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const recommendedBadges = screen.getAllByText('Recommended')
    expect(recommendedBadges.length).toBeGreaterThan(0)
  })

  it('highlights recommended chart types', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const pieChartCard = screen.getByText('Pie Chart').closest('div')
    expect(pieChartCard).toHaveClass('recommended')
  })

  it('displays chart type descriptions', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    expect(screen.getByText('Compare values across categories')).toBeInTheDocument()
    expect(screen.getByText('Show trends over time')).toBeInTheDocument()
    expect(screen.getByText('Display parts of a whole')).toBeInTheDocument()
  })

  it('displays chart type tags', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    expect(screen.getByText('comparisons')).toBeInTheDocument()
    expect(screen.getByText('trends')).toBeInTheDocument()
    expect(screen.getByText('percentages')).toBeInTheDocument()
  })

  it('shows visualization summary', () => {
    const metrics = ['completionRate', 'velocity']
    const visualizations = {
      completionRate: ChartType.BAR,
      velocity: ChartType.LINE,
    }

    render(<VisualizationPicker metrics={metrics} visualizations={visualizations} onChange={mockOnChange} />)

    expect(screen.getByText('Summary')).toBeInTheDocument()

    const summarySection = screen.getByText('Summary').parentElement
    expect(summarySection).toHaveTextContent('Completion Rate')
    expect(summarySection).toHaveTextContent('Bar Chart')
    expect(summarySection).toHaveTextContent('Velocity')
    expect(summarySection).toHaveTextContent('Line Chart')
  })

  it('shows "Not selected" in summary for metrics without visualizations', () => {
    const metrics = ['completionRate', 'velocity']
    const visualizations = { completionRate: ChartType.BAR }

    render(<VisualizationPicker metrics={metrics} visualizations={visualizations} onChange={mockOnChange} />)

    const summarySection = screen.getByText('Summary').parentElement
    expect(summarySection).toHaveTextContent('Not selected')
  })

  it('allows keyboard navigation for chart type selection', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const barChartCard = screen.getByText('Bar Chart').closest('div')
    fireEvent.keyDown(barChartCard, { key: 'Enter' })

    expect(mockOnChange).toHaveBeenCalledWith({ completionRate: ChartType.BAR })
  })

  it('handles space key for chart type selection', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const barChartCard = screen.getByText('Bar Chart').closest('div')
    fireEvent.keyDown(barChartCard, { key: ' ' })

    expect(mockOnChange).toHaveBeenCalledWith({ completionRate: ChartType.BAR })
  })

  it('updates visualization for multiple metrics', () => {
    const metrics = ['completionRate', 'velocity']
    const { rerender } = render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const barChartCard = screen.getByText('Bar Chart').closest('div')
    fireEvent.click(barChartCard)

    expect(mockOnChange).toHaveBeenCalledWith({ completionRate: ChartType.BAR })

    mockOnChange.mockClear()
    rerender(
      <VisualizationPicker
        metrics={metrics}
        visualizations={{ completionRate: ChartType.BAR }}
        onChange={mockOnChange}
      />
    )

    const velocityButton = screen.getByText('Velocity').closest('button')
    fireEvent.click(velocityButton)

    const lineChartCard = screen.getByText('Line Chart').closest('div')
    fireEvent.click(lineChartCard)

    expect(mockOnChange).toHaveBeenCalledWith({
      completionRate: ChartType.BAR,
      velocity: ChartType.LINE,
    })
  })

  it('formats metric names correctly', () => {
    const metrics = ['statusDistribution', 'categoryBreakdown']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    expect(screen.getByText('Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Category Breakdown')).toBeInTheDocument()
  })

  it('shows selected badge on selected chart type', () => {
    const metrics = ['completionRate']
    const visualizations = { completionRate: ChartType.BAR }

    render(<VisualizationPicker metrics={metrics} visualizations={visualizations} onChange={mockOnChange} />)

    const selectedBadges = screen.getAllByText('✓')
    expect(selectedBadges.length).toBeGreaterThan(0)
  })

  it('displays all available chart types', () => {
    const metrics = ['completionRate']
    render(<VisualizationPicker metrics={metrics} onChange={mockOnChange} />)

    const chartTypes = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Area Chart', 'Scatter Plot', 'Composed Chart', 'Radar Chart']

    chartTypes.forEach((chartType) => {
      expect(screen.getByText(chartType)).toBeInTheDocument()
    })
  })
})
