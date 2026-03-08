import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComposedChart } from './ComposedChart'

vi.mock('recharts', () => ({
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Line: ({ dataKey, name }) => <div data-testid={`line-${dataKey}`}>{name}</div>,
  Bar: ({ dataKey, name }) => <div data-testid={`bar-${dataKey}`}>{name}</div>,
  Area: ({ dataKey, name }) => <div data-testid={`area-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}))

describe('ComposedChart', () => {
  const sampleData = [
    { label: 'Jan', sales: 100, target: 120, growth: 5 },
    { label: 'Feb', sales: 150, target: 140, growth: 10 },
    { label: 'Mar', sales: 200, target: 180, growth: 15 }
  ]

  const sampleElements = [
    { type: 'bar', dataKey: 'sales', name: 'Sales', color: '#3b82f6' },
    { type: 'line', dataKey: 'target', name: 'Target', color: '#ef4444' },
    { type: 'area', dataKey: 'growth', name: 'Growth', color: '#10b981' }
  ]

  it('renders chart with data', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} />)
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders bar elements', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
  })

  it('renders line elements', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} />)
    expect(screen.getByTestId('line-target')).toBeInTheDocument()
  })

  it('renders area elements', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} />)
    expect(screen.getByTestId('area-growth')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ComposedChart loading={true} />)
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<ComposedChart error="Chart rendering failed" />)
    expect(screen.getByText('Chart rendering failed')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<ComposedChart data={[]} elements={sampleElements} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders grid when showGrid is true', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} showGrid={true} />)
    expect(screen.getByTestId('grid')).toBeInTheDocument()
  })

  it('renders legend when showLegend is true', () => {
    render(<ComposedChart data={sampleData} elements={sampleElements} showLegend={true} />)
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('applies custom colors to elements', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    render(<ComposedChart data={sampleData} elements={sampleElements} colors={customColors} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
    expect(screen.getByTestId('line-target')).toBeInTheDocument()
    expect(screen.getByTestId('area-growth')).toBeInTheDocument()
  })

  it('uses custom xKey for x-axis', () => {
    const data = [
      { month: 'January', value: 10 },
      { month: 'February', value: 15 }
    ]
    const elements = [{ type: 'line', dataKey: 'value' }]
    render(<ComposedChart data={data} xKey="month" elements={elements} />)
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
  })

  it('renders only bars when only bar elements provided', () => {
    const barElements = [{ type: 'bar', dataKey: 'sales', name: 'Sales' }]
    render(<ComposedChart data={sampleData} elements={barElements} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
    expect(screen.queryByTestId('line-sales')).not.toBeInTheDocument()
  })

  it('renders only lines when only line elements provided', () => {
    const lineElements = [{ type: 'line', dataKey: 'target', name: 'Target' }]
    render(<ComposedChart data={sampleData} elements={lineElements} />)
    expect(screen.getByTestId('line-target')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-target')).not.toBeInTheDocument()
  })

  it('handles elements without explicit colors', () => {
    const elementsWithoutColors = [
      { type: 'bar', dataKey: 'sales', name: 'Sales' },
      { type: 'line', dataKey: 'target', name: 'Target' }
    ]
    render(<ComposedChart data={sampleData} elements={elementsWithoutColors} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
    expect(screen.getByTestId('line-target')).toBeInTheDocument()
  })

  it('handles elements without explicit names', () => {
    const elementsWithoutNames = [
      { type: 'bar', dataKey: 'sales' },
      { type: 'line', dataKey: 'target' }
    ]
    render(<ComposedChart data={sampleData} elements={elementsWithoutNames} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
    expect(screen.getByTestId('line-target')).toBeInTheDocument()
  })

  it('renders multiple elements of same type', () => {
    const multiBarElements = [
      { type: 'bar', dataKey: 'sales', name: 'Sales' },
      { type: 'bar', dataKey: 'target', name: 'Target' }
    ]
    render(<ComposedChart data={sampleData} elements={multiBarElements} />)
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument()
    expect(screen.getByTestId('bar-target')).toBeInTheDocument()
  })
})
