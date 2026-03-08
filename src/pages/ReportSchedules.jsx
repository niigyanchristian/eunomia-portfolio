import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useReports } from '../context/ReportsContext'
import ScheduleForm from '../components/Reports/ScheduleForm'
import {
  getAllSchedules,
  deleteSchedule,
  toggleSchedule,
  getExecutionHistory,
  executeSchedule,
} from '../services/schedulerService'
import { getAllGroups, getEmailsFromGroups } from '../utils/stakeholderGroups'
import './ReportSchedules.css'

export default function ReportSchedules() {
  const { customReports, availableTemplates } = useReports()
  const [schedules, setSchedules] = useState(() => getAllSchedules())
  const [executionHistory, setExecutionHistory] = useState(() => getExecutionHistory())
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [activeTab, setActiveTab] = useState('schedules')

  const loadSchedules = () => {
    const allSchedules = getAllSchedules()
    setSchedules(allSchedules)
  }

  const loadHistory = () => {
    const history = getExecutionHistory()
    setExecutionHistory(history)
  }

  const handleCreateNew = () => {
    setEditingSchedule(null)
    setShowForm(true)
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleDelete = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        deleteSchedule(scheduleId)
        loadSchedules()
        if (selectedSchedule?.id === scheduleId) {
          setSelectedSchedule(null)
        }
      } catch (error) {
        console.error('Failed to delete schedule:', error)
        alert('Failed to delete schedule. Please try again.')
      }
    }
  }

  const handleToggle = (scheduleId) => {
    try {
      toggleSchedule(scheduleId)
      loadSchedules()
    } catch (error) {
      console.error('Failed to toggle schedule:', error)
      alert('Failed to toggle schedule. Please try again.')
    }
  }

  const handleExecuteNow = (scheduleId) => {
    if (window.confirm('Execute this schedule now?')) {
      try {
        executeSchedule(scheduleId)
        loadSchedules()
        loadHistory()
        alert('Schedule executed successfully! Report has been generated.')
      } catch (error) {
        console.error('Failed to execute schedule:', error)
        alert('Failed to execute schedule: ' + error.message)
      }
    }
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingSchedule(null)
    loadSchedules()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSchedule(null)
  }

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule)
  }

  const getReportName = (reportId) => {
    const customReport = customReports.find((r) => r.id === reportId)
    if (customReport) return customReport.title

    const template = availableTemplates.find((t) => t.id === reportId)
    if (template) return template.name

    return 'Unknown Report'
  }

  const getFrequencyDisplay = (schedule) => {
    const { frequency, weekDays, monthDay } = schedule

    switch (frequency) {
      case 'daily':
        return 'Daily'
      case 'weekly': {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const selectedDays = weekDays.map((d) => days[d]).join(', ')
        return `Weekly (${selectedDays})`
      }
      case 'monthly':
        return `Monthly (Day ${monthDay})`
      case 'quarterly':
        return 'Quarterly'
      case 'yearly':
        return 'Yearly'
      case 'custom':
        return `Custom (${schedule.cronExpression})`
      default:
        return frequency
    }
  }

  const getTotalRecipients = (schedule) => {
    const directEmails = schedule.recipients?.length || 0
    const groupEmails = getEmailsFromGroups(schedule.recipientGroups || [])
    return directEmails + groupEmails.length
  }

  const renderSchedulesList = () => {
    if (schedules.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Schedules Yet</h3>
          <p>Create your first report schedule to automate distribution</p>
          <button onClick={handleCreateNew} className="btn btn-primary">
            Create Schedule
          </button>
        </div>
      )
    }

    return (
      <div className="schedules-list">
        {schedules.map((schedule) => (
          <div key={schedule.id} className={`schedule-card ${!schedule.enabled ? 'disabled' : ''}`}>
            <div className="schedule-header">
              <div className="schedule-title">
                <h3>{schedule.reportTitle || getReportName(schedule.reportId)}</h3>
                <span className={`schedule-status ${schedule.enabled ? 'active' : 'inactive'}`}>
                  {schedule.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="schedule-actions">
                <button
                  onClick={() => handleToggle(schedule.id)}
                  className="btn-icon"
                  title={schedule.enabled ? 'Disable' : 'Enable'}
                >
                  {schedule.enabled ? '⏸' : '▶'}
                </button>
                <button
                  onClick={() => handleExecuteNow(schedule.id)}
                  className="btn-icon"
                  title="Execute now"
                  disabled={!schedule.enabled}
                >
                  ▶️
                </button>
                <button
                  onClick={() => handleEdit(schedule)}
                  className="btn-icon"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="btn-icon btn-danger"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="schedule-details">
              <div className="detail-item">
                <span className="label">Frequency:</span>
                <span className="value">{getFrequencyDisplay(schedule)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time:</span>
                <span className="value">{schedule.timeOfDay}</span>
              </div>
              <div className="detail-item">
                <span className="label">Format:</span>
                <span className="value">{schedule.exportFormat ? schedule.exportFormat.toUpperCase() : 'PDF'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Recipients:</span>
                <span className="value">{getTotalRecipients(schedule)}</span>
              </div>
            </div>

            <div className="schedule-footer">
              <div className="schedule-timing">
                {schedule.lastRunAt && (
                  <span className="last-run">
                    Last run: {format(parseISO(schedule.lastRunAt), 'MMM d, yyyy HH:mm')}
                  </span>
                )}
                {schedule.enabled && schedule.nextRunAt && (
                  <span className="next-run">
                    Next run: {format(parseISO(schedule.nextRunAt), 'MMM d, yyyy HH:mm')}
                  </span>
                )}
                {schedule.endDate && (
                  <span className="end-date">
                    Ends: {format(parseISO(schedule.endDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleViewDetails(schedule)}
                className="btn-link"
              >
                View Details
              </button>
            </div>

            {schedule.executionCount > 0 && (
              <div className="execution-stats">
                Executed {schedule.executionCount} {schedule.executionCount === 1 ? 'time' : 'times'}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderHistory = () => {
    if (executionHistory.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Execution History</h3>
          <p>Schedule executions will appear here</p>
        </div>
      )
    }

    return (
      <div className="history-list">
        <table className="history-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Executed At</th>
              <th>Format</th>
              <th>Recipients</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {executionHistory.map((execution) => (
              <tr key={execution.id}>
                <td>{execution.reportTitle}</td>
                <td>{format(parseISO(execution.executedAt), 'MMM d, yyyy HH:mm')}</td>
                <td>{execution.exportFormat ? execution.exportFormat.toUpperCase() : 'PDF'}</td>
                <td>{execution.recipientCount}</td>
                <td>
                  <span className={`status-badge status-${execution.status}`}>
                    {execution.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderDetailsModal = () => {
    if (!selectedSchedule) return null

    return (
      <div className="modal-overlay" onClick={() => setSelectedSchedule(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Schedule Details</h2>
            <button onClick={() => setSelectedSchedule(null)} className="btn-close">
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="detail-section">
              <h3>Report</h3>
              <p>{selectedSchedule.reportTitle || getReportName(selectedSchedule.reportId)}</p>
            </div>

            <div className="detail-section">
              <h3>Schedule</h3>
              <p><strong>Frequency:</strong> {getFrequencyDisplay(selectedSchedule)}</p>
              <p><strong>Time:</strong> {selectedSchedule.timeOfDay}</p>
              <p><strong>Start Date:</strong> {format(parseISO(selectedSchedule.startDate), 'MMM d, yyyy')}</p>
              {selectedSchedule.endDate && (
                <p><strong>End Date:</strong> {format(parseISO(selectedSchedule.endDate), 'MMM d, yyyy')}</p>
              )}
            </div>

            <div className="detail-section">
              <h3>Export Settings</h3>
              <p><strong>Format:</strong> {selectedSchedule.exportFormat ? selectedSchedule.exportFormat.toUpperCase() : 'PDF'}</p>
              <p><strong>Delivery:</strong> {selectedSchedule.includeAttachment ? 'As attachment' : 'Download link'}</p>
            </div>

            <div className="detail-section">
              <h3>Recipients</h3>
              {selectedSchedule.recipients && selectedSchedule.recipients.length > 0 && (
                <div>
                  <p><strong>Direct:</strong></p>
                  <ul>
                    {selectedSchedule.recipients.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedSchedule.recipientGroups && selectedSchedule.recipientGroups.length > 0 && (
                <div>
                  <p><strong>Groups:</strong></p>
                  <ul>
                    {selectedSchedule.recipientGroups.map((groupId) => {
                      const groups = getAllGroups()
                      const group = groups.find((g) => g.id === groupId)
                      return group ? <li key={groupId}>{group.name}</li> : null
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Statistics</h3>
              <p><strong>Executions:</strong> {selectedSchedule.executionCount}</p>
              {selectedSchedule.lastRunAt && (
                <p><strong>Last Run:</strong> {format(parseISO(selectedSchedule.lastRunAt), 'MMM d, yyyy HH:mm')}</p>
              )}
              {selectedSchedule.nextRunAt && selectedSchedule.enabled && (
                <p><strong>Next Run:</strong> {format(parseISO(selectedSchedule.nextRunAt), 'MMM d, yyyy HH:mm')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="report-schedules-page">
        <div className="page-header">
          <h1>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</h1>
        </div>
        <ScheduleForm
          schedule={editingSchedule}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="report-schedules-page">
      <div className="page-header">
        <h1>Report Schedules</h1>
        <button onClick={handleCreateNew} className="btn btn-primary">
          + Create Schedule
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          Schedules ({schedules.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Execution History ({executionHistory.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'schedules' && renderSchedulesList()}
        {activeTab === 'history' && renderHistory()}
      </div>

      {renderDetailsModal()}
    </div>
  )
}
