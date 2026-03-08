export const ReportTemplateType = {
  EXECUTIVE: 'executive',
  DETAILED: 'detailed',
  RISK: 'risk',
  FINANCIAL: 'financial',
  PERFORMANCE: 'performance',
  STATUS: 'status',
}

export const ExportFormat = {
  PDF: 'pdf',
  EXCEL: 'excel',
  POWERPOINT: 'powerpoint',
}

export const ScheduleFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
}

/**
 * @typedef {Object} ReportConfig
 * @property {string} templateId
 * @property {string} title
 * @property {string[]} metrics - metric keys to include
 * @property {Object} filters
 * @property {string} [filters.category]
 * @property {string} [filters.status]
 * @property {string[]} [filters.tags]
 * @property {Object} dateRange
 * @property {string} dateRange.start - ISO date string
 * @property {string} dateRange.end - ISO date string
 */

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} title
 * @property {string} templateType
 * @property {ReportConfig} config
 * @property {Object|null} data - generated report data
 * @property {string} createdAt - ISO date string
 * @property {string} updatedAt - ISO date string
 * @property {string} status - 'pending' | 'generated' | 'error'
 */

/**
 * @typedef {Object} ScheduleConfig
 * @property {string} reportId
 * @property {string} frequency - from ScheduleFrequency
 * @property {string[]} stakeholders - email addresses
 * @property {string} nextRunAt - ISO date string
 * @property {boolean} enabled
 */

export function createReportConfig({ templateId, title, metrics = [], filters = {}, dateRange = {} }) {
  return {
    templateId,
    title: title || '',
    metrics,
    filters,
    dateRange: {
      start: dateRange.start || null,
      end: dateRange.end || null,
    },
  }
}

export function createScheduleConfig({ reportId, frequency, stakeholders = [], nextRunAt, enabled = true }) {
  return {
    reportId,
    frequency: frequency || ScheduleFrequency.WEEKLY,
    stakeholders,
    nextRunAt: nextRunAt || null,
    enabled,
  }
}

export const DEFAULT_TEMPLATES = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    type: ReportTemplateType.EXECUTIVE,
    description: 'High-level overview of portfolio performance and key metrics',
    metrics: ['totalProjects', 'completionRate', 'categoryBreakdown'],
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    type: ReportTemplateType.DETAILED,
    description: 'Comprehensive project-by-project breakdown with all metrics',
    metrics: ['totalProjects', 'completionRate', 'categoryBreakdown', 'timeline', 'statusDistribution'],
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    type: ReportTemplateType.RISK,
    description: 'Risk analysis across projects including overdue and at-risk items',
    metrics: ['overdueProjects', 'atRiskProjects', 'statusDistribution'],
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    type: ReportTemplateType.FINANCIAL,
    description: 'Budget and financial metrics across the portfolio',
    metrics: ['budgetUtilization', 'costBreakdown', 'financialTrend'],
  },
  {
    id: 'performance-report',
    name: 'Performance Report',
    type: ReportTemplateType.PERFORMANCE,
    description: 'Performance metrics and trends over time',
    metrics: ['completionRate', 'timeline', 'velocity', 'trendData'],
  },
  {
    id: 'status-update',
    name: 'Status Update',
    type: ReportTemplateType.STATUS,
    description: 'Current status of all projects for stakeholder communication',
    metrics: ['statusDistribution', 'recentUpdates', 'milestones'],
  },
]
