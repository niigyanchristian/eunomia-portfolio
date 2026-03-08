import { describe, it, expect } from 'vitest'
import {
  getTemplate,
  applyFilters,
  calculateReportMetrics,
  generateComparisons,
  transformToReportData,
} from './reportGenerator'

function makeProject(overrides = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: 'Test Project',
    description: '',
    category: 'Web',
    status: 'published',
    customTags: ['react'],
    projectType: 'personal',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    completionDate: '2026-06-01',
    ...overrides,
  }
}

describe('getTemplate', () => {
  it('returns the template for a valid id', () => {
    const template = getTemplate('executive-summary')
    expect(template).not.toBeNull()
    expect(template.name).toBe('Executive Summary')
  })

  it('returns null for unknown template id', () => {
    expect(getTemplate('nonexistent')).toBeNull()
  })
})

describe('applyFilters', () => {
  const projects = [
    makeProject({ category: 'Web', status: 'published', customTags: ['react'], projectType: 'personal' }),
    makeProject({ category: 'Mobile', status: 'draft', customTags: ['flutter'], projectType: 'client' }),
    makeProject({ category: 'Web', status: 'draft', customTags: ['react', 'node'], projectType: 'personal' }),
  ]

  it('filters by category', () => {
    const result = applyFilters(projects, { category: 'Web' })
    expect(result).toHaveLength(2)
  })

  it('filters by status', () => {
    const result = applyFilters(projects, { status: 'draft' })
    expect(result).toHaveLength(2)
  })

  it('filters by tags', () => {
    const result = applyFilters(projects, { tags: ['flutter'] })
    expect(result).toHaveLength(1)
  })

  it('filters by project type', () => {
    const result = applyFilters(projects, { projectType: 'client' })
    expect(result).toHaveLength(1)
  })

  it('applies multiple filters together', () => {
    const result = applyFilters(projects, { category: 'Web', status: 'draft' })
    expect(result).toHaveLength(1)
  })

  it('returns all projects with empty filters', () => {
    const result = applyFilters(projects, {})
    expect(result).toHaveLength(3)
  })
})

describe('calculateReportMetrics', () => {
  const projects = [
    makeProject({ status: 'published', category: 'Web', createdAt: '2026-03-01T00:00:00.000Z' }),
    makeProject({ status: 'draft', category: 'Mobile', createdAt: '2026-04-01T00:00:00.000Z' }),
    makeProject({ status: 'published', category: 'Web', createdAt: '2026-05-01T00:00:00.000Z' }),
  ]

  it('calculates totalProjects', () => {
    const metrics = calculateReportMetrics(projects, ['totalProjects'])
    expect(metrics.totalProjects).toBe(3)
  })

  it('calculates completionRate', () => {
    const metrics = calculateReportMetrics(projects, ['completionRate'])
    expect(metrics.completionRate).toBeCloseTo(66.67, 1)
  })

  it('calculates categoryBreakdown', () => {
    const metrics = calculateReportMetrics(projects, ['categoryBreakdown'])
    expect(metrics.categoryBreakdown['Web']).toBe(2)
    expect(metrics.categoryBreakdown['Mobile']).toBe(1)
  })

  it('calculates statusDistribution', () => {
    const metrics = calculateReportMetrics(projects, ['statusDistribution'])
    expect(metrics.statusDistribution['published']).toBe(2)
    expect(metrics.statusDistribution['draft']).toBe(1)
  })

  it('calculates overdueProjects', () => {
    const overdueProject = makeProject({
      status: 'draft',
      completionDate: '2020-01-01',
    })
    const metrics = calculateReportMetrics([...projects, overdueProject], ['overdueProjects'])
    expect(metrics.overdueProjects).toBe(1)
  })

  it('calculates recentUpdates', () => {
    const metrics = calculateReportMetrics(projects, ['recentUpdates'])
    expect(metrics.recentUpdates).toHaveLength(3)
    expect(metrics.recentUpdates[0]).toHaveProperty('id')
    expect(metrics.recentUpdates[0]).toHaveProperty('title')
  })

  it('generates timeline data', () => {
    const metrics = calculateReportMetrics(projects, ['timeline'])
    expect(Array.isArray(metrics.timeline)).toBe(true)
  })

  it('calculates velocity', () => {
    const metrics = calculateReportMetrics(projects, ['velocity'])
    expect(typeof metrics.velocity).toBe('number')
    expect(metrics.velocity).toBeGreaterThan(0)
  })

  it('filters by date range when provided', () => {
    const metrics = calculateReportMetrics(projects, ['totalProjects'], {
      start: '2026-03-01',
      end: '2026-03-31',
    })
    expect(metrics.totalProjects).toBe(1)
  })
})

describe('generateComparisons', () => {
  const projects = [
    makeProject({ createdAt: '2026-03-01T00:00:00.000Z' }),
    makeProject({ createdAt: '2026-04-01T00:00:00.000Z' }),
    makeProject({ createdAt: '2025-03-01T00:00:00.000Z' }),
  ]

  it('returns empty object when no date range', () => {
    const result = generateComparisons(projects, {})
    expect(result).toEqual({})
  })

  it('returns yoy and qoq comparisons with date range', () => {
    const result = generateComparisons(projects, {
      start: '2026-01-01',
      end: '2026-06-30',
    })
    expect(result).toHaveProperty('yoy')
    expect(result).toHaveProperty('qoq')
    expect(result).toHaveProperty('currentPeriod')
    expect(typeof result.yoy).toBe('number')
  })
})

describe('transformToReportData', () => {
  const projects = [
    makeProject({ category: 'Web', status: 'published' }),
    makeProject({ category: 'Mobile', status: 'draft' }),
  ]

  it('transforms data using a template', () => {
    const result = transformToReportData(projects, {
      templateId: 'executive-summary',
    })
    expect(result.templateId).toBe('executive-summary')
    expect(result.templateName).toBe('Executive Summary')
    expect(result.summary.totalProjects).toBe(2)
    expect(result.metrics).toHaveProperty('totalProjects')
  })

  it('applies filters during transformation', () => {
    const result = transformToReportData(projects, {
      templateId: 'executive-summary',
      filters: { category: 'Web' },
    })
    expect(result.summary.totalProjects).toBe(1)
    expect(result.summary.filteredFrom).toBe(2)
    expect(result.summary.filtersApplied).toBe(1)
  })

  it('uses custom metrics when provided', () => {
    const result = transformToReportData(projects, {
      templateId: 'executive-summary',
      metrics: ['totalProjects', 'statusDistribution'],
    })
    expect(result.metrics).toHaveProperty('totalProjects')
    expect(result.metrics).toHaveProperty('statusDistribution')
  })

  it('uses "Custom Report" name when no template found', () => {
    const result = transformToReportData(projects, {
      templateId: 'nonexistent',
      metrics: ['totalProjects'],
    })
    expect(result.templateName).toBe('Custom Report')
  })

  it('includes generated timestamp', () => {
    const result = transformToReportData(projects, { templateId: 'executive-summary' })
    expect(result.generatedAt).toBeTruthy()
    expect(() => new Date(result.generatedAt)).not.toThrow()
  })
})
