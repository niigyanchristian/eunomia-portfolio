import { aggregateMetrics, generateTrendData, filterProjectsByDateRange, groupProjectsByCategory, groupProjectsByStatus, calculateYoYComparison, calculateQoQComparison } from '../utils/analytics'
import { DEFAULT_TEMPLATES, ReportTemplateType } from '../types/reports'
import { format, parseISO, subYears, subQuarters } from 'date-fns'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getTemplate(templateId) {
  return DEFAULT_TEMPLATES.find((t) => t.id === templateId) || null
}

export function applyFilters(projects, filters = {}) {
  let result = [...projects]

  if (filters.category) {
    result = result.filter((p) => p.category === filters.category)
  }

  if (filters.status) {
    result = result.filter((p) => p.status === filters.status)
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((p) => {
      const projectTags = p.customTags || []
      return filters.tags.some((tag) => projectTags.includes(tag))
    })
  }

  if (filters.projectType) {
    result = result.filter((p) => p.projectType === filters.projectType)
  }

  return result
}

export function calculateReportMetrics(projects, metricKeys, dateRange = {}) {
  const filtered = dateRange.start && dateRange.end
    ? filterProjectsByDateRange(projects, dateRange.start, dateRange.end)
    : projects

  const metrics = {}

  for (const key of metricKeys) {
    switch (key) {
      case 'totalProjects':
        metrics.totalProjects = filtered.length
        break
      case 'completionRate': {
        const published = filtered.filter((p) => p.status === 'published').length
        metrics.completionRate = filtered.length > 0 ? Math.round((published / filtered.length) * 10000) / 100 : 0
        break
      }
      case 'categoryBreakdown':
        metrics.categoryBreakdown = Object.fromEntries(
          Object.entries(groupProjectsByCategory(filtered)).map(([k, v]) => [k, v.length])
        )
        break
      case 'statusDistribution':
        metrics.statusDistribution = Object.fromEntries(
          Object.entries(groupProjectsByStatus(filtered)).map(([k, v]) => [k, v.length])
        )
        break
      case 'timeline':
        metrics.timeline = generateTrendData(filtered, 'monthly')
        break
      case 'trendData':
        metrics.trendData = generateTrendData(filtered, 'monthly')
        break
      case 'velocity': {
        const monthlyTrend = generateTrendData(filtered, 'monthly')
        const nonEmpty = monthlyTrend.filter((m) => m.total > 0)
        metrics.velocity = nonEmpty.length > 0
          ? Math.round((filtered.length / nonEmpty.length) * 100) / 100
          : 0
        break
      }
      case 'overdueProjects':
        metrics.overdueProjects = filtered.filter((p) => {
          if (!p.completionDate || p.status === 'published') return false
          return new Date(p.completionDate) < new Date()
        }).length
        break
      case 'atRiskProjects':
        metrics.atRiskProjects = filtered.filter((p) => {
          if (!p.completionDate || p.status === 'published') return false
          const daysUntilDue = (new Date(p.completionDate) - new Date()) / (1000 * 60 * 60 * 24)
          return daysUntilDue >= 0 && daysUntilDue <= 14
        }).length
        break
      case 'recentUpdates':
        metrics.recentUpdates = [...filtered]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            updatedAt: p.updatedAt,
          }))
        break
      case 'milestones':
        metrics.milestones = filtered
          .filter((p) => p.completionDate)
          .map((p) => ({
            id: p.id,
            title: p.title,
            completionDate: p.completionDate,
            status: p.status,
          }))
        break
      default:
        break
    }
  }

  return metrics
}

export function generateComparisons(projects, dateRange = {}) {
  if (!dateRange.start || !dateRange.end) return {}

  const start = typeof dateRange.start === 'string' ? parseISO(dateRange.start) : dateRange.start
  const end = typeof dateRange.end === 'string' ? parseISO(dateRange.end) : dateRange.end

  const currentProjects = filterProjectsByDateRange(projects, start, end)
  const currentCount = currentProjects.length

  const prevYearStart = subYears(start, 1)
  const prevYearEnd = subYears(end, 1)
  const prevYearProjects = filterProjectsByDateRange(projects, prevYearStart, prevYearEnd)
  const prevYearCount = prevYearProjects.length

  const prevQuarterStart = subQuarters(start, 1)
  const prevQuarterEnd = subQuarters(end, 1)
  const prevQuarterProjects = filterProjectsByDateRange(projects, prevQuarterStart, prevQuarterEnd)
  const prevQuarterCount = prevQuarterProjects.length

  return {
    yoy: Math.round(calculateYoYComparison(currentCount, prevYearCount) * 100) / 100,
    qoq: Math.round(calculateQoQComparison(currentCount, prevQuarterCount) * 100) / 100,
    currentPeriod: currentCount,
    previousYear: prevYearCount,
    previousQuarter: prevQuarterCount,
  }
}

export function transformToReportData(projects, config) {
  const { templateId, metrics: metricKeys = [], filters = {}, dateRange = {} } = config

  const template = getTemplate(templateId)
  const effectiveMetrics = metricKeys.length > 0 ? metricKeys : (template ? template.metrics : [])

  const filteredProjects = applyFilters(projects, filters)
  const calculatedMetrics = calculateReportMetrics(filteredProjects, effectiveMetrics, dateRange)
  const comparisons = generateComparisons(filteredProjects, dateRange)

  return {
    id: generateId(),
    templateId: templateId || 'custom',
    templateName: template ? template.name : 'Custom Report',
    generatedAt: new Date().toISOString(),
    config,
    summary: {
      totalProjects: filteredProjects.length,
      filteredFrom: projects.length,
      filtersApplied: Object.keys(filters).filter((k) => filters[k]).length,
    },
    metrics: calculatedMetrics,
    comparisons,
  }
}
