import { useState, useMemo } from 'react'
import { useProjects } from '../../context/ProjectsContext'
import { TimeRangePreset } from '../../config/reportTemplates'
import './FilterPanel.css'

export default function FilterPanel({ filters = {}, onChange }) {
  const { projects } = useProjects()
  const [dateRangeType, setDateRangeType] = useState(filters.dateRange?.type || TimeRangePreset.YEAR_TO_DATE)
  const [customDateStart, setCustomDateStart] = useState(filters.dateRange?.start || '')
  const [customDateEnd, setCustomDateEnd] = useState(filters.dateRange?.end || '')
  const [selectedProjects, setSelectedProjects] = useState(filters.projects || [])
  const [selectedStatuses, setSelectedStatuses] = useState(filters.statuses || [])
  const [selectedCategories, setSelectedCategories] = useState(filters.categories || [])
  const [selectedTags, setSelectedTags] = useState(filters.tags || [])

  const availableCategories = useMemo(() => {
    const categories = new Set()
    projects.forEach((p) => {
      if (p.category) categories.add(p.category)
    })
    return Array.from(categories).sort()
  }, [projects])

  const availableTags = useMemo(() => {
    const tags = new Set()
    projects.forEach((p) => {
      if (p.customTags && Array.isArray(p.customTags)) {
        p.customTags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [projects])

  const handleDateRangeChange = (type) => {
    setDateRangeType(type)
    const dateRange = calculateDateRange(type, customDateStart, customDateEnd)
    notifyChange({ dateRange })
  }

  const handleCustomDateChange = (start, end) => {
    setCustomDateStart(start)
    setCustomDateEnd(end)
    if (dateRangeType === TimeRangePreset.CUSTOM && start && end) {
      notifyChange({ dateRange: { type: TimeRangePreset.CUSTOM, start, end } })
    }
  }

  const handleProjectToggle = (projectId) => {
    const updated = selectedProjects.includes(projectId)
      ? selectedProjects.filter((id) => id !== projectId)
      : [...selectedProjects, projectId]
    setSelectedProjects(updated)
    notifyChange({ projects: updated })
  }

  const handleStatusToggle = (status) => {
    const updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    setSelectedStatuses(updated)
    notifyChange({ statuses: updated })
  }

  const handleCategoryToggle = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(updated)
    notifyChange({ categories: updated })
  }

  const handleTagToggle = (tag) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(updated)
    notifyChange({ tags: updated })
  }

  const notifyChange = (updates) => {
    if (onChange) {
      const newFilters = {
        dateRange: calculateDateRange(dateRangeType, customDateStart, customDateEnd),
        projects: selectedProjects,
        statuses: selectedStatuses,
        categories: selectedCategories,
        tags: selectedTags,
        ...updates,
      }
      onChange(newFilters)
    }
  }

  const handleClearAll = () => {
    setDateRangeType(TimeRangePreset.YEAR_TO_DATE)
    setCustomDateStart('')
    setCustomDateEnd('')
    setSelectedProjects([])
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedTags([])
    if (onChange) {
      onChange({
        dateRange: calculateDateRange(TimeRangePreset.YEAR_TO_DATE, '', ''),
        projects: [],
        statuses: [],
        categories: [],
        tags: [],
      })
    }
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
        <button onClick={handleClearAll} className="clear-filters-btn">
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-label">Date Range</label>
        <div className="date-range-presets">
          <button
            onClick={() => handleDateRangeChange(TimeRangePreset.LAST_30_DAYS)}
            className={`preset-btn ${dateRangeType === TimeRangePreset.LAST_30_DAYS ? 'active' : ''}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleDateRangeChange(TimeRangePreset.LAST_QUARTER)}
            className={`preset-btn ${dateRangeType === TimeRangePreset.LAST_QUARTER ? 'active' : ''}`}
          >
            Last Quarter
          </button>
          <button
            onClick={() => handleDateRangeChange(TimeRangePreset.LAST_YEAR)}
            className={`preset-btn ${dateRangeType === TimeRangePreset.LAST_YEAR ? 'active' : ''}`}
          >
            Last Year
          </button>
          <button
            onClick={() => handleDateRangeChange(TimeRangePreset.YEAR_TO_DATE)}
            className={`preset-btn ${dateRangeType === TimeRangePreset.YEAR_TO_DATE ? 'active' : ''}`}
          >
            Year to Date
          </button>
          <button
            onClick={() => handleDateRangeChange(TimeRangePreset.CUSTOM)}
            className={`preset-btn ${dateRangeType === TimeRangePreset.CUSTOM ? 'active' : ''}`}
          >
            Custom
          </button>
        </div>
        {dateRangeType === TimeRangePreset.CUSTOM && (
          <div className="custom-date-inputs">
            <div className="date-input-group">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={customDateStart}
                onChange={(e) => handleCustomDateChange(e.target.value, customDateEnd)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={customDateEnd}
                onChange={(e) => handleCustomDateChange(customDateStart, e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="filter-section">
        <label className="filter-label">Projects</label>
        <div className="filter-options">
          {projects.length === 0 ? (
            <p className="no-options">No projects available</p>
          ) : (
            projects.map((project) => (
              <label key={project.id} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleProjectToggle(project.id)}
                />
                <span>{project.title || 'Untitled Project'}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Status</label>
        <div className="filter-options">
          {['draft', 'published', 'active', 'completed', 'on hold'].map((status) => (
            <label key={status} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => handleStatusToggle(status)}
              />
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Categories</label>
        <div className="filter-options">
          {availableCategories.length === 0 ? (
            <p className="no-options">No categories available</p>
          ) : (
            availableCategories.map((category) => (
              <label key={category} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <span>{category}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Tags</label>
        <div className="filter-options">
          {availableTags.length === 0 ? (
            <p className="no-options">No tags available</p>
          ) : (
            availableTags.map((tag) => (
              <label key={tag} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                />
                <span>{tag}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function calculateDateRange(type, customStart, customEnd) {
  const now = new Date()
  let start, end

  switch (type) {
    case TimeRangePreset.LAST_30_DAYS:
      end = now
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      break
    case TimeRangePreset.LAST_QUARTER:
      end = now
      start = new Date(now)
      start.setMonth(start.getMonth() - 3)
      break
    case TimeRangePreset.LAST_YEAR:
      end = now
      start = new Date(now)
      start.setFullYear(start.getFullYear() - 1)
      break
    case TimeRangePreset.YEAR_TO_DATE:
      end = now
      start = new Date(now.getFullYear(), 0, 1)
      break
    case TimeRangePreset.CUSTOM:
      if (customStart && customEnd) {
        return { type, start: customStart, end: customEnd }
      }
      return { type, start: null, end: null }
    default:
      end = now
      start = new Date(now.getFullYear(), 0, 1)
  }

  return {
    type,
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
