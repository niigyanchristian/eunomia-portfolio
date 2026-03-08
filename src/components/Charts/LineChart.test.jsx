import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LineChart } from './LineChart'

vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey, name }) => <div data-testid={`line-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}))

describe('LineChart', () => {
  const sampleData = [
    { label: 'Jan', value1: 10, value2: 20 },
    { label: 'Feb', value1: 15, value2: 25 },
    { label: 'Mar', value1: 20, value2: 30 }
  ]

  const sampleLines = [
    { dataKey: 'value1', name: 'Series 1', color: '#3b82f6' },
    { dataKey: 'value2', name: 'Series 2', color: '#8b5cf6' }
  ]

  it('renders chart with data', () => {
    render(<LineChart data={sampleData} lines={sampleLines} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders all line series', () => {
    render(<LineChart data={sampleData} lines={sampleLines} />)
    expect(screen.getByTestId('line-value1')).toBeInTheDocument()
    expect(screen.getByTestId('line-value2')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<LineChart loading={true} />)
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<LineChart error="Failed to load data" />)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<LineChart data={[]} lines={sampleLines} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders grid when showGrid is true', () => {
    render(<LineChart data={sampleData} lines={sampleLines} showGrid={true} />)
    expect(screen.getByTestId('grid')).toBeInTheDocument()
  })

  it('renders legend when showLegend is true', () => {
    render(<LineChart data={sampleData} lines={sampleLines} showLegend={true} />)
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('applies custom colors to lines', () => {
    const customColors = ['#ff0000', '#00ff00']
    render(<LineChart data={sampleData} lines={sampleLines} colors={customColors} />)
    expect(screen.getByTestId('line-value1')).toBeInTheDocument()
    expect(screen.getByTestId('line-value2')).toBeInTheDocument()
  })

  it('uses custom xKey for x-axis', () => {
    const data = [
      { month: 'January', count: 10 },
      { month: 'February', count: 15 }
    ]
    render(<LineChart data={data} xKey="month" lines={[{ dataKey: 'count' }]} />)
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
  })
})
