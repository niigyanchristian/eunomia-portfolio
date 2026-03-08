import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportSchedules from './ReportSchedules'
import { ReportsContext } from '../context/ReportsContext'
import * as schedulerServiceModule from '../services/schedulerService'
import * as stakeholderGroupsModule from '../utils/stakeholderGroups'

vi.mock('../services/schedulerService', () => ({
  getAllSchedules: vi.fn(),
  deleteSchedule: vi.fn(),
  toggleSchedule: vi.fn(),
  getExecutionHistory: vi.fn(),
  executeSchedule: vi.fn(),
}))

vi.mock('../utils/stakeholderGroups', () => ({
  getAllGroups: vi.fn(),
  getEmailsFromGroups: vi.fn(),
}))

const mockReportsContext = {
  customReports: [
    { id: 'report1', title: 'Custom Report 1' },
    { id: 'report2', title: 'Custom Report 2' },
  ],
  availableTemplates: [
    { id: 'template1', name: 'Executive Summary' },
    { id: 'template2', name: 'Performance Report' },
  ],
}

const renderWithContext = (component) => {
  return render(
    <ReportsContext.Provider value={mockReportsContext}>
      {component}
    </ReportsContext.Provider>
  )
}

describe('ReportSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    schedulerServiceModule.getAllSchedules.mockReturnValue([])
    schedulerServiceModule.getExecutionHistory.mockReturnValue([])
    stakeholderGroupsModule.getAllGroups.mockReturnValue([])
    stakeholderGroupsModule.getEmailsFromGroups.mockReturnValue([])
  })

  describe('Empty State', () => {
    it('should render empty state when no schedules exist', () => {
      renderWithContext(<ReportSchedules />)

      expect(screen.getByText('No Schedules Yet')).toBeInTheDocument()
      expect(screen.getByText(/Create your first report schedule/i)).toBeInTheDocument()
    })

    it('should show create button in empty state', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const createButtons = screen.getAllByRole('button', { name: /Create Schedule/i })
      expect(createButtons.length).toBeGreaterThan(0)

      await user.click(createButtons[0])

      expect(screen.getByText(/Report Selection/i)).toBeInTheDocument()
    })
  })

  describe('Schedules List', () => {
    const mockSchedules = [
      {
        id: 'schedule1',
        reportId: 'report1',
        reportTitle: 'Custom Report 1',
        frequency: 'daily',
        weekDays: [],
        monthDay: 1,
        timeOfDay: '09:00',
        exportFormat: 'pdf',
        recipients: ['test1@example.com', 'test2@example.com'],
        recipientGroups: [],
        enabled: true,
        nextRunAt: '2026-03-09T09:00:00.000Z',
        lastRunAt: '2026-03-08T09:00:00.000Z',
        executionCount: 5,
        startDate: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 'schedule2',
        reportId: 'template1',
        reportTitle: 'Executive Summary',
        frequency: 'weekly',
        weekDays: [1, 3, 5],
        monthDay: 1,
        timeOfDay: '10:00',
        exportFormat: 'excel',
        recipients: ['exec@example.com'],
        recipientGroups: ['group1'],
        enabled: false,
        nextRunAt: '2026-03-10T10:00:00.000Z',
        lastRunAt: null,
        executionCount: 0,
        startDate: '2026-03-01T00:00:00.000Z',
      },
    ]

    beforeEach(() => {
      schedulerServiceModule.getAllSchedules.mockReturnValue(mockSchedules)
      stakeholderGroupsModule.getEmailsFromGroups.mockReturnValue(['group1@example.com'])
    })

    it('should render list of schedules', () => {
      renderWithContext(<ReportSchedules />)

      expect(screen.getByText('Custom Report 1')).toBeInTheDocument()
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
    })

    it('should display schedule status correctly', () => {
      renderWithContext(<ReportSchedules />)

      const activeStatus = screen.getByText('Active')
      const inactiveStatus = screen.getByText('Inactive')

      expect(activeStatus).toBeInTheDocument()
      expect(inactiveStatus).toBeInTheDocument()
    })

    it('should display frequency information', () => {
      renderWithContext(<ReportSchedules />)

      expect(screen.getByText('Daily')).toBeInTheDocument()
      expect(screen.getByText(/Weekly \(Mon, Wed, Fri\)/i)).toBeInTheDocument()
    })

    it('should display execution count', () => {
      renderWithContext(<ReportSchedules />)

      expect(screen.getByText('Executed 5 times')).toBeInTheDocument()
    })

    it('should handle toggle schedule', async () => {
      const user = userEvent.setup()
      schedulerServiceModule.toggleSchedule.mockReturnValue({
        ...mockSchedules[0],
        enabled: false,
      })

      renderWithContext(<ReportSchedules />)

      const toggleButtons = screen.getAllByTitle(/Disable|Enable/)
      await user.click(toggleButtons[0])

      expect(schedulerServiceModule.toggleSchedule).toHaveBeenCalledWith('schedule1')
    })

    it('should handle delete schedule with confirmation', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      renderWithContext(<ReportSchedules />)

      const deleteButtons = screen.getAllByTitle('Delete')
      await user.click(deleteButtons[0])

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this schedule?')
      expect(schedulerServiceModule.deleteSchedule).toHaveBeenCalledWith('schedule1')
    })

    it('should not delete schedule if confirmation is cancelled', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => false)

      renderWithContext(<ReportSchedules />)

      const deleteButtons = screen.getAllByTitle('Delete')
      await user.click(deleteButtons[0])

      expect(schedulerServiceModule.deleteSchedule).not.toHaveBeenCalled()
    })

    it('should handle execute now with confirmation', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)
      window.alert = vi.fn()
      schedulerServiceModule.executeSchedule.mockReturnValue({
        id: 'exec1',
        status: 'success',
      })

      renderWithContext(<ReportSchedules />)

      const executeButtons = screen.getAllByTitle('Execute now')
      await user.click(executeButtons[0])

      expect(window.confirm).toHaveBeenCalledWith('Execute this schedule now?')
      expect(schedulerServiceModule.executeSchedule).toHaveBeenCalledWith('schedule1')
      expect(window.alert).toHaveBeenCalledWith(
        'Schedule executed successfully! Report has been generated.'
      )
    })

    it('should handle edit schedule', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const editButtons = screen.getAllByTitle('Edit')
      await user.click(editButtons[0])

      expect(screen.getByText('Edit Schedule')).toBeInTheDocument()
    })

    it('should display schedule details modal', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i })
      await user.click(viewDetailsButtons[0])

      expect(screen.getByText('Schedule Details')).toBeInTheDocument()
    })

    it('should close details modal when clicking close button', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i })
      await user.click(viewDetailsButtons[0])

      const closeButton = screen.getByRole('button', { name: '×' })
      await user.click(closeButton)

      expect(screen.queryByText('Schedule Details')).not.toBeInTheDocument()
    })
  })

  describe('Execution History Tab', () => {
    const mockHistory = [
      {
        id: 'exec1',
        scheduleId: 'schedule1',
        reportTitle: 'Custom Report 1',
        executedAt: '2026-03-08T09:00:00.000Z',
        exportFormat: 'pdf',
        recipientCount: 2,
        status: 'success',
      },
      {
        id: 'exec2',
        scheduleId: 'schedule2',
        reportTitle: 'Executive Summary',
        executedAt: '2026-03-07T10:00:00.000Z',
        exportFormat: 'excel',
        recipientCount: 3,
        status: 'success',
      },
    ]

    beforeEach(() => {
      schedulerServiceModule.getExecutionHistory.mockReturnValue(mockHistory)
    })

    it('should switch to history tab', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const historyTab = screen.getByRole('button', { name: /Execution History/i })
      await user.click(historyTab)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should display execution history in table', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const historyTab = screen.getByRole('button', { name: /Execution History/i })
      await user.click(historyTab)

      expect(screen.getByText('Custom Report 1')).toBeInTheDocument()
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getAllByText('success')).toHaveLength(2)
    })

    it('should show empty state when no history exists', async () => {
      const user = userEvent.setup()
      schedulerServiceModule.getExecutionHistory.mockReturnValue([])

      renderWithContext(<ReportSchedules />)

      const historyTab = screen.getByRole('button', { name: /Execution History/i })
      await user.click(historyTab)

      expect(screen.getByText('No Execution History')).toBeInTheDocument()
    })
  })

  describe('Create Schedule Flow', () => {
    it('should show form when create button is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const createButtons = screen.getAllByRole('button', { name: /Create Schedule/i })
      await user.click(createButtons[0])

      expect(screen.getByRole('heading', { name: 'Create Schedule' })).toBeInTheDocument()
      expect(screen.getByText('Report Selection')).toBeInTheDocument()
    })

    it('should return to list after successful save', async () => {
      const user = userEvent.setup()
      schedulerServiceModule.getAllSchedules.mockReturnValue([
        {
          id: 'new-schedule',
          reportId: 'report1',
          reportTitle: 'New Schedule',
          frequency: 'daily',
          timeOfDay: '09:00',
          exportFormat: 'pdf',
          recipients: ['test@example.com'],
          recipientGroups: [],
          enabled: true,
        },
      ])

      renderWithContext(<ReportSchedules />)

      const createButton = screen.getByRole('button', { name: /Create Schedule/i })
      await user.click(createButton)

      expect(screen.getByText('Report Selection')).toBeInTheDocument()
    })

    it('should return to list when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const createButtons = screen.getAllByRole('button', { name: /Create Schedule/i })
      await user.click(createButtons[0])

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByText('Report Selection')).not.toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should have schedules tab active by default', () => {
      renderWithContext(<ReportSchedules />)

      const schedulesTab = screen.getByRole('button', { name: /Schedules/i })
      expect(schedulesTab).toHaveClass('active')
    })

    it('should switch between tabs', async () => {
      const user = userEvent.setup()
      renderWithContext(<ReportSchedules />)

      const historyTab = screen.getByRole('button', { name: /Execution History/i })
      await user.click(historyTab)

      expect(historyTab).toHaveClass('active')

      const schedulesTab = screen.getByRole('button', { name: /Schedules/i })
      await user.click(schedulesTab)

      expect(schedulesTab).toHaveClass('active')
    })

    it('should display count in tab labels', () => {
      schedulerServiceModule.getAllSchedules.mockReturnValue([
        { id: '1', reportId: 'r1', frequency: 'daily', timeOfDay: '09:00', exportFormat: 'pdf', recipients: [], recipientGroups: [] },
        { id: '2', reportId: 'r2', frequency: 'weekly', timeOfDay: '10:00', weekDays: [1], exportFormat: 'excel', recipients: [], recipientGroups: [] },
      ])
      schedulerServiceModule.getExecutionHistory.mockReturnValue([
        { id: 'e1', scheduleId: '1', exportFormat: 'pdf' },
        { id: 'e2', scheduleId: '2', exportFormat: 'excel' },
        { id: 'e3', scheduleId: '1', exportFormat: 'pdf' },
      ])

      renderWithContext(<ReportSchedules />)

      expect(screen.getByRole('button', { name: /Schedules \(2\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Execution History \(3\)/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show alert on delete error', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)
      window.alert = vi.fn()
      schedulerServiceModule.deleteSchedule.mockImplementation(() => {
        throw new Error('Delete failed')
      })

      schedulerServiceModule.getAllSchedules.mockReturnValue([
        {
          id: 'schedule1',
          reportId: 'report1',
          reportTitle: 'Test',
          frequency: 'daily',
          timeOfDay: '09:00',
          exportFormat: 'pdf',
          recipients: [],
          recipientGroups: [],
          enabled: true,
        },
      ])

      renderWithContext(<ReportSchedules />)

      const deleteButtons = screen.getAllByTitle('Delete')
      await user.click(deleteButtons[0])

      expect(window.alert).toHaveBeenCalledWith('Failed to delete schedule. Please try again.')
    })

    it('should show alert on execute error', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)
      window.alert = vi.fn()
      schedulerServiceModule.executeSchedule.mockImplementation(() => {
        throw new Error('Execution failed')
      })

      schedulerServiceModule.getAllSchedules.mockReturnValue([
        {
          id: 'schedule1',
          reportId: 'report1',
          reportTitle: 'Test',
          frequency: 'daily',
          timeOfDay: '09:00',
          exportFormat: 'pdf',
          recipients: [],
          recipientGroups: [],
          enabled: true,
        },
      ])

      renderWithContext(<ReportSchedules />)

      const executeButtons = screen.getAllByTitle('Execute now')
      await user.click(executeButtons[0])

      expect(window.alert).toHaveBeenCalledWith('Failed to execute schedule: Execution failed')
    })
  })
})
