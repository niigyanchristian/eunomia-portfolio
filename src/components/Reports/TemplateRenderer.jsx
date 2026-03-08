import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { getTemplateById, ChartType } from '../../config/reportTemplates'
import './TemplateRenderer.css'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D']

/**
 * TemplateRenderer Component
 * Renders a report template with provided data
 * Handles different template layouts and visualization types
 */
export default function TemplateRenderer({ templateId, data, config = {} }) {
  const template = useMemo(() => getTemplateById(templateId), [templateId])

  if (!template) {
    return (
      <div className="template-renderer-error">
        <p>Template not found: {templateId}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="template-renderer-empty">
        <p>No data available for this report</p>
      </div>
    )
  }

  const renderMetricCard = (metricKey) => {
    const value = data[metricKey]
    if (value === undefined || value === null) return null

    const displayValue = typeof value === 'number'
      ? value.toLocaleString()
      : typeof value === 'object'
        ? JSON.stringify(value).length
        : String(value)

    return (
      <div key={metricKey} className="metric-card">
        <h4>{formatMetricLabel(metricKey)}</h4>
        <p className="metric-value">{displayValue}</p>
      </div>
    )
  }

  const renderChart = (visualization) => {
    const chartData = prepareChartData(data, visualization.metric)
    if (!chartData || chartData.length === 0) {
      return (
        <div key={visualization.metric} className="chart-empty">
          <p>No data for {visualization.title}</p>
        </div>
      )
    }

    return (
      <div key={visualization.metric} className="chart-container">
        <h3>{visualization.title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          {renderChartByType(visualization.type, chartData)}
        </ResponsiveContainer>
      </div>
    )
  }

  const renderChartByType = (type, chartData) => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case ChartType.LINE:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        )

      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      case ChartType.AREA:
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        )

      case ChartType.SCATTER:
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="X" />
            <YAxis dataKey="y" name="Y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data" data={chartData} fill="#8884d8" />
          </ScatterChart>
        )

      case ChartType.RADAR:
        return (
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        )

      case ChartType.COMPOSED:
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
            <Line type="monotone" dataKey="target" stroke="#ff7300" />
          </ComposedChart>
        )

      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        )
    }
  }

  const renderSection = (section) => {
    switch (section.type) {
      case 'summary':
      case 'metrics':
      case 'kpis':
        return (
          <div key={section.type} className={`section-${section.type} section-${section.position}`}>
            <div className="metrics-grid">
              {template.metrics.map(renderMetricCard)}
            </div>
          </div>
        )

      case 'charts':
        return (
          <div key={section.type} className={`section-charts section-${section.position} columns-${section.columns || 2}`}>
            {template.visualizations.map(renderChart)}
          </div>
        )

      case 'table':
        return (
          <div key={section.type} className={`section-table section-${section.position}`}>
            {renderDataTable(data, template.metrics)}
          </div>
        )

      case 'alerts':
        return (
          <div key={section.type} className={`section-alerts section-${section.position}`}>
            {renderAlerts(data)}
          </div>
        )

      default:
        return (
          <div key={section.type} className={`section-${section.type} section-${section.position}`}>
            <p>Section type: {section.type}</p>
          </div>
        )
    }
  }

  const renderDataTable = (reportData) => {
    if (!reportData.projectDetails && !Array.isArray(reportData)) {
      return <p>No detailed data available</p>
    }

    const tableData = reportData.projectDetails || []
    if (tableData.length === 0) {
      return <p>No projects to display</p>
    }

    return (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Category</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tableData.slice(0, 10).map((project, index) => (
              <tr key={index}>
                <td>{project.name || project.title || 'Unnamed Project'}</td>
                <td><span className={`status-badge status-${project.status}`}>{project.status}</span></td>
                <td>{project.category || 'N/A'}</td>
                <td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderAlerts = (reportData) => {
    const alerts = []

    if (reportData.overdueProjects > 0) {
      alerts.push({ type: 'warning', message: `${reportData.overdueProjects} overdue projects` })
    }
    if (reportData.atRiskProjects > 0) {
      alerts.push({ type: 'warning', message: `${reportData.atRiskProjects} at-risk projects` })
    }
    if (reportData.completionRate < 50) {
      alerts.push({ type: 'info', message: `Low completion rate: ${reportData.completionRate}%` })
    }

    if (alerts.length === 0) {
      return <p className="no-alerts">No alerts at this time</p>
    }

    return (
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="template-renderer">
      <div className="template-header">
        <h2>{config.title || template.name}</h2>
        <p className="template-description">{template.description}</p>
        {data.dateRange && (
          <p className="date-range">
            {data.dateRange.start} to {data.dateRange.end}
          </p>
        )}
      </div>

      <div className="template-layout">
        {template.layout.sections.map(renderSection)}
      </div>
    </div>
  )
}

/**
 * Helper: Format metric label for display
 */
function formatMetricLabel(metricKey) {
  return metricKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Helper: Prepare data for chart rendering
 */
function prepareChartData(data, metricKey) {
  const value = data[metricKey]

  if (!value) return []

  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      name: item.label || item.name || `Item ${index + 1}`,
      value: item.value || item.total || item.count || 0,
      target: item.target,
      x: item.x,
      y: item.y,
    }))
  }

  if (typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => ({
      name: key,
      value: typeof val === 'number' ? val : 0,
    }))
  }

  return []
}
