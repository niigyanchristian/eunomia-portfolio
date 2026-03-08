import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PieChart } from './PieChart'

vi.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}))

describe('PieChart', () => {
  const sampleData = [
    { name: 'Category A', value: 30 },
    { name: 'Category B', value: 45 },
    { name: 'Category C', value: 25 }
  ]

  it('renders chart with data', () => {
    render(<PieChart data={sampleData} />)
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders pie element', () => {
    render(<PieChart data={sampleData} />)
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PieChart loading={true} />)
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<PieChart error="Chart error" />)
    expect(screen.getByText('Chart error')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<PieChart data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders legend when showLegend is true', () => {
    render(<PieChart data={sampleData} showLegend={true} />)
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('uses custom dataKey and nameKey', () => {
    const customData = [
      { category: 'A', count: 10 },
      { category: 'B', count: 20 }
    ]
    render(<PieChart data={customData} dataKey="count" nameKey="category" />)
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  it('renders cells for each data item', () => {
    render(<PieChart data={sampleData} />)
    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(sampleData.length)
  })

  it('applies custom colors', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    render(<PieChart data={sampleData} colors={customColors} />)
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })
})
