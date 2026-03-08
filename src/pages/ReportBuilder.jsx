import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReports } from '../context/ReportsContext'
import TemplateSelector from '../components/Reports/TemplateSelector'
import FilterPanel from '../components/ReportBuilder/FilterPanel'
import MetricsSelector from '../components/ReportBuilder/MetricsSelector'
import VisualizationPicker from '../components/ReportBuilder/VisualizationPicker'
import './ReportBuilder.css'

const STEPS = [
  { id: 1, name: 'Template', description: 'Select report type or start from scratch' },
  { id: 2, name: 'Filters', description: 'Configure filters' },
  { id: 3, name: 'Metrics', description: 'Select metrics' },
  { id: 4, name: 'Visualizations', description: 'Choose chart types' },
  { id: 5, name: 'Layout', description: 'Configure layout and formatting' },
  { id: 6, name: 'Preview', description: 'Preview and save/export' },
]

export default function ReportBuilder() {
  const navigate = useNavigate()
  const { createCustomReport, loading } = useReports()

  const [currentStep, setCurrentStep] = useState(1)
  const [reportConfig, setReportConfig] = useState({
    title: '',
    description: '',
    template: null,
    filters: {},
    metrics: [],
    visualizations: {},
    layout: {
      columns: 2,
      showHeader: true,
      showFooter: true,
    },
  })

  const handleTemplateSelect = (template) => {
    setReportConfig((prev) => ({
      ...prev,
      template,
      title: template ? template.name : prev.title,
      metrics: template ? template.metrics : prev.metrics,
      visualizations: template
        ? template.visualizations.reduce((acc, viz) => {
            acc[viz.metric] = viz.type
            return acc
          }, {})
        : prev.visualizations,
    }))
  }

  const handleFiltersChange = (filters) => {
    setReportConfig((prev) => ({ ...prev, filters }))
  }

  const handleMetricsChange = (metrics) => {
    setReportConfig((prev) => ({ ...prev, metrics }))
  }

  const handleVisualizationsChange = (visualizations) => {
    setReportConfig((prev) => ({ ...prev, visualizations }))
  }

  const handleLayoutChange = (field, value) => {
    setReportConfig((prev) => ({
      ...prev,
      layout: { ...prev.layout, [field]: value },
    }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveReport = async () => {
    try {
      const config = {
        title: reportConfig.title || 'Custom Report',
        description: reportConfig.description,
        templateId: reportConfig.template?.id || 'custom',
        metrics: reportConfig.metrics,
        visualizations: reportConfig.visualizations,
        filters: reportConfig.filters,
        layout: reportConfig.layout,
      }

      const report = await createCustomReport(config)
      navigate(`/reports/${report.id}`)
    } catch (error) {
      console.error('Failed to save report:', error)
      alert('Failed to save report. Please try again.')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return true
      case 3:
        return reportConfig.metrics.length > 0
      case 4:
        return reportConfig.metrics.every((m) => reportConfig.visualizations[m])
      case 5:
        return true
      case 6:
        return reportConfig.title.trim().length > 0
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Select Report Template</h2>
              <p>Choose a pre-configured template or start from scratch</p>
            </div>
            <TemplateSelector
              onSelectTemplate={handleTemplateSelect}
              selectedTemplateId={reportConfig.template?.id}
            />
            <div className="custom-report-option">
              <button
                onClick={() => handleTemplateSelect(null)}
                className={`custom-report-btn ${!reportConfig.template ? 'active' : ''}`}
              >
                <span className="icon">✨</span>
                <span className="text">Start from Scratch (Custom Report)</span>
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Configure Filters</h2>
              <p>Set date range, projects, and other filters</p>
            </div>
            <FilterPanel filters={reportConfig.filters} onChange={handleFiltersChange} />
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Select Metrics</h2>
              <p>Choose the metrics to include in your report</p>
            </div>
            <MetricsSelector selectedMetrics={reportConfig.metrics} onChange={handleMetricsChange} />
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Choose Visualizations</h2>
              <p>Select chart type for each metric</p>
            </div>
            <VisualizationPicker
              metrics={reportConfig.metrics}
              visualizations={reportConfig.visualizations}
              onChange={handleVisualizationsChange}
            />
          </div>
        )

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Configure Layout</h2>
              <p>Customize the report layout and formatting</p>
            </div>
            <div className="layout-config">
              <div className="config-section">
                <label className="config-label">Report Title</label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                  placeholder="Enter report title"
                  className="config-input"
                />
              </div>

              <div className="config-section">
                <label className="config-label">Description</label>
                <textarea
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                  placeholder="Enter report description (optional)"
                  className="config-textarea"
                  rows="3"
                />
              </div>

              <div className="config-section">
                <label className="config-label">Layout Columns</label>
                <div className="radio-group">
                  {[1, 2, 3].map((cols) => (
                    <label key={cols} className="radio-option">
                      <input
                        type="radio"
                        name="columns"
                        value={cols}
                        checked={reportConfig.layout.columns === cols}
                        onChange={() => handleLayoutChange('columns', cols)}
                      />
                      <span>{cols} Column{cols > 1 ? 's' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="config-section">
                <label className="config-label">Display Options</label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={reportConfig.layout.showHeader}
                      onChange={(e) => handleLayoutChange('showHeader', e.target.checked)}
                    />
                    <span>Show Header</span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={reportConfig.layout.showFooter}
                      onChange={(e) => handleLayoutChange('showFooter', e.target.checked)}
                    />
                    <span>Show Footer</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Preview and Save</h2>
              <p>Review your report and save for later use</p>
            </div>
            <div className="preview-section">
              <div className="report-summary">
                <h3>Report Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="label">Title:</span>
                    <span className="value">{reportConfig.title || 'Untitled Report'}</span>
                  </div>
                  {reportConfig.description && (
                    <div className="summary-row">
                      <span className="label">Description:</span>
                      <span className="value">{reportConfig.description}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span className="label">Template:</span>
                    <span className="value">{reportConfig.template?.name || 'Custom'}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Metrics:</span>
                    <span className="value">{reportConfig.metrics.length} selected</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Layout:</span>
                    <span className="value">{reportConfig.layout.columns} column(s)</span>
                  </div>
                </div>
              </div>

              <div className="preview-placeholder">
                <div className="preview-note">
                  <p>📊 Report preview will be generated when you save the report</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="report-builder">
      <div className="builder-container">
        <div className="builder-header">
          <h1>Custom Report Builder</h1>
          <button onClick={() => navigate('/reports')} className="close-builder-btn">
            Close
          </button>
        </div>

        <div className="wizard-steps">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`wizard-step ${currentStep === step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-info">
                <div className="step-name">{step.name}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="builder-main">{renderStepContent()}</div>

        <div className="builder-footer">
          <button onClick={handlePrevious} disabled={currentStep === 1} className="btn btn-secondary">
            Previous
          </button>

          <div className="step-indicator">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <button onClick={handleNext} disabled={!canProceed()} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button onClick={handleSaveReport} disabled={!canProceed() || loading} className="btn btn-success">
              {loading ? 'Saving...' : 'Save Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
