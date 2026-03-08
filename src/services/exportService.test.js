import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToPDF, exportToExcel, exportToPowerPoint, downloadBlob } from './exportService'

vi.mock('jspdf', () => {
  function MockJsPDF() {
    this.internal = {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
      getNumberOfPages: () => 1,
    }
    this.setFillColor = vi.fn()
    this.rect = vi.fn()
    this.setTextColor = vi.fn()
    this.setFontSize = vi.fn()
    this.setFont = vi.fn()
    this.text = vi.fn()
    this.addPage = vi.fn()
    this.setPage = vi.fn()
    this.addImage = vi.fn()
    this.output = vi.fn(() => new Blob(['pdf content'], { type: 'application/pdf' }))
    this.autoTable = vi.fn()
    this.lastAutoTable = { finalY: 100 }
  }
  return {
    jsPDF: MockJsPDF,
  }
})

vi.mock('jspdf-autotable', () => ({}))

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new Uint8Array([1, 2, 3])),
}))

vi.mock('pptxgenjs', () => {
  function MockPptxGenJS() {
    this.layout = ''
    this.author = ''
    this.subject = ''
    this.ShapeType = { rect: 'rect' }
    this.addSlide = vi.fn(() => ({
      addShape: vi.fn(),
      addText: vi.fn(),
      addTable: vi.fn(),
      addImage: vi.fn(),
      addNotes: vi.fn(),
      _slideLayout: null,
    }))
    this.write = vi.fn(() => Promise.resolve(new Blob(['pptx content'])))
  }
  return { default: MockPptxGenJS }
})

const sampleReportData = {
  templateName: 'Executive Summary',
  generatedAt: '2026-01-15T10:00:00.000Z',
  config: { title: 'Q1 Report' },
  summary: {
    totalProjects: 25,
    filteredFrom: 30,
    filtersApplied: 2,
  },
  metrics: {
    totalProjects: 25,
    completionRate: 72.5,
    velocity: 3.2,
    overdueProjects: 3,
    atRiskProjects: 5,
    categoryBreakdown: { 'Web App': 10, 'Mobile': 8, 'API': 7 },
    statusDistribution: { published: 18, draft: 5, archived: 2 },
    timeline: [
      { period: 'Jan 2026', total: 5 },
      { period: 'Feb 2026', total: 8 },
    ],
    recentUpdates: [
      { id: '1', title: 'Project Alpha', status: 'published', updatedAt: '2026-01-10T00:00:00.000Z' },
    ],
    milestones: [
      { id: '2', title: 'Project Beta', completionDate: '2026-03-01T00:00:00.000Z', status: 'draft' },
    ],
  },
  comparisons: {
    yoy: 15.5,
    qoq: -3.2,
    currentPeriod: 25,
    previousYear: 22,
    previousQuarter: 26,
  },
}

describe('exportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportToPDF', () => {
    it('should generate a PDF blob from report data', async () => {
      const result = await exportToPDF(sampleReportData)

      expect(result).toBeInstanceOf(Blob)
    })

    it('should accept configuration options', async () => {
      const result = await exportToPDF(sampleReportData, {
        pageSize: 'letter',
        orientation: 'landscape',
        branding: { name: 'My Company', primaryColor: '#ff0000' },
        dateFormat: 'yyyy-MM-dd',
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should include chart images when provided', async () => {
      const result = await exportToPDF(sampleReportData, {
        chartImages: ['data:image/png;base64,abc123'],
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should filter sections when includeSections is provided', async () => {
      const result = await exportToPDF(sampleReportData, {
        includeSections: ['Key Metrics'],
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should throw when reportData is null', async () => {
      await expect(exportToPDF(null)).rejects.toThrow('Report data is required')
    })

    it('should handle report data with no metrics', async () => {
      const minimalData = {
        templateName: 'Empty Report',
        generatedAt: '2026-01-01T00:00:00.000Z',
        metrics: {},
      }
      const result = await exportToPDF(minimalData)
      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('exportToExcel', () => {
    it('should generate an Excel blob from report data', () => {
      const result = exportToExcel(sampleReportData)

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    })

    it('should throw when reportData is null', () => {
      expect(() => exportToExcel(null)).toThrow('Report data is required')
    })

    it('should filter sections when includeSections is provided', () => {
      const result = exportToExcel(sampleReportData, {
        includeSections: ['Category Breakdown'],
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should handle minimal report data', () => {
      const minimalData = {
        templateName: 'Basic',
        generatedAt: '2026-01-01T00:00:00.000Z',
        metrics: {},
      }
      const result = exportToExcel(minimalData)
      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('exportToPowerPoint', () => {
    it('should generate a PowerPoint blob from report data', async () => {
      const result = await exportToPowerPoint(sampleReportData)

      expect(result).toBeInstanceOf(Blob)
    })

    it('should accept branding configuration', async () => {
      const result = await exportToPowerPoint(sampleReportData, {
        branding: { name: 'Test Corp', primaryColor: '#00ff00' },
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should include chart image slides when provided', async () => {
      const result = await exportToPowerPoint(sampleReportData, {
        chartImages: ['data:image/png;base64,abc123'],
      })

      expect(result).toBeInstanceOf(Blob)
    })

    it('should throw when reportData is null', async () => {
      await expect(exportToPowerPoint(null)).rejects.toThrow('Report data is required')
    })

    it('should handle report data with no comparisons', async () => {
      const dataWithoutComparisons = { ...sampleReportData, comparisons: {} }
      const result = await exportToPowerPoint(dataWithoutComparisons)
      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('downloadBlob', () => {
    it('should create a download link and trigger click', () => {
      const mockClick = vi.fn()
      const mockCreateElement = vi.spyOn(document, 'createElement')
      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
      const mockRevokeObjectURL = vi.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      mockCreateElement.mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
        style: {},
      })

      const blob = new Blob(['test'], { type: 'text/plain' })
      downloadBlob(blob, 'test.txt')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

      mockCreateElement.mockRestore()
      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
    })
  })
})
