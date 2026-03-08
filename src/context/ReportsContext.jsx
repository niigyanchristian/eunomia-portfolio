import { createContext, useContext, useState, useCallback } from 'react'
import { transformToReportData } from '../services/reportGenerator'
import { DEFAULT_TEMPLATES, createScheduleConfig, ExportFormat } from '../types/reports'

const REPORTS_STORAGE_KEY = 'portfolio_custom_reports'
const SCHEDULES_STORAGE_KEY = 'portfolio_report_schedules'

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

export const ReportsContext = createContext(null)

export const ReportsProvider = ({ children, projects = [] }) => {
  const [customReports, setCustomReports] = useState(() => loadFromStorage(REPORTS_STORAGE_KEY))
  const [schedules, setSchedules] = useState(() => loadFromStorage(SCHEDULES_STORAGE_KEY))
  const [exportQueue, setExportQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const availableTemplates = DEFAULT_TEMPLATES

  const generateReport = useCallback((templateId, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const reportConfig = { templateId, ...config }
      const reportData = transformToReportData(projects, reportConfig)

      const report = {
        id: generateId(),
        title: config.title || reportData.templateName,
        templateType: templateId,
        config: reportConfig,
        data: reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'generated',
      }

      const updated = [...customReports, report]
      setCustomReports(updated)
      saveToStorage(REPORTS_STORAGE_KEY, updated)
      setLoading(false)
      return report
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [projects, customReports])

  const createCustomReport = useCallback((config) => {
    setLoading(true)
    setError(null)
    try {
      const reportData = transformToReportData(projects, config)

      const report = {
        id: generateId(),
        title: config.title || 'Custom Report',
        templateType: 'custom',
        config,
        data: reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'generated',
      }

      const updated = [...customReports, report]
      setCustomReports(updated)
      saveToStorage(REPORTS_STORAGE_KEY, updated)
      setLoading(false)
      return report
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [projects, customReports])

  const exportReport = useCallback((reportId, format) => {
    const report = customReports.find((r) => r.id === reportId)
    if (!report) {
      throw new Error(`Report with id ${reportId} not found`)
    }

    const validFormats = Object.values(ExportFormat)
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid export format: ${format}. Must be one of: ${validFormats.join(', ')}`)
    }

    const exportItem = {
      id: generateId(),
      reportId,
      format,
      status: 'queued',
      createdAt: new Date().toISOString(),
    }

    setExportQueue((prev) => [...prev, exportItem])
    return exportItem
  }, [customReports])

  const scheduleReport = useCallback((reportId, schedule, stakeholders = []) => {
    const report = customReports.find((r) => r.id === reportId)
    if (!report) {
      throw new Error(`Report with id ${reportId} not found`)
    }

    const scheduleConfig = createScheduleConfig({
      reportId,
      frequency: schedule.frequency,
      stakeholders,
      nextRunAt: schedule.nextRunAt || new Date().toISOString(),
      enabled: true,
    })

    const newSchedule = {
      id: generateId(),
      ...scheduleConfig,
      createdAt: new Date().toISOString(),
    }

    const updated = [...schedules, newSchedule]
    setSchedules(updated)
    saveToStorage(SCHEDULES_STORAGE_KEY, updated)
    return newSchedule
  }, [customReports, schedules])

  const getReportData = useCallback((reportId) => {
    const report = customReports.find((r) => r.id === reportId)
    if (!report) return null
    return report.data
  }, [customReports])

  const deleteReport = useCallback((reportId) => {
    const updated = customReports.filter((r) => r.id !== reportId)
    setCustomReports(updated)
    saveToStorage(REPORTS_STORAGE_KEY, updated)

    const updatedSchedules = schedules.filter((s) => s.reportId !== reportId)
    setSchedules(updatedSchedules)
    saveToStorage(SCHEDULES_STORAGE_KEY, updatedSchedules)
  }, [customReports, schedules])

  const deleteSchedule = useCallback((scheduleId) => {
    const updated = schedules.filter((s) => s.id !== scheduleId)
    setSchedules(updated)
    saveToStorage(SCHEDULES_STORAGE_KEY, updated)
  }, [schedules])

  const value = {
    availableTemplates,
    customReports,
    schedules,
    exportQueue,
    loading,
    error,
    generateReport,
    createCustomReport,
    exportReport,
    scheduleReport,
    getReportData,
    deleteReport,
    deleteSchedule,
  }

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  )
}

export const useReports = () => {
  const ctx = useContext(ReportsContext)
  if (!ctx) {
    throw new Error('useReports must be used within a ReportsProvider')
  }
  return ctx
}
