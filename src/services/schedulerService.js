import { addDays, addMonths, addQuarters, addYears, setHours, setMinutes, setSeconds, setMilliseconds, isAfter, isBefore, parseISO } from 'date-fns'

const SCHEDULES_STORAGE_KEY = 'portfolio_report_schedules'
const EXECUTION_HISTORY_KEY = 'portfolio_schedule_history'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return []
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function createSchedule(reportId, config) {
  if (!reportId) {
    throw new Error('Report ID is required')
  }

  if (!config.frequency) {
    throw new Error('Frequency is required')
  }

  const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
  if (!validFrequencies.includes(config.frequency)) {
    throw new Error(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`)
  }

  if (config.frequency === 'weekly' && (!config.weekDays || config.weekDays.length === 0)) {
    throw new Error('Week days are required for weekly schedules')
  }

  if (config.frequency === 'monthly' && !config.monthDay) {
    throw new Error('Month day is required for monthly schedules')
  }

  if (config.frequency === 'custom' && !config.cronExpression) {
    throw new Error('Cron expression is required for custom schedules')
  }

  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)

  const startDate = config.startDate ? parseISO(config.startDate) : new Date()
  const timeOfDay = config.timeOfDay || '09:00'

  const nextRunTime = calculateNextRunTime({
    frequency: config.frequency,
    startDate,
    timeOfDay,
    weekDays: config.weekDays,
    monthDay: config.monthDay,
    cronExpression: config.cronExpression,
  })

  const newSchedule = {
    id: generateId(),
    reportId,
    reportTitle: config.reportTitle || 'Untitled Report',
    frequency: config.frequency,
    weekDays: config.weekDays || [],
    monthDay: config.monthDay || 1,
    cronExpression: config.cronExpression || null,
    startDate: startDate.toISOString(),
    endDate: config.endDate ? parseISO(config.endDate).toISOString() : null,
    timeOfDay,
    exportFormat: config.exportFormat || 'pdf',
    recipients: config.recipients || [],
    recipientGroups: config.recipientGroups || [],
    includeAttachment: config.includeAttachment !== false,
    enabled: config.enabled !== false,
    nextRunAt: nextRunTime.toISOString(),
    lastRunAt: null,
    executionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const updated = [...schedules, newSchedule]
  saveToStorage(SCHEDULES_STORAGE_KEY, updated)
  return newSchedule
}

export function updateSchedule(scheduleId, updates) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  const index = schedules.findIndex((s) => s.id === scheduleId)

  if (index === -1) {
    throw new Error(`Schedule with id "${scheduleId}" not found`)
  }

  const schedule = schedules[index]
  const updatedSchedule = { ...schedule, ...updates, updatedAt: new Date().toISOString() }

  if (updates.frequency || updates.startDate || updates.timeOfDay || updates.weekDays || updates.monthDay) {
    const startDate = updates.startDate ? parseISO(updates.startDate) : parseISO(schedule.startDate)
    const nextRunTime = calculateNextRunTime({
      frequency: updatedSchedule.frequency,
      startDate,
      timeOfDay: updatedSchedule.timeOfDay,
      weekDays: updatedSchedule.weekDays,
      monthDay: updatedSchedule.monthDay,
      cronExpression: updatedSchedule.cronExpression,
    })
    updatedSchedule.nextRunAt = nextRunTime.toISOString()
  }

  const updated = [...schedules]
  updated[index] = updatedSchedule
  saveToStorage(SCHEDULES_STORAGE_KEY, updated)
  return updatedSchedule
}

export function deleteSchedule(scheduleId) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  const filtered = schedules.filter((s) => s.id !== scheduleId)

  if (filtered.length === schedules.length) {
    throw new Error(`Schedule with id "${scheduleId}" not found`)
  }

  saveToStorage(SCHEDULES_STORAGE_KEY, filtered)
  return true
}

export function getSchedule(scheduleId) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  return schedules.find((s) => s.id === scheduleId) || null
}

export function getAllSchedules() {
  return loadFromStorage(SCHEDULES_STORAGE_KEY)
}

export function getSchedulesByReport(reportId) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  return schedules.filter((s) => s.reportId === reportId)
}

export function calculateNextRunTime(config) {
  const { frequency, startDate, timeOfDay, weekDays, monthDay } = config
  const [hours, minutes] = timeOfDay.split(':').map(Number)

  let baseDate = new Date()
  if (isAfter(startDate, baseDate)) {
    baseDate = startDate
  }

  let nextRun = setMilliseconds(setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0), 0)

  if (isBefore(nextRun, new Date())) {
    nextRun = addDays(nextRun, 1)
  }

  switch (frequency) {
    case 'daily':
      return nextRun

    case 'weekly': {
      const currentDay = nextRun.getDay()
      const sortedDays = [...weekDays].sort((a, b) => a - b)
      let nextDay = sortedDays.find((d) => d > currentDay)

      if (!nextDay) {
        nextDay = sortedDays[0]
        const daysToAdd = 7 - currentDay + nextDay
        return addDays(nextRun, daysToAdd)
      }

      const daysToAdd = nextDay - currentDay
      return addDays(nextRun, daysToAdd)
    }

    case 'monthly': {
      let candidate = setMilliseconds(
        setSeconds(setMinutes(setHours(new Date(), hours), minutes), 0),
        0
      )
      candidate.setDate(monthDay)

      if (isBefore(candidate, new Date())) {
        candidate = addMonths(candidate, 1)
      }

      return candidate
    }

    case 'quarterly':
      return addQuarters(nextRun, 1)

    case 'yearly':
      return addYears(nextRun, 1)

    case 'custom':
      return nextRun

    default:
      throw new Error(`Unsupported frequency: ${frequency}`)
  }
}

export function getNextRunTime(schedule) {
  if (!schedule.enabled) {
    return null
  }

  if (schedule.endDate && isAfter(new Date(), parseISO(schedule.endDate))) {
    return null
  }

  const startDate = parseISO(schedule.startDate)
  return calculateNextRunTime({
    frequency: schedule.frequency,
    startDate,
    timeOfDay: schedule.timeOfDay,
    weekDays: schedule.weekDays,
    monthDay: schedule.monthDay,
    cronExpression: schedule.cronExpression,
  })
}

export function executeSchedule(scheduleId) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  const index = schedules.findIndex((s) => s.id === scheduleId)

  if (index === -1) {
    throw new Error(`Schedule with id "${scheduleId}" not found`)
  }

  const schedule = schedules[index]

  if (!schedule.enabled) {
    throw new Error('Schedule is disabled')
  }

  const execution = {
    id: generateId(),
    scheduleId,
    reportId: schedule.reportId,
    reportTitle: schedule.reportTitle,
    executedAt: new Date().toISOString(),
    status: 'success',
    exportFormat: schedule.exportFormat,
    recipientCount: schedule.recipients.length,
    error: null,
  }

  const history = loadFromStorage(EXECUTION_HISTORY_KEY)
  const updatedHistory = [execution, ...history].slice(0, 100)
  saveToStorage(EXECUTION_HISTORY_KEY, updatedHistory)

  const nextRunTime = calculateNextRunTime({
    frequency: schedule.frequency,
    startDate: new Date(),
    timeOfDay: schedule.timeOfDay,
    weekDays: schedule.weekDays,
    monthDay: schedule.monthDay,
    cronExpression: schedule.cronExpression,
  })

  const updated = [...schedules]
  updated[index] = {
    ...schedule,
    lastRunAt: new Date().toISOString(),
    nextRunAt: nextRunTime.toISOString(),
    executionCount: schedule.executionCount + 1,
    updatedAt: new Date().toISOString(),
  }
  saveToStorage(SCHEDULES_STORAGE_KEY, updated)

  return execution
}

export function getExecutionHistory(scheduleId = null) {
  const history = loadFromStorage(EXECUTION_HISTORY_KEY)

  if (scheduleId) {
    return history.filter((h) => h.scheduleId === scheduleId)
  }

  return history
}

export function toggleSchedule(scheduleId) {
  const schedules = loadFromStorage(SCHEDULES_STORAGE_KEY)
  const index = schedules.findIndex((s) => s.id === scheduleId)

  if (index === -1) {
    throw new Error(`Schedule with id "${scheduleId}" not found`)
  }

  const updated = [...schedules]
  updated[index] = {
    ...updated[index],
    enabled: !updated[index].enabled,
    updatedAt: new Date().toISOString(),
  }

  saveToStorage(SCHEDULES_STORAGE_KEY, updated)
  return updated[index]
}
