import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AreaChart } from './AreaChart'

vi.mock('recharts', () => ({
  AreaChart: ({ children, data }) => <div data-testid="area-chart">{children}</div>,
  Area: ({ dataKey, name }) => <div data-testid={`area-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}))

describe('AreaChart', () => {
  const sampleData = [
    { label: 'Q1', revenue: 100, expenses: 80 },
    { label: 'Q2', revenue: 150, expenses: 90 },
    { label: 'Q3', revenue: 200, expenses: 110 }
  ]

  const sampleAreas = [
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
    { dataKey: 'expenses', name: 'Expenses', color: '#ef4444' }
  ]

  it('renders chart with data', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders all area series', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} />)
    expect(screen.getByTestId('area-revenue')).toBeInTheDocument()
    expect(screen.getByTestId('area-expenses')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<AreaChart loading={true} />)
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<AreaChart error="Unable to render chart" />)
    expect(screen.getByText('Unable to render chart')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<AreaChart data={[]} areas={sampleAreas} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders grid when showGrid is true', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} showGrid={true} />)
    expect(screen.getByTestId('grid')).toBeInTheDocument()
  })

  it('renders legend when showLegend is true', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} showLegend={true} />)
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('applies custom colors to areas', () => {
    const customColors = ['#ff0000', '#00ff00']
    render(<AreaChart data={sampleData} areas={sampleAreas} colors={customColors} />)
    expect(screen.getByTestId('area-revenue')).toBeInTheDocument()
    expect(screen.getByTestId('area-expenses')).toBeInTheDocument()
  })

  it('uses custom xKey for x-axis', () => {
    const data = [
      { period: 'Jan', value: 10 },
      { period: 'Feb', value: 15 }
    ]
    render(<AreaChart data={data} xKey="period" areas={[{ dataKey: 'value' }]} />)
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
  })

  it('renders single area', () => {
    const singleArea = [{ dataKey: 'revenue', name: 'Revenue' }]
    render(<AreaChart data={sampleData} areas={singleArea} />)
    expect(screen.getByTestId('area-revenue')).toBeInTheDocument()
  })

  it('handles stacked mode', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} stacked={true} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('handles non-stacked mode', () => {
    render(<AreaChart data={sampleData} areas={sampleAreas} stacked={false} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })
})
