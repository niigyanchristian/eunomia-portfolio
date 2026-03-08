import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataTable } from './DataTable'
import * as XLSX from 'xlsx'

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn()
  },
  writeFile: vi.fn()
}))

describe('DataTable', () => {
  const sampleData = [
    { id: 1, name: 'Project A', status: 'published', count: 10 },
    { id: 2, name: 'Project B', status: 'draft', count: 5 },
    { id: 3, name: 'Project C', status: 'published', count: 15 }
  ]

  const sampleColumns = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'status', label: 'Status', sortable: true, filterable: true },
    { key: 'count', label: 'Count', sortable: true, filterable: false }
  ]

  it('renders table with data', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    expect(screen.getByText('Project A')).toBeInTheDocument()
    expect(screen.getByText('Project B')).toBeInTheDocument()
    expect(screen.getByText('Project C')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<DataTable loading={true} />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<DataTable error="Failed to load" />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={sampleColumns} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('displays row count', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={10} />)
    expect(screen.getByText(/Showing 3 of 3 rows/)).toBeInTheDocument()
  })

  it('sorts data when clicking sortable column header', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('reverses sort direction on second click', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)
    fireEvent.click(nameHeader)
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('filters data when typing in filter input', async () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    const filterInputs = screen.getAllByPlaceholderText('Filter...')
    const nameFilter = filterInputs[0]

    fireEvent.change(nameFilter, { target: { value: 'Project A' } })

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument()
      expect(screen.queryByText('Project B')).not.toBeInTheDocument()
    })
  })

  it('shows pagination when data exceeds page size', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={2} />)
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('navigates to next page', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={2} />)
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('navigates to previous page', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={2} />)
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    const prevButton = screen.getByText('Previous')
    fireEvent.click(prevButton)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={2} />)
    const prevButton = screen.getByText('Previous')
    expect(prevButton).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={2} />)
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    expect(nextButton).toBeDisabled()
  })

  it('renders Export CSV button', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('renders Export Excel button', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    expect(screen.getByText('Export Excel')).toBeInTheDocument()
  })

  it('exports to Excel when clicking Export Excel', () => {
    render(<DataTable data={sampleData} columns={sampleColumns} />)
    const exportButton = screen.getByText('Export Excel')
    fireEvent.click(exportButton)
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled()
  })

  it('uses custom render function for column', () => {
    const customColumns = [
      {
        key: 'count',
        label: 'Count',
        render: (value) => `Total: ${value}`
      }
    ]
    render(<DataTable data={sampleData} columns={customColumns} />)
    expect(screen.getByText('Total: 10')).toBeInTheDocument()
  })

  it('resets to page 1 when filtering', async () => {
    render(<DataTable data={sampleData} columns={sampleColumns} pageSize={1} />)
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    const filterInputs = screen.getAllByPlaceholderText('Filter...')
    fireEvent.change(filterInputs[0], { target: { value: 'Project' } })

    await waitFor(() => {
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    })
  })
})
