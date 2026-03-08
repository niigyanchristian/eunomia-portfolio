/**
 * Report Template Library
 * Defines pre-configured templates for different reporting needs
 */

export const TemplateCategory = {
  EXECUTIVE: 'executive',
  ANALYSIS: 'analysis',
  FINANCIAL: 'financial',
  OPERATIONS: 'operations',
  STRATEGIC: 'strategic',
}

export const ChartType = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  AREA: 'area',
  SCATTER: 'scatter',
  COMPOSED: 'composed',
  RADAR: 'radar',
}

export const TimeRangePreset = {
  LAST_30_DAYS: 'last_30_days',
  LAST_QUARTER: 'last_quarter',
  LAST_YEAR: 'last_year',
  YEAR_TO_DATE: 'year_to_date',
  CUSTOM: 'custom',
}

/**
 * Comprehensive Report Template Definitions
 * Each template includes:
 * - id: unique identifier
 * - name: display name
 * - category: template category
 * - description: what the report shows
 * - metrics: array of metric keys to display
 * - visualizations: chart configurations
 * - defaultTimeRange: default time period
 * - suggestedFilters: recommended filters
 * - layout: arrangement of sections
 */
export const REPORT_TEMPLATES = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    category: TemplateCategory.EXECUTIVE,
    description: 'High-level KPIs, project health, and strategic alignment overview',
    metrics: [
      'totalProjects',
      'completionRate',
      'publishedCount',
      'draftCount',
      'statusDistribution',
      'categoryBreakdown',
      'periodChange',
    ],
    visualizations: [
      { type: ChartType.PIE, metric: 'statusDistribution', title: 'Project Status' },
      { type: ChartType.BAR, metric: 'categoryBreakdown', title: 'Projects by Category' },
      { type: ChartType.LINE, metric: 'trendData', title: 'Completion Trend' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: [],
    layout: {
      sections: [
        { type: 'summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'kpis', position: 'sidebar' },
      ],
    },
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    category: TemplateCategory.ANALYSIS,
    description: 'Comprehensive project breakdown with timelines and resources',
    metrics: [
      'totalProjects',
      'completionRate',
      'statusDistribution',
      'categoryBreakdown',
      'trendData',
      'projectDetails',
      'timelineMetrics',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'statusDistribution', title: 'Status Distribution' },
      { type: ChartType.LINE, metric: 'trendData', title: 'Project Timeline' },
      { type: ChartType.AREA, metric: 'cumulativeTrend', title: 'Cumulative Progress' },
      { type: ChartType.COMPOSED, metric: 'categoryTrend', title: 'Category Breakdown Over Time' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_YEAR,
    suggestedFilters: ['category', 'status', 'tags'],
    layout: {
      sections: [
        { type: 'metrics', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'risk-report',
    name: 'Risk Report',
    category: TemplateCategory.EXECUTIVE,
    description: 'Risk assessment, mitigation strategies, and exposure analysis',
    metrics: [
      'overdueProjects',
      'atRiskProjects',
      'blockedProjects',
      'statusDistribution',
      'riskExposure',
      'mitigationStatus',
    ],
    visualizations: [
      { type: ChartType.PIE, metric: 'riskExposure', title: 'Risk Exposure by Severity' },
      { type: ChartType.BAR, metric: 'overdueProjects', title: 'Overdue Projects' },
      { type: ChartType.RADAR, metric: 'riskCategories', title: 'Risk Categories' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: ['status', 'category', 'priority'],
    layout: {
      sections: [
        { type: 'alerts', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'risk-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'financial-report',
    name: 'Financial Report',
    category: TemplateCategory.FINANCIAL,
    description: 'Budget vs actual, cost projections, and ROI analysis',
    metrics: [
      'budgetUtilization',
      'totalCost',
      'costBreakdown',
      'budgetVariance',
      'costProjections',
      'roiMetrics',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'budgetUtilization', title: 'Budget Utilization' },
      { type: ChartType.PIE, metric: 'costBreakdown', title: 'Cost Distribution' },
      { type: ChartType.LINE, metric: 'costProjections', title: 'Cost Trend & Projections' },
      { type: ChartType.COMPOSED, metric: 'budgetVsActual', title: 'Budget vs Actual' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: ['category', 'status'],
    layout: {
      sections: [
        { type: 'financial-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'financial-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'performance-dashboard',
    name: 'Performance Dashboard',
    category: TemplateCategory.OPERATIONS,
    description: 'Velocity, completion rates, and quality metrics',
    metrics: [
      'velocity',
      'completionRate',
      'throughput',
      'cycleTime',
      'qualityMetrics',
      'performanceTrend',
    ],
    visualizations: [
      { type: ChartType.LINE, metric: 'velocity', title: 'Velocity Trend' },
      { type: ChartType.AREA, metric: 'throughput', title: 'Throughput' },
      { type: ChartType.BAR, metric: 'cycleTime', title: 'Average Cycle Time' },
      { type: ChartType.COMPOSED, metric: 'performanceTrend', title: 'Performance Indicators' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['category', 'team'],
    layout: {
      sections: [
        { type: 'kpi-cards', position: 'top', columns: 4 },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'performance-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    category: TemplateCategory.OPERATIONS,
    description: 'Team allocation, capacity planning, and workload distribution',
    metrics: [
      'teamAllocation',
      'capacityUtilization',
      'workloadDistribution',
      'resourceAvailability',
      'allocationTrend',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'teamAllocation', title: 'Team Allocation' },
      { type: ChartType.PIE, metric: 'capacityUtilization', title: 'Capacity Utilization' },
      { type: ChartType.AREA, metric: 'allocationTrend', title: 'Allocation Over Time' },
      { type: ChartType.COMPOSED, metric: 'workloadDistribution', title: 'Workload Distribution' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['team', 'category'],
    layout: {
      sections: [
        { type: 'resource-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'resource-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'timeline-analysis',
    name: 'Timeline Analysis',
    category: TemplateCategory.ANALYSIS,
    description: 'Schedule adherence, critical path, and milestone tracking',
    metrics: [
      'scheduleAdherence',
      'milestoneProgress',
      'criticalPath',
      'timelineVariance',
      'upcomingMilestones',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'scheduleAdherence', title: 'Schedule Adherence' },
      { type: ChartType.LINE, metric: 'milestoneProgress', title: 'Milestone Progress' },
      { type: ChartType.COMPOSED, metric: 'timelineVariance', title: 'Timeline Variance' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: ['status', 'category'],
    layout: {
      sections: [
        { type: 'timeline-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'milestone-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'quality-metrics',
    name: 'Quality Metrics',
    category: TemplateCategory.OPERATIONS,
    description: 'Defect rates, test coverage, and code quality indicators',
    metrics: [
      'defectRate',
      'testCoverage',
      'codeQuality',
      'reviewMetrics',
      'qualityTrend',
    ],
    visualizations: [
      { type: ChartType.LINE, metric: 'defectRate', title: 'Defect Rate Trend' },
      { type: ChartType.BAR, metric: 'testCoverage', title: 'Test Coverage by Project' },
      { type: ChartType.RADAR, metric: 'codeQuality', title: 'Code Quality Indicators' },
      { type: ChartType.AREA, metric: 'qualityTrend', title: 'Overall Quality Trend' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['category', 'team'],
    layout: {
      sections: [
        { type: 'quality-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'quality-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'stakeholder-report',
    name: 'Stakeholder Report',
    category: TemplateCategory.EXECUTIVE,
    description: 'Progress updates, deliverables, and next steps for stakeholders',
    metrics: [
      'progressSummary',
      'completedDeliverables',
      'upcomingDeliverables',
      'keyAchievements',
      'nextSteps',
    ],
    visualizations: [
      { type: ChartType.PIE, metric: 'progressSummary', title: 'Overall Progress' },
      { type: ChartType.BAR, metric: 'deliverableStatus', title: 'Deliverable Status' },
      { type: ChartType.LINE, metric: 'progressTrend', title: 'Progress Trend' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['status', 'priority'],
    layout: {
      sections: [
        { type: 'executive-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'achievements', position: 'sidebar' },
        { type: 'action-items', position: 'bottom' },
      ],
    },
  },
  {
    id: 'portfolio-health',
    name: 'Portfolio Health',
    category: TemplateCategory.EXECUTIVE,
    description: 'Overall portfolio status, trends, and alerts',
    metrics: [
      'portfolioScore',
      'healthIndicators',
      'trendAnalysis',
      'activeAlerts',
      'riskMetrics',
    ],
    visualizations: [
      { type: ChartType.RADAR, metric: 'healthIndicators', title: 'Health Indicators' },
      { type: ChartType.LINE, metric: 'portfolioScore', title: 'Portfolio Health Score' },
      { type: ChartType.BAR, metric: 'riskMetrics', title: 'Risk Distribution' },
      { type: ChartType.AREA, metric: 'trendAnalysis', title: 'Trend Analysis' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: [],
    layout: {
      sections: [
        { type: 'health-score', position: 'top' },
        { type: 'alerts', position: 'sidebar' },
        { type: 'charts', position: 'main', columns: 2 },
      ],
    },
  },
  {
    id: 'strategic-alignment',
    name: 'Strategic Alignment',
    category: TemplateCategory.STRATEGIC,
    description: 'Business value, OKR progress, and strategy fit analysis',
    metrics: [
      'businessValue',
      'okrProgress',
      'strategicFit',
      'valueRealization',
      'alignmentScore',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'okrProgress', title: 'OKR Progress' },
      { type: ChartType.RADAR, metric: 'strategicFit', title: 'Strategic Fit' },
      { type: ChartType.LINE, metric: 'valueRealization', title: 'Value Realization' },
      { type: ChartType.PIE, metric: 'businessValue', title: 'Business Value Distribution' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: ['category', 'priority'],
    layout: {
      sections: [
        { type: 'strategic-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'okr-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'comparative-analysis',
    name: 'Comparative Analysis',
    category: TemplateCategory.ANALYSIS,
    description: 'Project comparisons, benchmarking, and performance comparison',
    metrics: [
      'projectComparison',
      'performanceBenchmark',
      'categoryComparison',
      'teamComparison',
      'relativePerformance',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'projectComparison', title: 'Project Comparison' },
      { type: ChartType.SCATTER, metric: 'performanceBenchmark', title: 'Performance Benchmark' },
      { type: ChartType.COMPOSED, metric: 'categoryComparison', title: 'Category Comparison' },
      { type: ChartType.RADAR, metric: 'relativePerformance', title: 'Relative Performance' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['category', 'team', 'status'],
    layout: {
      sections: [
        { type: 'comparison-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'comparison-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'trend-report',
    name: 'Trend Report',
    category: TemplateCategory.ANALYSIS,
    description: 'Historical trends, forecasts, and seasonality analysis',
    metrics: [
      'historicalTrend',
      'forecastData',
      'seasonalityPatterns',
      'growthRate',
      'trendIndicators',
    ],
    visualizations: [
      { type: ChartType.LINE, metric: 'historicalTrend', title: 'Historical Trend' },
      { type: ChartType.AREA, metric: 'forecastData', title: 'Forecast & Projections' },
      { type: ChartType.BAR, metric: 'seasonalityPatterns', title: 'Seasonality Patterns' },
      { type: ChartType.COMPOSED, metric: 'trendIndicators', title: 'Trend Indicators' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_YEAR,
    suggestedFilters: ['category'],
    layout: {
      sections: [
        { type: 'trend-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'forecast-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'capacity-planning',
    name: 'Capacity Planning',
    category: TemplateCategory.OPERATIONS,
    description: 'Resource forecasts, bottleneck analysis, and capacity planning',
    metrics: [
      'capacityForecast',
      'bottleneckAnalysis',
      'resourceDemand',
      'utilizationProjection',
      'capacityGaps',
    ],
    visualizations: [
      { type: ChartType.LINE, metric: 'capacityForecast', title: 'Capacity Forecast' },
      { type: ChartType.BAR, metric: 'bottleneckAnalysis', title: 'Bottleneck Analysis' },
      { type: ChartType.AREA, metric: 'resourceDemand', title: 'Resource Demand' },
      { type: ChartType.COMPOSED, metric: 'utilizationProjection', title: 'Utilization Projection' },
    ],
    defaultTimeRange: TimeRangePreset.LAST_QUARTER,
    suggestedFilters: ['team', 'category'],
    layout: {
      sections: [
        { type: 'capacity-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'capacity-table', position: 'bottom' },
      ],
    },
  },
  {
    id: 'roi-analysis',
    name: 'ROI Analysis',
    category: TemplateCategory.FINANCIAL,
    description: 'Value realization, cost-benefit analysis, and return on investment',
    metrics: [
      'roiMetrics',
      'valueRealization',
      'costBenefitRatio',
      'paybackPeriod',
      'netValue',
    ],
    visualizations: [
      { type: ChartType.BAR, metric: 'roiMetrics', title: 'ROI by Project' },
      { type: ChartType.LINE, metric: 'valueRealization', title: 'Value Realization Over Time' },
      { type: ChartType.COMPOSED, metric: 'costBenefitRatio', title: 'Cost vs Benefit' },
      { type: ChartType.PIE, metric: 'netValue', title: 'Net Value Distribution' },
    ],
    defaultTimeRange: TimeRangePreset.YEAR_TO_DATE,
    suggestedFilters: ['category', 'status'],
    layout: {
      sections: [
        { type: 'roi-summary', position: 'top' },
        { type: 'charts', position: 'main', columns: 2 },
        { type: 'roi-table', position: 'bottom' },
      ],
    },
  },
]

/**
 * Get template by ID
 * @param {string} templateId
 * @returns {Object|null}
 */
export function getTemplateById(templateId) {
  return REPORT_TEMPLATES.find((template) => template.id === templateId) || null
}

/**
 * Get templates by category
 * @param {string} category
 * @returns {Array}
 */
export function getTemplatesByCategory(category) {
  return REPORT_TEMPLATES.filter((template) => template.category === category)
}

/**
 * Search templates by keyword
 * @param {string} keyword
 * @returns {Array}
 */
export function searchTemplates(keyword) {
  const searchTerm = keyword.toLowerCase()
  return REPORT_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.metrics.some((metric) => metric.toLowerCase().includes(searchTerm))
  )
}

/**
 * Get all template categories
 * @returns {Array}
 */
export function getAllCategories() {
  return Object.values(TemplateCategory)
}

/**
 * Get template count by category
 * @returns {Object}
 */
export function getTemplateCounts() {
  return REPORT_TEMPLATES.reduce((counts, template) => {
    counts[template.category] = (counts[template.category] || 0) + 1
    return counts
  }, {})
}
