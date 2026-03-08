import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedule,
  getAllSchedules,
  getSchedulesByReport,
  calculateNextRunTime,
  executeSchedule,
  getExecutionHistory,
  toggleSchedule,
} from './schedulerService'

const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('schedulerService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('createSchedule', () => {
    it('should create a daily schedule', () => {
      const schedule = createSchedule('report123', {
        reportTitle: 'Test Report',
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
        exportFormat: 'pdf',
        recipients: ['test@example.com'],
      })

      expect(schedule).toMatchObject({
        reportId: 'report123',
        reportTitle: 'Test Report',
        frequency: 'daily',
        timeOfDay: '09:00',
        exportFormat: 'pdf',
      })
      expect(schedule.id).toBeDefined()
      expect(schedule.nextRunAt).toBeDefined()
    })

    it('should create a weekly schedule with specific days', () => {
      const schedule = createSchedule('report123', {
        frequency: 'weekly',
        weekDays: [1, 3, 5],
        startDate: '2026-03-01',
        timeOfDay: '10:00',
      })

      expect(schedule.frequency).toBe('weekly')
      expect(schedule.weekDays).toEqual([1, 3, 5])
    })

    it('should create a monthly schedule', () => {
      const schedule = createSchedule('report123', {
        frequency: 'monthly',
        monthDay: 15,
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      expect(schedule.frequency).toBe('monthly')
      expect(schedule.monthDay).toBe(15)
    })

    it('should throw error if reportId is missing', () => {
      expect(() => createSchedule('', { frequency: 'daily' })).toThrow('Report ID is required')
    })

    it('should throw error if frequency is missing', () => {
      expect(() => createSchedule('report123', {})).toThrow('Frequency is required')
    })

    it('should throw error for invalid frequency', () => {
      expect(() => createSchedule('report123', { frequency: 'invalid' })).toThrow('Invalid frequency')
    })

    it('should throw error if weekly schedule missing weekDays', () => {
      expect(() =>
        createSchedule('report123', {
          frequency: 'weekly',
          startDate: '2026-03-01',
          timeOfDay: '09:00',
        })
      ).toThrow('Week days are required')
    })

    it('should throw error if monthly schedule missing monthDay', () => {
      expect(() =>
        createSchedule('report123', {
          frequency: 'monthly',
          startDate: '2026-03-01',
          timeOfDay: '09:00',
        })
      ).toThrow('Month day is required')
    })

    it('should set default values correctly', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
      })

      expect(schedule.timeOfDay).toBe('09:00')
      expect(schedule.exportFormat).toBe('pdf')
      expect(schedule.enabled).toBe(true)
      expect(schedule.includeAttachment).toBe(true)
    })
  })

  describe('getAllSchedules', () => {
    it('should return empty array when no schedules exist', () => {
      const schedules = getAllSchedules()
      expect(schedules).toEqual([])
    })

    it('should return all schedules', () => {
      createSchedule('report1', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })
      createSchedule('report2', {
        frequency: 'weekly',
        weekDays: [1],
        startDate: '2026-03-01',
        timeOfDay: '10:00',
      })

      const schedules = getAllSchedules()
      expect(schedules).toHaveLength(2)
    })
  })

  describe('getSchedule', () => {
    it('should return null when schedule does not exist', () => {
      const schedule = getSchedule('nonexistent')
      expect(schedule).toBeNull()
    })

    it('should return schedule when it exists', () => {
      const created = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      const found = getSchedule(created.id)
      expect(found).toMatchObject({
        id: created.id,
        reportId: 'report123',
      })
    })
  })

  describe('getSchedulesByReport', () => {
    it('should return schedules for specific report', () => {
      createSchedule('report1', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })
      createSchedule('report1', {
        frequency: 'weekly',
        weekDays: [1],
        startDate: '2026-03-01',
        timeOfDay: '10:00',
      })
      createSchedule('report2', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '11:00',
      })

      const schedules = getSchedulesByReport('report1')
      expect(schedules).toHaveLength(2)
      expect(schedules.every((s) => s.reportId === 'report1')).toBe(true)
    })
  })

  describe('updateSchedule', () => {
    it('should update schedule properties', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      const updated = updateSchedule(schedule.id, {
        timeOfDay: '15:00',
        exportFormat: 'excel',
      })

      expect(updated.timeOfDay).toBe('15:00')
      expect(updated.exportFormat).toBe('excel')
    })

    it('should recalculate nextRunAt when frequency changes', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      const originalNextRun = schedule.nextRunAt

      const updated = updateSchedule(schedule.id, {
        frequency: 'weekly',
        weekDays: [1],
      })

      expect(updated.nextRunAt).not.toBe(originalNextRun)
    })

    it('should throw error if schedule not found', () => {
      expect(() => updateSchedule('nonexistent', { timeOfDay: '10:00' })).toThrow('not found')
    })
  })

  describe('deleteSchedule', () => {
    it('should delete schedule', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      deleteSchedule(schedule.id)

      const found = getSchedule(schedule.id)
      expect(found).toBeNull()
    })

    it('should throw error if schedule not found', () => {
      expect(() => deleteSchedule('nonexistent')).toThrow('not found')
    })
  })

  describe('calculateNextRunTime', () => {
    it('should calculate next run time for daily frequency', () => {
      const nextRun = calculateNextRunTime({
        frequency: 'daily',
        startDate: new Date('2026-03-08'),
        timeOfDay: '09:00',
      })

      expect(nextRun).toBeInstanceOf(Date)
      expect(nextRun.getHours()).toBe(9)
      expect(nextRun.getMinutes()).toBe(0)
    })

    it('should calculate next run time for weekly frequency', () => {
      const nextRun = calculateNextRunTime({
        frequency: 'weekly',
        startDate: new Date('2026-03-08'),
        timeOfDay: '10:00',
        weekDays: [1, 3],
      })

      expect(nextRun).toBeInstanceOf(Date)
    })

    it('should calculate next run time for monthly frequency', () => {
      const nextRun = calculateNextRunTime({
        frequency: 'monthly',
        startDate: new Date('2026-03-08'),
        timeOfDay: '09:00',
        monthDay: 15,
      })

      expect(nextRun).toBeInstanceOf(Date)
      expect(nextRun.getDate()).toBe(15)
    })

    it('should throw error for unsupported frequency', () => {
      expect(() =>
        calculateNextRunTime({
          frequency: 'invalid',
          startDate: new Date(),
          timeOfDay: '09:00',
        })
      ).toThrow('Unsupported frequency')
    })
  })

  describe('toggleSchedule', () => {
    it('should toggle schedule enabled state', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
        enabled: true,
      })

      const toggled = toggleSchedule(schedule.id)
      expect(toggled.enabled).toBe(false)

      const toggledAgain = toggleSchedule(schedule.id)
      expect(toggledAgain.enabled).toBe(true)
    })

    it('should throw error if schedule not found', () => {
      expect(() => toggleSchedule('nonexistent')).toThrow('not found')
    })
  })

  describe('executeSchedule', () => {
    it('should execute schedule and create history entry', () => {
      const schedule = createSchedule('report123', {
        reportTitle: 'Test Report',
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
        recipients: ['test1@example.com', 'test2@example.com'],
      })

      const execution = executeSchedule(schedule.id)

      expect(execution).toMatchObject({
        scheduleId: schedule.id,
        reportId: 'report123',
        status: 'success',
        recipientCount: 2,
      })
      expect(execution.executedAt).toBeDefined()

      const history = getExecutionHistory()
      expect(history).toHaveLength(1)
    })

    it('should update schedule lastRunAt and executionCount', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })

      expect(schedule.executionCount).toBe(0)
      expect(schedule.lastRunAt).toBeNull()

      executeSchedule(schedule.id)

      const updated = getSchedule(schedule.id)
      expect(updated.executionCount).toBe(1)
      expect(updated.lastRunAt).toBeDefined()
    })

    it('should throw error if schedule is disabled', () => {
      const schedule = createSchedule('report123', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
        enabled: false,
      })

      expect(() => executeSchedule(schedule.id)).toThrow('disabled')
    })

    it('should throw error if schedule not found', () => {
      expect(() => executeSchedule('nonexistent')).toThrow('not found')
    })
  })

  describe('getExecutionHistory', () => {
    it('should return all execution history', () => {
      const schedule1 = createSchedule('report1', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })
      const schedule2 = createSchedule('report2', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '10:00',
      })

      executeSchedule(schedule1.id)
      executeSchedule(schedule2.id)

      const history = getExecutionHistory()
      expect(history).toHaveLength(2)
    })

    it('should return history for specific schedule', () => {
      const schedule1 = createSchedule('report1', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '09:00',
      })
      const schedule2 = createSchedule('report2', {
        frequency: 'daily',
        startDate: '2026-03-01',
        timeOfDay: '10:00',
      })

      executeSchedule(schedule1.id)
      executeSchedule(schedule2.id)

      const history = getExecutionHistory(schedule1.id)
      expect(history).toHaveLength(1)
      expect(history[0].scheduleId).toBe(schedule1.id)
    })
  })
})
