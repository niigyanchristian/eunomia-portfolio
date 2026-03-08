import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, parseISO, format, subYears, subQuarters, eachMonthOfInterval, eachQuarterOfInterval } from 'date-fns'

export function calculateYoYComparison(currentData, previousData) {
  if (previousData === 0 || previousData === null || previousData === undefined) {
    return currentData > 0 ? 100 : 0
  }
  return ((currentData - previousData) / Math.abs(previousData)) * 100
}

export function calculateQoQComparison(currentData, previousData) {
  if (previousData === 0 || previousData === null || previousData === undefined) {
    return currentData > 0 ? 100 : 0
  }
  return ((currentData - previousData) / Math.abs(previousData)) * 100
}

export function getDateRange(timeframe, referenceDate = new Date()) {
  const ref = typeof referenceDate === 'string' ? parseISO(referenceDate) : referenceDate

  switch (timeframe) {
    case 'month':
      return { start: startOfMonth(ref), end: endOfMonth(ref) }
    case 'quarter':
      return { start: startOfQuarter(ref), end: endOfQuarter(ref) }
    case 'year':
      return { start: startOfYear(ref), end: endOfYear(ref) }
    default:
      return { start: startOfYear(ref), end: endOfYear(ref) }
  }
}

export function filterProjectsByDateRange(projects, start, end) {
  if (!start || !end) return projects
  const interval = {
    start: typeof start === 'string' ? parseISO(start) : start,
    end: typeof end === 'string' ? parseISO(end) : end,
  }
  return projects.filter((project) => {
    const projectDate = parseISO(project.createdAt || project.completionDate)
    return isWithinInterval(projectDate, interval)
  })
}

export function groupProjectsByCategory(projects) {
  return projects.reduce((groups, project) => {
    const category = project.category || 'Uncategorized'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(project)
    return groups
  }, {})
}

export function groupProjectsByStatus(projects) {
  return projects.reduce((groups, project) => {
    const status = project.status || 'unknown'
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(project)
    return groups
  }, {})
}

export function aggregateMetrics(projects, timeframe = 'year', referenceDate = new Date()) {
  const { start, end } = getDateRange(timeframe, referenceDate)
  const filtered = filterProjectsByDateRange(projects, start, end)

  const totalProjects = filtered.length
  const byStatus = groupProjectsByStatus(filtered)
  const byCategory = groupProjectsByCategory(filtered)

  const publishedCount = (byStatus['published'] || []).length
  const completionRate = totalProjects > 0 ? (publishedCount / totalProjects) * 100 : 0

  const previousStart = timeframe === 'year' ? subYears(start, 1) : subQuarters(start, 1)
  const previousEnd = timeframe === 'year' ? subYears(end, 1) : subQuarters(end, 1)
  const previousFiltered = filterProjectsByDateRange(projects, previousStart, previousEnd)
  const previousTotal = previousFiltered.length

  const yoyChange = calculateYoYComparison(totalProjects, previousTotal)

  return {
    totalProjects,
    completionRate: Math.round(completionRate * 100) / 100,
    publishedCount,
    draftCount: (byStatus['draft'] || []).length,
    statusDistribution: Object.fromEntries(
      Object.entries(byStatus).map(([status, items]) => [status, items.length])
    ),
    categoryBreakdown: Object.fromEntries(
      Object.entries(byCategory).map(([category, items]) => [category, items.length])
    ),
    periodChange: Math.round(yoyChange * 100) / 100,
    dateRange: {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    },
  }
}

export function generateTrendData(projects, period = 'monthly', referenceDate = new Date()) {
  const ref = typeof referenceDate === 'string' ? parseISO(referenceDate) : referenceDate

  let intervals
  let formatStr

  if (period === 'monthly') {
    const yearStart = startOfYear(ref)
    const yearEnd = endOfYear(ref)
    intervals = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    formatStr = 'MMM yyyy'
  } else if (period === 'quarterly') {
    const yearStart = startOfYear(ref)
    const yearEnd = endOfYear(ref)
    intervals = eachQuarterOfInterval({ start: yearStart, end: yearEnd })
    formatStr = 'QQQ yyyy'
  } else {
    const yearStart = startOfYear(ref)
    const yearEnd = endOfYear(ref)
    intervals = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    formatStr = 'MMM yyyy'
  }

  return intervals.map((intervalStart) => {
    const intervalEnd = period === 'quarterly' ? endOfQuarter(intervalStart) : endOfMonth(intervalStart)
    const filtered = filterProjectsByDateRange(projects, intervalStart, intervalEnd)
    const published = filtered.filter((p) => p.status === 'published').length

    return {
      label: format(intervalStart, formatStr),
      date: format(intervalStart, 'yyyy-MM-dd'),
      total: filtered.length,
      published,
      draft: filtered.length - published,
    }
  })
}

export function calculateCompletionTrend(projects, period = 'monthly', referenceDate = new Date()) {
  const trendData = generateTrendData(projects, period, referenceDate)
  let cumulative = 0

  return trendData.map((point) => {
    cumulative += point.total
    return {
      ...point,
      cumulative,
    }
  })
}
