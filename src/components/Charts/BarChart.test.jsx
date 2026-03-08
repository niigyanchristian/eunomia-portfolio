import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart } from './BarChart'

vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey, name }) => <div data-testid={`bar-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}))

describe('BarChart', () => {
  const sampleData = [
    { label: 'Category A', value: 30 },
    { label: 'Category B', value: 45 },
    { label: 'Category C', value: 20 }
  ]

  const sampleBars = [
    { dataKey: 'value', name: 'Count', color: '#3b82f6' }
  ]

  it('renders chart with data', () => {
    render(<BarChart data={sampleData} bars={sampleBars} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders all bar series', () => {
    render(<BarChart data={sampleData} bars={sampleBars} />)
    expect(screen.getByTestId('bar-value')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<BarChart loading={true} />)
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<BarChart error="Data unavailable" />)
    expect(screen.getByText('Data unavailable')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<BarChart data={[]} bars={sampleBars} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders grid when showGrid is true', () => {
    render(<BarChart data={sampleData} bars={sampleBars} showGrid={true} />)
    expect(screen.getByTestId('grid')).toBeInTheDocument()
  })

  it('renders legend when showLegend is true', () => {
    render(<BarChart data={sampleData} bars={sampleBars} showLegend={true} />)
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders multiple bars', () => {
    const multiBars = [
      { dataKey: 'value1', name: 'Series 1' },
      { dataKey: 'value2', name: 'Series 2' }
    ]
    const multiData = [
      { label: 'A', value1: 10, value2: 20 },
      { label: 'B', value1: 15, value2: 25 }
    ]
    render(<BarChart data={multiData} bars={multiBars} />)
    expect(screen.getByTestId('bar-value1')).toBeInTheDocument()
    expect(screen.getByTestId('bar-value2')).toBeInTheDocument()
  })

  it('applies default colors when not specified', () => {
    render(<BarChart data={sampleData} bars={sampleBars} />)
    expect(screen.getByTestId('bar-value')).toBeInTheDocument()
  })
})
