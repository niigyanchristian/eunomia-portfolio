import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportButton } from './ExportButton'

vi.mock('../../services/exportService', () => ({
  exportToPDF: vi.fn(() => Promise.resolve(new Blob(['pdf']))),
  exportToExcel: vi.fn(() => new Blob(['excel'])),
  exportToPowerPoint: vi.fn(() => Promise.resolve(new Blob(['pptx']))),
  downloadBlob: vi.fn(),
}))

import { exportToPDF, exportToExcel, exportToPowerPoint, downloadBlob } from '../../services/exportService'

const sampleReportData = {
  templateName: 'Test Report',
  generatedAt: '2026-01-15T10:00:00.000Z',
  config: { title: 'Test' },
  summary: { totalProjects: 10 },
  metrics: { totalProjects: 10 },
}

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the export button', () => {
    render(<ExportButton reportData={sampleReportData} />)
    expect(screen.getByText('Export Report')).toBeInTheDocument()
  })

  it('should be disabled when no report data is provided', () => {
    render(<ExportButton reportData={null} />)
    expect(screen.getByText('Export Report')).toBeDisabled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ExportButton reportData={sampleReportData} disabled />)
    expect(screen.getByText('Export Report')).toBeDisabled()
  })

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton reportData={sampleReportData} />)

    await user.click(screen.getByText('Export Report'))

    expect(screen.getByText('PDF Document')).toBeInTheDocument()
    expect(screen.getByText('Excel Spreadsheet')).toBeInTheDocument()
    expect(screen.getByText('PowerPoint Presentation')).toBeInTheDocument()
  })

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ExportButton reportData={sampleReportData} />
        <button>Outside</button>
      </div>
    )

    await user.click(screen.getByText('Export Report'))
    expect(screen.getByText('PDF Document')).toBeInTheDocument()

    await user.click(screen.getByText('Outside'))
    expect(screen.queryByText('PDF Document')).not.toBeInTheDocument()
  })

  it('should export PDF when PDF option is clicked', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ExportButton reportData={sampleReportData} onExportComplete={onComplete} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('PDF Document'))

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalledWith(sampleReportData, {})
      expect(downloadBlob).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith('pdf', expect.any(String))
    })
  })

  it('should export Excel when Excel option is clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton reportData={sampleReportData} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('Excel Spreadsheet'))

    await waitFor(() => {
      expect(exportToExcel).toHaveBeenCalledWith(sampleReportData, {})
      expect(downloadBlob).toHaveBeenCalled()
    })
  })

  it('should export PowerPoint when PPT option is clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton reportData={sampleReportData} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('PowerPoint Presentation'))

    await waitFor(() => {
      expect(exportToPowerPoint).toHaveBeenCalledWith(sampleReportData, {})
      expect(downloadBlob).toHaveBeenCalled()
    })
  })

  it('should show success message after export', async () => {
    const user = userEvent.setup()
    render(<ExportButton reportData={sampleReportData} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('PDF Document'))

    await waitFor(() => {
      expect(screen.getByText('PDF Document exported successfully')).toBeInTheDocument()
    })
  })

  it('should show error message on export failure', async () => {
    exportToPDF.mockRejectedValueOnce(new Error('PDF generation failed'))
    const onError = vi.fn()
    const user = userEvent.setup()

    render(<ExportButton reportData={sampleReportData} onExportError={onError} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('PDF Document'))

    await waitFor(() => {
      expect(screen.getByText('PDF generation failed')).toBeInTheDocument()
      expect(onError).toHaveBeenCalledWith('pdf', expect.any(Error))
    })
  })

  it('should call onExportStart callback', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<ExportButton reportData={sampleReportData} onExportStart={onStart} />)

    await user.click(screen.getByText('Export Report'))
    await user.click(screen.getByText('PDF Document'))

    await waitFor(() => {
      expect(onStart).toHaveBeenCalledWith('pdf')
    })
  })
})
