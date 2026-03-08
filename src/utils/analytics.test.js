import { describe, it, expect } from 'vitest'
import {
  calculateYoYComparison,
  calculateQoQComparison,
  aggregateMetrics,
  generateTrendData,
  filterProjectsByDateRange,
  groupProjectsByCategory,
  groupProjectsByStatus,
  getDateRange,
  calculateCompletionTrend,
} from './analytics'

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

describe('calculateYoYComparison', () => {
  it('returns percentage change for normal values', () => {
    expect(calculateYoYComparison(120, 100)).toBe(20)
    expect(calculateYoYComparison(80, 100)).toBe(-20)
  })

  it('returns 100 when previous data is zero and current is positive', () => {
    expect(calculateYoYComparison(50, 0)).toBe(100)
  })

  it('returns 0 when both values are zero', () => {
    expect(calculateYoYComparison(0, 0)).toBe(0)
  })

  it('handles null previous data', () => {
    expect(calculateYoYComparison(10, null)).toBe(100)
  })

  it('handles undefined previous data', () => {
    expect(calculateYoYComparison(10, undefined)).toBe(100)
  })

  it('handles negative change correctly', () => {
    expect(calculateYoYComparison(50, 100)).toBe(-50)
  })
})

describe('calculateQoQComparison', () => {
  it('returns percentage change for normal values', () => {
    expect(calculateQoQComparison(150, 100)).toBe(50)
  })

  it('returns 100 when previous data is zero and current is positive', () => {
    expect(calculateQoQComparison(25, 0)).toBe(100)
  })

  it('returns 0 when both are zero', () => {
    expect(calculateQoQComparison(0, 0)).toBe(0)
  })

  it('handles null previous data', () => {
    expect(calculateQoQComparison(5, null)).toBe(100)
  })

  it('handles negative values', () => {
    expect(calculateQoQComparison(30, 60)).toBe(-50)
  })
})

describe('getDateRange', () => {
  const ref = new Date('2026-06-15T00:00:00.000Z')

  it('returns month range', () => {
    const range = getDateRange('month', ref)
    expect(range.start.getMonth()).toBe(5) // June
    expect(range.end.getMonth()).toBe(5)
  })

  it('returns quarter range', () => {
    const range = getDateRange('quarter', ref)
    expect(range.start.getMonth()).toBe(3) // April (Q2 start)
  })

  it('returns year range', () => {
    const range = getDateRange('year', ref)
    expect(range.start.getMonth()).toBe(0) // January
    expect(range.end.getMonth()).toBe(11) // December
  })

  it('defaults to year for unknown timeframe', () => {
    const range = getDateRange('unknown', ref)
    expect(range.start.getMonth()).toBe(0)
  })

  it('accepts string date as reference', () => {
    const range = getDateRange('month', '2026-06-15T00:00:00.000Z')
    expect(range.start.getMonth()).toBe(5)
  })
})

describe('filterProjectsByDateRange', () => {
  const projects = [
    makeProject({ createdAt: '2026-01-15T00:00:00.000Z' }),
    makeProject({ createdAt: '2026-03-15T00:00:00.000Z' }),
    makeProject({ createdAt: '2026-06-15T00:00:00.000Z' }),
  ]

  it('filters projects within date range', () => {
    const result = filterProjectsByDateRange(projects, '2026-01-01', '2026-04-01')
    expect(result).toHaveLength(2)
  })

  it('returns all projects when no range provided', () => {
    const result = filterProjectsByDateRange(projects, null, null)
    expect(result).toHaveLength(3)
  })
})

describe('groupProjectsByCategory', () => {
  it('groups projects by their category', () => {
    const projects = [
      makeProject({ category: 'Web' }),
      makeProject({ category: 'Web' }),
      makeProject({ category: 'Mobile' }),
    ]
    const result = groupProjectsByCategory(projects)
    expect(result['Web']).toHaveLength(2)
    expect(result['Mobile']).toHaveLength(1)
  })

  it('uses Uncategorized for missing categories', () => {
    const projects = [makeProject({ category: '' })]
    const result = groupProjectsByCategory(projects)
    expect(result['Uncategorized']).toHaveLength(1)
  })
})

