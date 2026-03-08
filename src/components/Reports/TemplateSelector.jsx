import { useState, useMemo } from 'react'
import { REPORT_TEMPLATES, getAllCategories, getTemplatesByCategory, searchTemplates, TemplateCategory } from '../../config/reportTemplates'
import './TemplateSelector.css'

/**
 * TemplateSelector Component
 * Provides UI to browse, search, and select report templates
 */
export default function TemplateSelector({ onSelectTemplate, selectedTemplateId = null }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = useMemo(() => getAllCategories(), [])

  const filteredTemplates = useMemo(() => {
    let templates = REPORT_TEMPLATES

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery)
    } else if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory)
    }

    return templates
  }, [searchQuery, selectedCategory])

  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      [TemplateCategory.EXECUTIVE]: 'Executive',
      [TemplateCategory.ANALYSIS]: 'Analysis',
      [TemplateCategory.FINANCIAL]: 'Financial',
      [TemplateCategory.OPERATIONS]: 'Operations',
      [TemplateCategory.STRATEGIC]: 'Strategic',
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category) => {
    const icons = {
      [TemplateCategory.EXECUTIVE]: '👔',
      [TemplateCategory.ANALYSIS]: '📊',
      [TemplateCategory.FINANCIAL]: '💰',
      [TemplateCategory.OPERATIONS]: '⚙️',
      [TemplateCategory.STRATEGIC]: '🎯',
    }
    return icons[category] || '📄'
  }

  return (
    <div className="template-selector">
      <div className="selector-header">
        <h2>Select Report Template</h2>
        <p className="selector-subtitle">
          Choose from {REPORT_TEMPLATES.length} pre-configured templates
        </p>
      </div>

      <div className="selector-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search templates"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-filter ${selectedCategory === 'all' ? 'active' : ''}`}
            aria-pressed={selectedCategory === 'all'}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
              aria-pressed={selectedCategory === category}
            >
              {getCategoryIcon(category)} {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <p>No templates found matching your search.</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
              onClick={() => handleSelectTemplate(template)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectTemplate(template)
                }
              }}
            >
              <div className="template-card-header">
                <span className="template-icon">{getCategoryIcon(template.category)}</span>
                <span className={`category-badge category-${template.category}`}>
                  {getCategoryLabel(template.category)}
                </span>
              </div>

              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>

              <div className="template-details">
                <div className="detail-item">
                  <span className="detail-label">Metrics</span>
                  <span className="detail-value">{template.metrics.length}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Charts</span>
                  <span className="detail-value">{template.visualizations.length}</span>
                </div>
              </div>

              <div className="template-metrics">
                <p className="metrics-label">Key Metrics:</p>
                <div className="metrics-tags">
                  {template.metrics.slice(0, 4).map((metric) => (
                    <span key={metric} className="metric-tag">
                      {formatMetricName(metric)}
                    </span>
                  ))}
                  {template.metrics.length > 4 && (
                    <span className="metric-tag more">+{template.metrics.length - 4} more</span>
                  )}
                </div>
              </div>

              {selectedTemplateId === template.id && (
                <div className="selected-indicator">
                  <span>✓ Selected</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredTemplates.length > 0 && (
        <div className="selector-footer">
          <p className="results-count">
            Showing {filteredTemplates.length} of {REPORT_TEMPLATES.length} templates
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Helper: Format metric name for display
 */
function formatMetricName(metricKey) {
  return metricKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
