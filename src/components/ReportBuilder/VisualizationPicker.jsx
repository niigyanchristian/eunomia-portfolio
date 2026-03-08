import { useState } from 'react'
import { ChartType } from '../../config/reportTemplates'
import './VisualizationPicker.css'

const CHART_TYPES = [
  {
    type: ChartType.BAR,
    name: 'Bar Chart',
    icon: '📊',
    description: 'Compare values across categories',
    bestFor: ['comparisons', 'rankings', 'distributions'],
  },
  {
    type: ChartType.LINE,
    name: 'Line Chart',
    icon: '📈',
    description: 'Show trends over time',
    bestFor: ['trends', 'time-series', 'progression'],
  },
  {
    type: ChartType.PIE,
    name: 'Pie Chart',
    icon: '🥧',
    description: 'Display parts of a whole',
    bestFor: ['percentages', 'proportions', 'composition'],
  },
  {
    type: ChartType.AREA,
    name: 'Area Chart',
    icon: '📉',
    description: 'Emphasize magnitude of change over time',
    bestFor: ['cumulative', 'volume', 'flow'],
  },
  {
    type: ChartType.SCATTER,
    name: 'Scatter Plot',
    icon: '⚫',
    description: 'Show relationship between variables',
    bestFor: ['correlations', 'clusters', 'outliers'],
  },
  {
    type: ChartType.COMPOSED,
    name: 'Composed Chart',
    icon: '📊',
    description: 'Combine multiple chart types',
    bestFor: ['multi-metric', 'complex-data', 'overlays'],
  },
  {
    type: ChartType.RADAR,
    name: 'Radar Chart',
    icon: '🎯',
    description: 'Compare multiple variables',
    bestFor: ['multi-dimensional', 'performance', 'profiles'],
  },
]

const METRIC_RECOMMENDATIONS = {
  completionRate: [ChartType.PIE, ChartType.BAR],
  velocity: [ChartType.LINE, ChartType.AREA],
  statusDistribution: [ChartType.PIE, ChartType.BAR],
  categoryBreakdown: [ChartType.BAR, ChartType.PIE],
  trendData: [ChartType.LINE, ChartType.AREA],
  budgetUtilization: [ChartType.BAR, ChartType.COMPOSED],
  performanceTrend: [ChartType.LINE, ChartType.AREA],
  qualityMetrics: [ChartType.RADAR, ChartType.BAR],
}

export default function VisualizationPicker({ metrics = [], visualizations = {}, onChange }) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0] || null)

  const handleChartTypeSelect = (metricKey, chartType) => {
    const updated = { ...visualizations, [metricKey]: chartType }
    if (onChange) {
      onChange(updated)
    }
  }

  const getRecommendedCharts = (metricKey) => {
    return METRIC_RECOMMENDATIONS[metricKey] || [ChartType.BAR, ChartType.LINE]
  }

  const isRecommended = (metricKey, chartType) => {
    return getRecommendedCharts(metricKey).includes(chartType)
  }

  const formatMetricName = (metricKey) => {
    return metricKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <div className="visualization-picker">
      <div className="visualization-picker-header">
        <h3>Choose Visualizations</h3>
        <p className="picker-subtitle">Select chart type for each metric</p>
      </div>

      {metrics.length === 0 ? (
        <div className="no-metrics-message">
          <p>No metrics selected. Please select metrics first.</p>
        </div>
      ) : (
        <div className="picker-content">
          <div className="metrics-list">
            <h4>Metrics</h4>
            {metrics.map((metricKey) => (
              <button
                key={metricKey}
                onClick={() => setSelectedMetric(metricKey)}
                className={`metric-button ${selectedMetric === metricKey ? 'active' : ''}`}
              >
                <span className="metric-button-name">{formatMetricName(metricKey)}</span>
                {visualizations[metricKey] && (
                  <span className="selected-chart-indicator">
                    {CHART_TYPES.find((ct) => ct.type === visualizations[metricKey])?.icon || '📊'}
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedMetric && (
            <div className="chart-types-panel">
              <h4>
                Chart Type for <strong>{formatMetricName(selectedMetric)}</strong>
              </h4>
              <div className="chart-types-grid">
                {CHART_TYPES.map((chartType) => {
                  const recommended = isRecommended(selectedMetric, chartType.type)
                  const selected = visualizations[selectedMetric] === chartType.type

                  return (
                    <div
                      key={chartType.type}
                      onClick={() => handleChartTypeSelect(selectedMetric, chartType.type)}
                      className={`chart-type-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChartTypeSelect(selectedMetric, chartType.type)
                        }
                      }}
                    >
                      {recommended && <span className="recommended-badge">Recommended</span>}
                      {selected && <span className="selected-badge">✓</span>}
                      <div className="chart-type-icon">{chartType.icon}</div>
                      <h5 className="chart-type-name">{chartType.name}</h5>
                      <p className="chart-type-description">{chartType.description}</p>
                      <div className="chart-type-tags">
                        {chartType.bestFor.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {metrics.length > 0 && (
        <div className="visualization-summary">
          <h4>Summary</h4>
          <div className="summary-list">
            {metrics.map((metricKey) => (
              <div key={metricKey} className="summary-item">
                <span className="summary-metric">{formatMetricName(metricKey)}</span>
                <span className="summary-arrow">→</span>
                <span className="summary-chart">
                  {visualizations[metricKey]
                    ? CHART_TYPES.find((ct) => ct.type === visualizations[metricKey])?.name || 'Not selected'
                    : 'Not selected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
