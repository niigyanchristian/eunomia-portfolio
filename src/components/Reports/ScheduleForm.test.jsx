import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScheduleForm from './ScheduleForm'
import { ReportsContext } from '../../context/ReportsContext'
import * as stakeholderGroupsModule from '../../utils/stakeholderGroups'
import * as schedulerServiceModule from '../../services/schedulerService'

vi.mock('../../utils/stakeholderGroups', () => ({
  getAllGroups: vi.fn(),
}))

vi.mock('../../services/schedulerService', () => ({
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  getNextRunTime: vi.fn(),
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

describe('ScheduleForm', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    stakeholderGroupsModule.getAllGroups.mockReturnValue([
      { id: 'group1', name: 'Executives', emails: ['exec1@example.com', 'exec2@example.com'] },
      { id: 'group2', name: 'Team Leads', emails: ['lead1@example.com'] },
    ])
  })

  it('should render form with all sections', () => {
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByText('Report Selection')).toBeInTheDocument()
    expect(screen.getByText('Frequency')).toBeInTheDocument()
    expect(screen.getByText('Schedule Timing')).toBeInTheDocument()
    expect(screen.getByText('Export Settings')).toBeInTheDocument()
    expect(screen.getByText('Recipients')).toBeInTheDocument()
  })

  it('should display templates and custom reports in select', () => {
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const select = screen.getByLabelText(/Select Report/i)
    expect(select).toBeInTheDocument()

    expect(screen.getByText('Executive Summary')).toBeInTheDocument()
    expect(screen.getByText('Performance Report')).toBeInTheDocument()
    expect(screen.getByText('Custom Report 1')).toBeInTheDocument()
    expect(screen.getByText('Custom Report 2')).toBeInTheDocument()
  })

  it('should show validation error when submitting without report selection', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /Create Schedule/i })
    await user.click(submitButton)

    expect(screen.getByText('Please select a report')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should show weekday selector when weekly frequency is selected', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const frequencySelect = screen.getByLabelText(/How often/i)
    await user.selectOptions(frequencySelect, 'weekly')

    expect(screen.getByText('Sunday')).toBeInTheDocument()
    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('Friday')).toBeInTheDocument()
  })

  it('should show month day input when monthly frequency is selected', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const frequencySelect = screen.getByLabelText(/How often/i)
    await user.selectOptions(frequencySelect, 'monthly')

    expect(screen.getByLabelText(/Day of Month/i)).toBeInTheDocument()
  })

  it('should show cron expression input when custom frequency is selected', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const frequencySelect = screen.getByLabelText(/How often/i)
    await user.selectOptions(frequencySelect, 'custom')

    expect(screen.getByLabelText(/Cron Expression/i)).toBeInTheDocument()
  })

  it('should display stakeholder groups', () => {
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByText('Executives')).toBeInTheDocument()
    expect(screen.getByText('Team Leads')).toBeInTheDocument()
    expect(screen.getByText(/2 recipients/i)).toBeInTheDocument()
    expect(screen.getByText(/1 recipient/i)).toBeInTheDocument()
  })

  it('should validate recipients are required', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const reportSelect = screen.getByLabelText(/Select Report/i)
    await user.selectOptions(reportSelect, 'report1')

    const submitButton = screen.getByRole('button', { name: /Create Schedule/i })
    await user.click(submitButton)

    expect(screen.getByText(/Please add at least one recipient/i)).toBeInTheDocument()
  })

  it('should create schedule with valid data', async () => {
    const user = userEvent.setup()
    const mockSchedule = { id: 'schedule1', reportId: 'report1' }
    schedulerServiceModule.createSchedule.mockReturnValue(mockSchedule)

    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const reportSelect = screen.getByLabelText(/Select Report/i)
    await user.selectOptions(reportSelect, 'report1')

    const recipientsTextarea = screen.getByLabelText(/Email Addresses/i)
    await user.type(recipientsTextarea, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /Create Schedule/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(schedulerServiceModule.createSchedule).toHaveBeenCalledWith(
        'report1',
        expect.objectContaining({
          frequency: 'weekly',
          recipients: ['test@example.com'],
        })
      )
      expect(mockOnSave).toHaveBeenCalledWith(mockSchedule)
    })
  })

  it('should update existing schedule', async () => {
    const user = userEvent.setup()
    const existingSchedule = {
      id: 'schedule1',
      reportId: 'report1',
      reportTitle: 'Custom Report 1',
      frequency: 'daily',
      weekDays: [],
      monthDay: 1,
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: null,
      timeOfDay: '09:00',
      exportFormat: 'pdf',
      recipients: ['existing@example.com'],
      recipientGroups: [],
      includeAttachment: true,
      enabled: true,
    }

    const mockUpdated = { ...existingSchedule, timeOfDay: '15:00' }
    schedulerServiceModule.updateSchedule.mockReturnValue(mockUpdated)

    renderWithContext(
      <ScheduleForm schedule={existingSchedule} onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    expect(screen.getByRole('button', { name: /Update Schedule/i })).toBeInTheDocument()

    const timeInput = screen.getByLabelText(/Time of Day/i)
    await user.clear(timeInput)
    await user.type(timeInput, '15:00')

    const submitButton = screen.getByRole('button', { name: /Update Schedule/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(schedulerServiceModule.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        expect.objectContaining({
          timeOfDay: '15:00',
        })
      )
      expect(mockOnSave).toHaveBeenCalledWith(mockUpdated)
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should handle weekday selection', async () => {
    const user = userEvent.setup()
    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const mondayCheckbox = screen.getByRole('checkbox', { name: /Monday/i })
    expect(mondayCheckbox).toBeChecked()

    await user.click(mondayCheckbox)
    expect(mondayCheckbox).not.toBeChecked()

    await user.click(mondayCheckbox)
    expect(mondayCheckbox).toBeChecked()
  })

  it('should handle stakeholder group selection', async () => {
    const user = userEvent.setup()
    const mockSchedule = { id: 'schedule1' }
    schedulerServiceModule.createSchedule.mockReturnValue(mockSchedule)

    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const reportSelect = screen.getByLabelText(/Select Report/i)
    await user.selectOptions(reportSelect, 'report1')

    const executivesCheckbox = screen.getByRole('checkbox', { name: /Executives/i })
    await user.click(executivesCheckbox)

    const submitButton = screen.getByRole('button', { name: /Create Schedule/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(schedulerServiceModule.createSchedule).toHaveBeenCalledWith(
        'report1',
        expect.objectContaining({
          recipientGroups: ['group1'],
        })
      )
    })
  })

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup()
    schedulerServiceModule.createSchedule.mockImplementation(() => {
      throw new Error('Failed to create schedule')
    })

    renderWithContext(<ScheduleForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const reportSelect = screen.getByLabelText(/Select Report/i)
    await user.selectOptions(reportSelect, 'report1')

    const recipientsTextarea = screen.getByLabelText(/Email Addresses/i)
    await user.type(recipientsTextarea, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /Create Schedule/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create schedule')).toBeInTheDocument()
    })
  })

  it('should disable report selection when editing existing schedule', () => {
    const existingSchedule = {
      id: 'schedule1',
      reportId: 'report1',
      reportTitle: 'Custom Report 1',
      frequency: 'daily',
      startDate: '2026-03-01T00:00:00.000Z',
      timeOfDay: '09:00',
      recipients: ['test@example.com'],
      recipientGroups: [],
    }

    renderWithContext(
      <ScheduleForm schedule={existingSchedule} onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const reportSelect = screen.getByLabelText(/Select Report/i)
    expect(reportSelect).toBeDisabled()
  })
})