describe('groupProjectsByStatus', () => {
  it('groups projects by status', () => {
    const projects = [
      makeProject({ status: 'published' }),
      makeProject({ status: 'draft' }),
      makeProject({ status: 'draft' }),
    ]
    const result = groupProjectsByStatus(projects)
    expect(result['published']).toHaveLength(1)
    expect(result['draft']).toHaveLength(2)
  })
})

describe('aggregateMetrics', () => {
  const refDate = new Date('2026-06-15T00:00:00.000Z')
  const projects = [
    makeProject({ createdAt: '2026-03-01T00:00:00.000Z', status: 'published', category: 'Web' }),
    makeProject({ createdAt: '2026-04-01T00:00:00.000Z', status: 'draft', category: 'Mobile' }),
    makeProject({ createdAt: '2026-05-01T00:00:00.000Z', status: 'published', category: 'Web' }),
    makeProject({ createdAt: '2025-03-01T00:00:00.000Z', status: 'published', category: 'Web' }),
  ]

  it('aggregates metrics for the year', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    expect(result.totalProjects).toBe(3) // only 2026 projects
    expect(result.publishedCount).toBe(2)
    expect(result.draftCount).toBe(1)
  })

  it('includes status distribution', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    expect(result.statusDistribution.published).toBe(2)
    expect(result.statusDistribution.draft).toBe(1)
  })

  it('includes category breakdown', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    expect(result.categoryBreakdown['Web']).toBe(2)
    expect(result.categoryBreakdown['Mobile']).toBe(1)
  })

  it('calculates completion rate', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    expect(result.completionRate).toBeCloseTo(66.67, 1)
  })

  it('calculates period change', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    // current year: 3, previous year: 1 => 200% increase
    expect(result.periodChange).toBe(200)
  })

  it('includes date range', () => {
    const result = aggregateMetrics(projects, 'year', refDate)
    expect(result.dateRange.start).toBe('2026-01-01')
    expect(result.dateRange.end).toBe('2026-12-31')
  })
})

describe('generateTrendData', () => {
  const refDate = new Date('2026-06-15T00:00:00.000Z')
  const projects = [
    makeProject({ createdAt: '2026-01-15T00:00:00.000Z', status: 'published' }),
    makeProject({ createdAt: '2026-01-20T00:00:00.000Z', status: 'draft' }),
    makeProject({ createdAt: '2026-03-10T00:00:00.000Z', status: 'published' }),
  ]

  it('generates monthly trend data with 12 entries', () => {
    const result = generateTrendData(projects, 'monthly', refDate)
    expect(result).toHaveLength(12)
  })

  it('correctly counts projects per month', () => {
    const result = generateTrendData(projects, 'monthly', refDate)
    const jan = result.find((r) => r.label.startsWith('Jan'))
    expect(jan.total).toBe(2)
    expect(jan.published).toBe(1)
    expect(jan.draft).toBe(1)
  })

  it('generates quarterly trend data', () => {
    const result = generateTrendData(projects, 'quarterly', refDate)
    expect(result).toHaveLength(4)
    expect(result[0].total).toBe(3) // Q1: Jan + Jan + Mar projects
  })

  it('returns zeros for months with no projects', () => {
    const result = generateTrendData(projects, 'monthly', refDate)
    const jun = result.find((r) => r.label.startsWith('Jun'))
    expect(jun.total).toBe(0)
    expect(jun.published).toBe(0)
  })
})

describe('calculateCompletionTrend', () => {
  const refDate = new Date('2026-06-15T00:00:00.000Z')
  const projects = [
    makeProject({ createdAt: '2026-01-15T00:00:00.000Z' }),
    makeProject({ createdAt: '2026-03-10T00:00:00.000Z' }),
  ]

  it('returns cumulative counts', () => {
    const result = calculateCompletionTrend(projects, 'monthly', refDate)
    expect(result[0].cumulative).toBe(1) // Jan
    expect(result[2].cumulative).toBe(2) // Mar
    expect(result[11].cumulative).toBe(2) // Dec (no new)
  })
})
