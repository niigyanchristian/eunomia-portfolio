import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsCard } from './MetricsCard'

describe('MetricsCard', () => {
  it('renders metric title and value', () => {
    render(<MetricsCard title="Total Projects" value={42} type="count" />)
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(<MetricsCard title="Revenue" value={50000} type="currency" />)
    expect(screen.getByText('$50,000')).toBeInTheDocument()
  })

  it('formats percentage values correctly', () => {
    render(<MetricsCard title="Completion Rate" value={75.5} type="percentage" />)
    expect(screen.getByText('75.5%')).toBeInTheDocument()
  })

  it('formats decimal values correctly', () => {
    render(<MetricsCard title="Average Score" value={3.14159} type="decimal" />)
    expect(screen.getByText('3.14')).toBeInTheDocument()
  })

  it('displays YoY comparison when provided', () => {
    render(<MetricsCard title="Projects" value={100} yoyChange={15.5} />)
    expect(screen.getByText('15.5%')).toBeInTheDocument()
    expect(screen.getByText('YoY')).toBeInTheDocument()
  })

  it('displays QoQ comparison when provided', () => {
    render(<MetricsCard title="Projects" value={100} qoqChange={-5.2} />)
    expect(screen.getByText('5.2%')).toBeInTheDocument()
    expect(screen.getByText('QoQ')).toBeInTheDocument()
  })

  it('shows positive change indicator for positive YoY', () => {
    render(<MetricsCard title="Projects" value={100} yoyChange={10} />)
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('shows negative change indicator for negative YoY', () => {
    render(<MetricsCard title="Projects" value={100} yoyChange={-10} />)
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('shows neutral change indicator for zero change', () => {
    render(<MetricsCard title="Projects" value={100} yoyChange={0} />)
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('displays both YoY and QoQ when provided', () => {
    render(<MetricsCard title="Projects" value={100} yoyChange={15} qoqChange={-5} />)
    expect(screen.getByText('YoY')).toBeInTheDocument()
    expect(screen.getByText('QoQ')).toBeInTheDocument()
  })

  it('applies positive trend class', () => {
    const { container } = render(<MetricsCard title="Projects" value={100} trend="positive" />)
    expect(container.querySelector('.trend-positive')).toBeInTheDocument()
  })

  it('applies negative trend class', () => {
    const { container } = render(<MetricsCard title="Projects" value={100} trend="negative" />)
    expect(container.querySelector('.trend-negative')).toBeInTheDocument()
  })

  it('applies neutral trend class', () => {
    const { container } = render(<MetricsCard title="Projects" value={100} trend="neutral" />)
    expect(container.querySelector('.trend-neutral')).toBeInTheDocument()
  })

  it('handles null value', () => {
    render(<MetricsCard title="Projects" value={null} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('handles undefined value', () => {
    render(<MetricsCard title="Projects" value={undefined} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    render(<MetricsCard title="Projects" value={100} icon="📊" />)
    expect(screen.getByText('📊')).toBeInTheDocument()
  })
})
