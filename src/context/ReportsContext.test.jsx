import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReportsProvider, useReports } from './ReportsContext'
import { ExportFormat, ScheduleFrequency } from '../types/reports'

const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage })

function makeProject(overrides = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: 'Test Project',
    description: '',
    category: 'Web',
    status: 'published',
    customTags: [],
    projectType: 'personal',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    completionDate: '2026-06-01',
    ...overrides,
  }
}

const testProjects = [
  makeProject({ title: 'Project A', category: 'Web', status: 'published' }),
  makeProject({ title: 'Project B', category: 'Mobile', status: 'draft' }),
]

function wrapper({ children }) {
  return <ReportsProvider projects={testProjects}>{children}</ReportsProvider>
}

describe('ReportsContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('provides available templates', () => {
    const { result } = renderHook(() => useReports(), { wrapper })
    expect(result.current.availableTemplates).toBeDefined()
    expect(result.current.availableTemplates.length).toBeGreaterThan(0)
  })

  it('starts with empty custom reports', () => {
    const { result } = renderHook(() => useReports(), { wrapper })
    expect(result.current.customReports).toEqual([])
  })

  it('starts with empty schedules', () => {
    const { result } = renderHook(() => useReports(), { wrapper })
    expect(result.current.schedules).toEqual([])
  })

  describe('generateReport', () => {
    it('generates a report from a template', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary', { title: 'Q1 Report' })
      })

      expect(report).toBeDefined()
      expect(report.title).toBe('Q1 Report')
      expect(report.status).toBe('generated')
      expect(report.data).toBeDefined()
      expect(result.current.customReports).toHaveLength(1)
    })

    it('persists generated reports to localStorage', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      act(() => {
        result.current.generateReport('executive-summary')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('createCustomReport', () => {
    it('creates a custom report with config', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.createCustomReport({
          title: 'My Custom Report',
          metrics: ['totalProjects', 'completionRate'],
          filters: { category: 'Web' },
        })
      })

      expect(report.title).toBe('My Custom Report')
      expect(report.templateType).toBe('custom')
      expect(report.data.summary.totalProjects).toBe(1) // filtered to Web only
    })
  })

  describe('exportReport', () => {
    it('adds export to queue for valid report and format', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      let exportItem
      act(() => {
        exportItem = result.current.exportReport(report.id, ExportFormat.PDF)
      })

      expect(exportItem.format).toBe('pdf')
      expect(exportItem.status).toBe('queued')
      expect(result.current.exportQueue).toHaveLength(1)
    })

    it('throws for nonexistent report', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      expect(() => {
        result.current.exportReport('nonexistent', ExportFormat.PDF)
      }).toThrow('Report with id nonexistent not found')
    })

    it('throws for invalid format', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      expect(() => {
        result.current.exportReport(report.id, 'invalid-format')
      }).toThrow('Invalid export format')
    })
  })

  describe('scheduleReport', () => {
    it('creates a schedule for a report', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      let schedule
      act(() => {
        schedule = result.current.scheduleReport(
          report.id,
          { frequency: ScheduleFrequency.WEEKLY },
          ['user@example.com']
        )
      })

      expect(schedule.reportId).toBe(report.id)
      expect(schedule.frequency).toBe('weekly')
      expect(schedule.stakeholders).toEqual(['user@example.com'])
      expect(result.current.schedules).toHaveLength(1)
    })

    it('throws for nonexistent report', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      expect(() => {
        result.current.scheduleReport('nonexistent', { frequency: 'weekly' })
      }).toThrow('Report with id nonexistent not found')
    })
  })

  describe('getReportData', () => {
    it('returns report data for existing report', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      const data = result.current.getReportData(report.id)
      expect(data).toBeDefined()
      expect(data.templateId).toBe('executive-summary')
    })

    it('returns null for nonexistent report', () => {
      const { result } = renderHook(() => useReports(), { wrapper })
      expect(result.current.getReportData('nonexistent')).toBeNull()
    })
  })

  describe('deleteReport', () => {
    it('removes a report and its schedules', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      act(() => {
        result.current.scheduleReport(report.id, { frequency: 'weekly' })
      })

      act(() => {
        result.current.deleteReport(report.id)
      })

      expect(result.current.customReports).toHaveLength(0)
      expect(result.current.schedules).toHaveLength(0)
    })
  })

  describe('deleteSchedule', () => {
    it('removes a schedule', () => {
      const { result } = renderHook(() => useReports(), { wrapper })

      let report
      act(() => {
        report = result.current.generateReport('executive-summary')
      })

      let schedule
      act(() => {
        schedule = result.current.scheduleReport(report.id, { frequency: 'weekly' })
      })

      act(() => {
        result.current.deleteSchedule(schedule.id)
      })

      expect(result.current.schedules).toHaveLength(0)
    })
  })

  it('throws when useReports is used outside provider', () => {
    expect(() => {
      renderHook(() => useReports())
    }).toThrow('useReports must be used within a ReportsProvider')
  })
})
