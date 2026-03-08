import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MetricsSelector from './MetricsSelector'

describe('MetricsSelector', () => {
  let mockOnChange

  beforeEach(() => {
    mockOnChange = vi.fn()
  })

  it('renders metrics selector with header', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Select Metrics')).toBeInTheDocument()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })

  it('displays metric categories', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Financial')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Distribution')).toBeInTheDocument()
  })

  it('displays available metrics in each category', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument()
    expect(screen.getByText('Velocity')).toBeInTheDocument()
    expect(screen.getByText('Quality Metrics')).toBeInTheDocument()
  })

  it('shows metric descriptions', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Total number of projects in portfolio')).toBeInTheDocument()
    expect(screen.getByText('Percentage of completed projects')).toBeInTheDocument()
  })

  it('calls onChange when metric is selected', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    const completionRateCheckbox = screen.getByLabelText('Completion Rate', { exact: false })
    fireEvent.click(completionRateCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith(['completionRate'])
  })

  it('updates selected count when metrics are selected', () => {
    const { rerender } = render(<MetricsSelector selectedMetrics={[]} onChange={mockOnChange} />)

    expect(screen.getByText('0 selected')).toBeInTheDocument()

    rerender(<MetricsSelector selectedMetrics={['completionRate', 'velocity']} onChange={mockOnChange} />)

    expect(screen.getByText('2 selected')).toBeInTheDocument()
  })

  it('shows selected metrics in the right panel', () => {
    render(<MetricsSelector selectedMetrics={['completionRate', 'velocity']} onChange={mockOnChange} />)

    const selectedPanel = screen.getByText('Selected Metrics (Drag to reorder)').parentElement
    expect(selectedPanel).toHaveTextContent('Completion Rate')
    expect(selectedPanel).toHaveTextContent('Velocity')
  })

  it('shows "No metrics selected" message when no metrics are selected', () => {
    render(<MetricsSelector selectedMetrics={[]} onChange={mockOnChange} />)

    expect(screen.getByText('No metrics selected. Choose from the left.')).toBeInTheDocument()
  })

  it('removes metric when remove button is clicked', () => {
    render(<MetricsSelector selectedMetrics={['completionRate', 'velocity']} onChange={mockOnChange} />)

    const removeButtons = screen.getAllByLabelText('Remove metric')
    fireEvent.click(removeButtons[0])

    expect(mockOnChange).toHaveBeenCalledWith(['velocity'])
  })

  it('toggles metric selection', () => {
    const { rerender } = render(<MetricsSelector selectedMetrics={['completionRate']} onChange={mockOnChange} />)

    const completionRateCheckbox = screen.getByLabelText('Completion Rate', { exact: false })
    fireEvent.click(completionRateCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith([])

    rerender(<MetricsSelector selectedMetrics={[]} onChange={mockOnChange} />)

    fireEvent.click(completionRateCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith(['completionRate'])
  })

  it('highlights selected metrics in available list', () => {
    render(<MetricsSelector selectedMetrics={['completionRate']} onChange={mockOnChange} />)

    const completionRateItem = screen.getByLabelText('Completion Rate', { exact: false }).closest('label')
    expect(completionRateItem).toHaveClass('selected')
  })

  it('displays category tags for selected metrics', () => {
    render(<MetricsSelector selectedMetrics={['completionRate', 'budgetUtilization']} onChange={mockOnChange} />)

    const selectedPanel = screen.getByText('Selected Metrics (Drag to reorder)').parentElement
    expect(selectedPanel).toHaveTextContent('Performance')
    expect(selectedPanel).toHaveTextContent('Financial')
  })

  it('shows drag handle for selected metrics', () => {
    render(<MetricsSelector selectedMetrics={['completionRate']} onChange={mockOnChange} />)

    const selectedPanel = screen.getByText('Selected Metrics (Drag to reorder)').parentElement
    expect(selectedPanel).toHaveTextContent('☰')
  })

  it('allows multiple metrics to be selected', () => {
    const { rerender } = render(<MetricsSelector selectedMetrics={[]} onChange={mockOnChange} />)

    const completionRateCheckbox = screen.getByLabelText('Completion Rate', { exact: false })

    fireEvent.click(completionRateCheckbox)
    expect(mockOnChange).toHaveBeenCalledWith(['completionRate'])

    mockOnChange.mockClear()
    rerender(<MetricsSelector selectedMetrics={['completionRate']} onChange={mockOnChange} />)

    const velocityCheckbox = screen.getByLabelText('Velocity', { exact: false })
    fireEvent.click(velocityCheckbox)
    expect(mockOnChange).toHaveBeenCalledWith(['completionRate', 'velocity'])
  })

  it('renders all metric categories correctly', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    const categories = ['Financial', 'Performance', 'Quality', 'Timeline', 'Distribution']

    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument()
    })
  })

  it('displays financial metrics', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument()
    expect(screen.getByText('Total Cost')).toBeInTheDocument()
    expect(screen.getByText('Cost Breakdown')).toBeInTheDocument()
  })

  it('displays performance metrics', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Velocity')).toBeInTheDocument()
    expect(screen.getByText('Throughput')).toBeInTheDocument()
    expect(screen.getByText('Cycle Time')).toBeInTheDocument()
  })

  it('displays quality metrics', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Quality Metrics')).toBeInTheDocument()
    expect(screen.getByText('Defect Rate')).toBeInTheDocument()
    expect(screen.getByText('Test Coverage')).toBeInTheDocument()
    expect(screen.getByText('Code Quality')).toBeInTheDocument()
  })

  it('displays timeline metrics', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Trend Data')).toBeInTheDocument()
    expect(screen.getByText('Schedule Adherence')).toBeInTheDocument()
    expect(screen.getByText('Milestone Progress')).toBeInTheDocument()
  })

  it('displays distribution metrics', () => {
    render(<MetricsSelector onChange={mockOnChange} />)

    expect(screen.getByText('Category Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Published Count')).toBeInTheDocument()
    expect(screen.getByText('Draft Count')).toBeInTheDocument()
  })
})
