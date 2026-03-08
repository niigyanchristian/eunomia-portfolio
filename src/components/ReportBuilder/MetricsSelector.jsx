import { useState, useMemo } from 'react'
import './MetricsSelector.css'

const AVAILABLE_METRICS = [
  {
    category: 'Financial',
    metrics: [
      { key: 'totalProjects', name: 'Total Projects', description: 'Total number of projects in portfolio' },
      { key: 'budgetUtilization', name: 'Budget Utilization', description: 'Percentage of budget used vs allocated' },
      { key: 'totalCost', name: 'Total Cost', description: 'Total cost across all projects' },
      { key: 'costBreakdown', name: 'Cost Breakdown', description: 'Cost distribution by category' },
      { key: 'budgetVariance', name: 'Budget Variance', description: 'Difference between planned and actual budget' },
      { key: 'roiMetrics', name: 'ROI Metrics', description: 'Return on investment analysis' },
    ],
  },
  {
    category: 'Performance',
    metrics: [
      { key: 'completionRate', name: 'Completion Rate', description: 'Percentage of completed projects' },
      { key: 'velocity', name: 'Velocity', description: 'Speed of project completion over time' },
      { key: 'throughput', name: 'Throughput', description: 'Number of projects completed per period' },
      { key: 'cycleTime', name: 'Cycle Time', description: 'Average time from start to completion' },
      { key: 'performanceTrend', name: 'Performance Trend', description: 'Performance metrics over time' },
    ],
  },
  {
    category: 'Quality',
    metrics: [
      { key: 'qualityMetrics', name: 'Quality Metrics', description: 'Overall quality indicators' },
      { key: 'defectRate', name: 'Defect Rate', description: 'Number of defects per project' },
      { key: 'testCoverage', name: 'Test Coverage', description: 'Percentage of code covered by tests' },
      { key: 'codeQuality', name: 'Code Quality', description: 'Code quality metrics and standards' },
      { key: 'reviewMetrics', name: 'Review Metrics', description: 'Code review statistics' },
    ],
  },
  {
    category: 'Timeline',
    metrics: [
      { key: 'statusDistribution', name: 'Status Distribution', description: 'Projects by current status' },
      { key: 'trendData', name: 'Trend Data', description: 'Project trends over time' },
      { key: 'scheduleAdherence', name: 'Schedule Adherence', description: 'On-time delivery percentage' },
      { key: 'milestoneProgress', name: 'Milestone Progress', description: 'Progress towards milestones' },
      { key: 'timelineVariance', name: 'Timeline Variance', description: 'Difference between planned and actual timeline' },
      { key: 'upcomingMilestones', name: 'Upcoming Milestones', description: 'Milestones due soon' },
    ],
  },
  {
    category: 'Distribution',
    metrics: [
      { key: 'categoryBreakdown', name: 'Category Breakdown', description: 'Projects grouped by category' },
      { key: 'publishedCount', name: 'Published Count', description: 'Number of published projects' },
      { key: 'draftCount', name: 'Draft Count', description: 'Number of draft projects' },
      { key: 'periodChange', name: 'Period Change', description: 'Change in metrics over selected period' },
    ],
  },
]

export default function MetricsSelector({ selectedMetrics = [], onChange }) {
  const [draggedMetric, setDraggedMetric] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const allMetrics = useMemo(() => {
    return AVAILABLE_METRICS.flatMap((category) =>
      category.metrics.map((metric) => ({ ...metric, category: category.category }))
    )
  }, [])

  const handleToggleMetric = (metricKey) => {
    const isSelected = selectedMetrics.includes(metricKey)
    const updated = isSelected
      ? selectedMetrics.filter((k) => k !== metricKey)
      : [...selectedMetrics, metricKey]

    if (onChange) {
      onChange(updated)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedMetric(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()

    if (draggedMetric === null || draggedMetric === dropIndex) {
      setDraggedMetric(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...selectedMetrics]
    const [removed] = reordered.splice(draggedMetric, 1)
    reordered.splice(dropIndex, 0, removed)

    if (onChange) {
      onChange(reordered)
    }

    setDraggedMetric(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedMetric(null)
    setDragOverIndex(null)
  }

  const getMetricInfo = (metricKey) => {
    return allMetrics.find((m) => m.key === metricKey)
  }

  return (
    <div className="metrics-selector">
      <div className="metrics-selector-header">
        <h3>Select Metrics</h3>
        <span className="metrics-count">{selectedMetrics.length} selected</span>
      </div>

      <div className="metrics-content">
        <div className="available-metrics">
          <h4>Available Metrics</h4>
          {AVAILABLE_METRICS.map((categoryGroup) => (
            <div key={categoryGroup.category} className="metric-category">
              <h5 className="category-title">{categoryGroup.category}</h5>
              <div className="metric-list">
                {categoryGroup.metrics.map((metric) => (
                  <label
                    key={metric.key}
                    className={`metric-item ${selectedMetrics.includes(metric.key) ? 'selected' : ''}`}
                    title={metric.description}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.key)}
                      onChange={() => handleToggleMetric(metric.key)}
                    />
                    <div className="metric-info">
                      <span className="metric-name">{metric.name}</span>
                      <span className="metric-description">{metric.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="selected-metrics-panel">
          <h4>Selected Metrics (Drag to reorder)</h4>
          {selectedMetrics.length === 0 ? (
            <p className="no-metrics">No metrics selected. Choose from the left.</p>
          ) : (
            <div className="selected-metrics-list">
              {selectedMetrics.map((metricKey, index) => {
                const metricInfo = getMetricInfo(metricKey)
                if (!metricInfo) return null

                return (
                  <div
                    key={metricKey}
                    className={`selected-metric-item ${dragOverIndex === index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="drag-handle">☰</span>
                    <div className="metric-details">
                      <span className="metric-name">{metricInfo.name}</span>
                      <span className="metric-category-tag">{metricInfo.category}</span>
                    </div>
                    <button
                      onClick={() => handleToggleMetric(metricKey)}
                      className="remove-metric-btn"
                      aria-label="Remove metric"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
