import { useState } from 'react'
import { BarChart } from '../Charts/BarChart'
import { PieChart } from '../Charts/PieChart'
import { AreaChart } from '../Charts/AreaChart'
import { MetricsCard } from './MetricsCard'
import { DataTable } from './DataTable'
import { format } from 'date-fns'
import './ReportPreview.css'

export const ReportPreview = ({
  report,
  onExport = null,
  loading = false,
  error = null
}) => {
  const [exportFormat, setExportFormat] = useState('pdf')

  if (loading) {
    return (
      <div className="report-preview-container loading">
        <div className="report-spinner"></div>
        <p>Loading report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="report-preview-container error">
        <p className="report-error-message">{error}</p>
      </div>
    )
  }

  if (!report || !report.data) {
    return (
      <div className="report-preview-container empty">
        <p className="report-empty-message">No report data available</p>
      </div>
    )
  }

  const { data, title, createdAt } = report
  const { metrics, comparisons, summary } = data

  const handleExport = () => {
    if (onExport) {
      onExport(report.id, exportFormat)
    }
  }

  const renderMetricsCards = () => {
    const cards = []

    if (metrics.totalProjects !== undefined) {
      cards.push(
        <MetricsCard
          key="totalProjects"
          title="Total Projects"
          value={metrics.totalProjects}
          type="count"
          yoyChange={comparisons?.yoy}
          qoqChange={comparisons?.qoq}
          trend={comparisons?.yoy > 0 ? 'positive' : comparisons?.yoy < 0 ? 'negative' : 'neutral'}
        />
      )
    }

    if (metrics.completionRate !== undefined) {
      cards.push(
        <MetricsCard
          key="completionRate"
          title="Completion Rate"
          value={metrics.completionRate}
          type="percentage"
          trend={metrics.completionRate >= 75 ? 'positive' : metrics.completionRate >= 50 ? 'neutral' : 'negative'}
        />
      )
    }

    if (metrics.overdueProjects !== undefined) {
      cards.push(
        <MetricsCard
          key="overdueProjects"
          title="Overdue Projects"
          value={metrics.overdueProjects}
          type="count"
          trend={metrics.overdueProjects === 0 ? 'positive' : 'negative'}
        />
      )
    }

    if (metrics.atRiskProjects !== undefined) {
      cards.push(
        <MetricsCard
          key="atRiskProjects"
          title="At Risk Projects"
          value={metrics.atRiskProjects}
          type="count"
          trend={metrics.atRiskProjects === 0 ? 'positive' : 'negative'}
        />
      )
    }

    if (metrics.velocity !== undefined) {
      cards.push(
        <MetricsCard
          key="velocity"
          title="Average Velocity"
          value={metrics.velocity}
          type="decimal"
          trend="neutral"
        />
      )
    }

    return cards
  }

  const renderCategoryChart = () => {
    if (!metrics.categoryBreakdown) return null

    const chartData = Object.entries(metrics.categoryBreakdown).map(([name, value]) => ({
      name,
      value
    }))

    return (
      <div className="report-section">
        <h3 className="section-title">Category Breakdown</h3>
        <PieChart data={chartData} dataKey="value" nameKey="name" height={350} />
      </div>
    )
  }

  const renderStatusChart = () => {
    if (!metrics.statusDistribution) return null

    const chartData = Object.entries(metrics.statusDistribution).map(([label, value]) => ({
      label,
      value
    }))

    return (
      <div className="report-section">
        <h3 className="section-title">Status Distribution</h3>
        <BarChart
          data={chartData}
          xKey="label"
          bars={[{ dataKey: 'value', name: 'Projects' }]}
          height={300}
          layout="horizontal"
        />
      </div>
    )
  }

  const renderTrendChart = () => {
    if (!metrics.timeline && !metrics.trendData) return null

    const trendData = metrics.timeline || metrics.trendData

    return (
      <div className="report-section">
        <h3 className="section-title">Project Timeline</h3>
        <AreaChart
          data={trendData}
          xKey="label"
          areas={[
            { dataKey: 'published', name: 'Published', color: '#10b981' },
            { dataKey: 'draft', name: 'Draft', color: '#f59e0b' }
          ]}
          height={300}
          stacked
        />
      </div>
    )
  }

  const renderRecentUpdates = () => {
    if (!metrics.recentUpdates || metrics.recentUpdates.length === 0) return null

    const columns = [
      { key: 'title', label: 'Project Title', sortable: true, filterable: true },
      { key: 'status', label: 'Status', sortable: true, filterable: true },
      {
        key: 'updatedAt',
        label: 'Last Updated',
        sortable: true,
        filterable: false,
        render: (value) => format(new Date(value), 'MMM dd, yyyy')
      }
    ]

    return (
      <div className="report-section">
        <h3 className="section-title">Recent Updates</h3>
        <DataTable
          data={metrics.recentUpdates}
          columns={columns}
          pageSize={5}
          exportFileName={`${title}-recent-updates`}
        />
      </div>
    )
  }

  const renderMilestones = () => {
    if (!metrics.milestones || metrics.milestones.length === 0) return null

    const columns = [
      { key: 'title', label: 'Project Title', sortable: true, filterable: true },
      { key: 'status', label: 'Status', sortable: true, filterable: true },
      {
        key: 'completionDate',
        label: 'Completion Date',
        sortable: true,
        filterable: false,
        render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A'
      }
    ]

    return (
      <div className="report-section">
        <h3 className="section-title">Project Milestones</h3>
        <DataTable
          data={metrics.milestones}
          columns={columns}
          pageSize={10}
          exportFileName={`${title}-milestones`}
        />
      </div>
    )
  }

  return (
    <div className="report-preview-container">
      <div className="report-header no-print">
        <div className="report-title-section">
          <h1 className="report-title">{title}</h1>
          <p className="report-meta">
            Generated on {format(new Date(createdAt), 'MMMM dd, yyyy')}
          </p>
          {summary && (
            <p className="report-summary">
              Showing {summary.totalProjects} projects
              {summary.filtersApplied > 0 && ` (${summary.filtersApplied} filters applied)`}
            </p>
          )}
        </div>
        {onExport && (
          <div className="report-actions">
            <select
              className="export-format-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="powerpoint">PowerPoint</option>
            </select>
            <button className="export-report-btn" onClick={handleExport}>
              Export Report
            </button>
            <button className="print-report-btn" onClick={() => window.print()}>
              Print
            </button>
          </div>
        )}
      </div>

      <div className="report-content">
        <section className="metrics-grid">
          {renderMetricsCards()}
        </section>

        {renderCategoryChart()}
        {renderStatusChart()}
        {renderTrendChart()}
        {renderRecentUpdates()}
        {renderMilestones()}
      </div>
    </div>
  )
}
