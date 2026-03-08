import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useReports } from '../../context/ReportsContext'
import { getAllGroups } from '../../utils/stakeholderGroups'
import { createSchedule, updateSchedule } from '../../services/schedulerService'
import './ScheduleForm.css'

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function ScheduleForm({ schedule, onSave, onCancel }) {
  const { customReports, availableTemplates } = useReports()
  const stakeholderGroups = useMemo(() => getAllGroups(), [])
  const [formData, setFormData] = useState(() => {
    if (schedule) {
      return {
        reportId: schedule.reportId,
        reportTitle: schedule.reportTitle,
        frequency: schedule.frequency,
        weekDays: schedule.weekDays || [1],
        monthDay: schedule.monthDay || 1,
        cronExpression: schedule.cronExpression || '',
        startDate: schedule.startDate ? format(new Date(schedule.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        endDate: schedule.endDate ? format(new Date(schedule.endDate), 'yyyy-MM-dd') : '',
        timeOfDay: schedule.timeOfDay || '09:00',
        exportFormat: schedule.exportFormat || 'pdf',
        recipients: schedule.recipients?.join(', ') || '',
        recipientGroups: schedule.recipientGroups || [],
        includeAttachment: schedule.includeAttachment !== false,
        enabled: schedule.enabled !== false,
      }
    }
    return {
      reportId: '',
      reportTitle: '',
      frequency: 'weekly',
      weekDays: [1],
      monthDay: 1,
      cronExpression: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      timeOfDay: '09:00',
      exportFormat: 'pdf',
      recipients: '',
      recipientGroups: [],
      includeAttachment: true,
      enabled: true,
    }
  })
  const [errors, setErrors] = useState({})

  const handleReportChange = (e) => {
    const reportId = e.target.value
    let reportTitle = ''

    if (reportId) {
      const customReport = customReports.find((r) => r.id === reportId)
      const template = availableTemplates.find((t) => t.id === reportId)
      reportTitle = customReport?.title || template?.name || ''
    }

    setFormData((prev) => ({
      ...prev,
      reportId,
      reportTitle,
    }))
    setErrors((prev) => ({ ...prev, reportId: null }))
  }

  const handleFrequencyChange = (e) => {
    const frequency = e.target.value
    setFormData((prev) => ({
      ...prev,
      frequency,
      weekDays: frequency === 'weekly' ? prev.weekDays : [],
      monthDay: frequency === 'monthly' ? prev.monthDay : 1,
      cronExpression: frequency === 'custom' ? prev.cronExpression : '',
    }))
  }

  const handleWeekDayToggle = (day) => {
    setFormData((prev) => {
      const weekDays = prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day].sort((a, b) => a - b)
      return { ...prev, weekDays }
    })
  }

  const handleGroupToggle = (groupId) => {
    setFormData((prev) => {
      const recipientGroups = prev.recipientGroups.includes(groupId)
        ? prev.recipientGroups.filter((g) => g !== groupId)
        : [...prev.recipientGroups, groupId]
      return { ...prev, recipientGroups }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.reportId) {
      newErrors.reportId = 'Please select a report'
    }

    if (formData.frequency === 'weekly' && formData.weekDays.length === 0) {
      newErrors.weekDays = 'Please select at least one day'
    }

    if (formData.frequency === 'monthly' && (formData.monthDay < 1 || formData.monthDay > 31)) {
      newErrors.monthDay = 'Day must be between 1 and 31'
    }

    if (formData.frequency === 'custom' && !formData.cronExpression) {
      newErrors.cronExpression = 'Cron expression is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.timeOfDay) {
      newErrors.timeOfDay = 'Time is required'
    }

    const recipientEmails = formData.recipients.split(',').map((e) => e.trim()).filter((e) => e)
    const hasRecipients = recipientEmails.length > 0 || formData.recipientGroups.length > 0

    if (!hasRecipients) {
      newErrors.recipients = 'Please add at least one recipient or select a group'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const recipientEmails = formData.recipients
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e)

      const config = {
        reportTitle: formData.reportTitle,
        frequency: formData.frequency,
        weekDays: formData.weekDays,
        monthDay: formData.monthDay,
        cronExpression: formData.cronExpression,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        timeOfDay: formData.timeOfDay,
        exportFormat: formData.exportFormat,
        recipients: recipientEmails,
        recipientGroups: formData.recipientGroups,
        includeAttachment: formData.includeAttachment,
        enabled: formData.enabled,
      }

      let result
      if (schedule) {
        result = updateSchedule(schedule.id, config)
      } else {
        result = createSchedule(formData.reportId, config)
      }

      onSave(result)
    } catch (error) {
      console.error('Failed to save schedule:', error)
      setErrors({ submit: error.message })
    }
  }

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Report Selection</h3>
        <div className="form-group">
          <label htmlFor="reportId">Select Report *</label>
          <select
            id="reportId"
            value={formData.reportId}
            onChange={handleReportChange}
            className={errors.reportId ? 'error' : ''}
            disabled={!!schedule}
          >
            <option value="">-- Select a report --</option>
            <optgroup label="Templates">
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom Reports">
              {customReports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.reportId && <span className="error-message">{errors.reportId}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Frequency</h3>
        <div className="form-group">
          <label htmlFor="frequency">How often? *</label>
          <select
            id="frequency"
            value={formData.frequency}
            onChange={handleFrequencyChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom (Advanced)</option>
          </select>
        </div>

        {formData.frequency === 'weekly' && (
          <div className="form-group">
            <label>Days of Week *</label>
            <div className="weekday-selector">
              {WEEKDAYS.map((day) => (
                <label key={day.value} className="weekday-option">
                  <input
                    type="checkbox"
                    checked={formData.weekDays.includes(day.value)}
                    onChange={() => handleWeekDayToggle(day.value)}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
            {errors.weekDays && <span className="error-message">{errors.weekDays}</span>}
          </div>
        )}

        {formData.frequency === 'monthly' && (
          <div className="form-group">
            <label htmlFor="monthDay">Day of Month *</label>
            <input
              type="number"
              id="monthDay"
              min="1"
              max="31"
              value={formData.monthDay}
              onChange={(e) => setFormData((prev) => ({ ...prev, monthDay: parseInt(e.target.value, 10) }))}
              className={errors.monthDay ? 'error' : ''}
            />
            {errors.monthDay && <span className="error-message">{errors.monthDay}</span>}
          </div>
        )}

        {formData.frequency === 'custom' && (
          <div className="form-group">
            <label htmlFor="cronExpression">Cron Expression *</label>
            <input
              type="text"
              id="cronExpression"
              placeholder="0 9 * * 1"
              value={formData.cronExpression}
              onChange={(e) => setFormData((prev) => ({ ...prev, cronExpression: e.target.value }))}
              className={errors.cronExpression ? 'error' : ''}
            />
            <small>Format: minute hour day month weekday</small>
            {errors.cronExpression && <span className="error-message">{errors.cronExpression}</span>}
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Schedule Timing</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeOfDay">Time of Day *</label>
            <input
              type="time"
              id="timeOfDay"
              value={formData.timeOfDay}
              onChange={(e) => setFormData((prev) => ({ ...prev, timeOfDay: e.target.value }))}
              className={errors.timeOfDay ? 'error' : ''}
            />
            {errors.timeOfDay && <span className="error-message">{errors.timeOfDay}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Export Settings</h3>
        <div className="form-group">
          <label htmlFor="exportFormat">Format</label>
          <select
            id="exportFormat"
            value={formData.exportFormat}
            onChange={(e) => setFormData((prev) => ({ ...prev, exportFormat: e.target.value }))}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="powerpoint">PowerPoint</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.includeAttachment}
              onChange={(e) => setFormData((prev) => ({ ...prev, includeAttachment: e.target.checked }))}
            />
            <span>Include report as attachment</span>
          </label>
          <small>If unchecked, recipients will receive a download link instead</small>
        </div>
      </div>

      <div className="form-section">
        <h3>Recipients</h3>
        <div className="form-group">
          <label htmlFor="recipients">Email Addresses *</label>
          <textarea
            id="recipients"
            placeholder="email1@example.com, email2@example.com"
            value={formData.recipients}
            onChange={(e) => setFormData((prev) => ({ ...prev, recipients: e.target.value }))}
            rows="3"
            className={errors.recipients ? 'error' : ''}
          />
          <small>Comma-separated email addresses</small>
          {errors.recipients && <span className="error-message">{errors.recipients}</span>}
        </div>

        {stakeholderGroups.length > 0 && (
          <div className="form-group">
            <label>Stakeholder Groups</label>
            <div className="group-selector">
              {stakeholderGroups.map((group) => (
                <label key={group.id} className="group-option">
                  <input
                    type="checkbox"
                    checked={formData.recipientGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                  />
                  <span>{group.name}</span>
                  <small>({group.emails.length} {group.emails.length === 1 ? 'recipient' : 'recipients'})</small>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <span>Enable schedule</span>
          </label>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message error-message-block">{errors.submit}</div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {schedule ? 'Update Schedule' : 'Create Schedule'}
        </button>
      </div>
    </form>
  )
}
