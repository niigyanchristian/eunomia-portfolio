import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplateSelector from './TemplateSelector'
import { REPORT_TEMPLATES, TemplateCategory } from '../../config/reportTemplates'

describe('TemplateSelector', () => {
  describe('Rendering', () => {
    it('should render component', () => {
      render(<TemplateSelector />)
      expect(screen.getByText('Select Report Template')).toBeInTheDocument()
    })

    it('should display template count', () => {
      render(<TemplateSelector />)
      expect(screen.getByText(/choose from \d+ pre-configured templates/i)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<TemplateSelector />)
      const searchInput = screen.getByPlaceholderText('Search templates...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should render category filters', () => {
      render(<TemplateSelector />)
      expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /👔 executive/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /📊 analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /💰 financial/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /⚙️ operations/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🎯 strategic/i })).toBeInTheDocument()
    })

    it('should render all templates initially', () => {
      render(<TemplateSelector />)
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
      expect(screen.getByText('Risk Report')).toBeInTheDocument()
    })

    it('should display results count', () => {
      render(<TemplateSelector />)
      expect(screen.getByText(`Showing ${REPORT_TEMPLATES.length} of ${REPORT_TEMPLATES.length} templates`)).toBeInTheDocument()
    })
  })

  describe('Template Cards', () => {
    it('should render template cards with name and description', () => {
      render(<TemplateSelector />)
      const executiveTemplate = REPORT_TEMPLATES.find((t) => t.id === 'executive-summary')
      expect(screen.getByText(executiveTemplate.name)).toBeInTheDocument()
      expect(screen.getByText(executiveTemplate.description)).toBeInTheDocument()
    })

    it('should display metric count for each template', () => {
      render(<TemplateSelector />)
      const metricLabels = screen.getAllByText('Metrics')
      expect(metricLabels.length).toBeGreaterThan(0)
    })

    it('should display chart count for each template', () => {
      render(<TemplateSelector />)
      const chartLabels = screen.getAllByText('Charts')
      expect(chartLabels.length).toBeGreaterThan(0)
    })

    it('should show category badge for each template', () => {
      render(<TemplateSelector />)
      const executiveBadges = screen.getAllByText('Executive')
      expect(executiveBadges.length).toBeGreaterThan(0)
    })

    it('should display key metrics preview', () => {
      render(<TemplateSelector />)
      const keyMetricsLabels = screen.getAllByText('Key Metrics:')
      expect(keyMetricsLabels.length).toBeGreaterThan(0)
    })

    it('should show +X more indicator for templates with many metrics', () => {
      render(<TemplateSelector />)
      const executiveTemplate = REPORT_TEMPLATES.find((t) => t.id === 'executive-summary')
      if (executiveTemplate.metrics.length > 4) {
        const moreIndicators = screen.getAllByText(`+${executiveTemplate.metrics.length - 4} more`)
        expect(moreIndicators.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Search Functionality', () => {
    it('should filter templates by search query', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'executive')

      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.queryByText('Quality Metrics')).not.toBeInTheDocument()
    })

    it('should search case-insensitively', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'RISK')

      expect(screen.getByText('Risk Report')).toBeInTheDocument()
    })

    it('should show clear button when search has text', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'financial')

      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear search when clear button clicked', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'financial')

      const clearButton = screen.getByLabelText('Clear search')
      await user.click(clearButton)

      expect(searchInput.value).toBe('')
    })

    it('should show no results message when search finds nothing', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'nonexistenttemplate123')

      expect(screen.getByText(/no templates found matching your search/i)).toBeInTheDocument()
    })

    it('should search in template descriptions', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'budget')

      expect(screen.getByText('Financial Report')).toBeInTheDocument()
    })

    it('should search in metrics', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'completion')

      const results = screen.queryAllByText(/completion/i)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Category Filtering', () => {
    it('should filter by executive category', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const executiveButton = screen.getByRole('button', { name: /👔 executive/i })
      await user.click(executiveButton)

      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getByText('Risk Report')).toBeInTheDocument()
      expect(screen.queryByText('Detailed Analysis')).not.toBeInTheDocument()
    })

    it('should filter by analysis category', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const analysisButton = screen.getByRole('button', { name: /📊 analysis/i })
      await user.click(analysisButton)

      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
      expect(screen.getByText('Comparative Analysis')).toBeInTheDocument()
    })

    it('should filter by financial category', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const financialButton = screen.getByRole('button', { name: /💰 financial/i })
      await user.click(financialButton)

      expect(screen.getByText('Financial Report')).toBeInTheDocument()
      expect(screen.getByText('ROI Analysis')).toBeInTheDocument()
    })

    it('should filter by operations category', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const operationsButton = screen.getByRole('button', { name: /⚙️ operations/i })
      await user.click(operationsButton)

      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
    })

    it('should filter by strategic category', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const strategicButton = screen.getByRole('button', { name: /🎯 strategic/i })
      await user.click(strategicButton)

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument()
    })

    it('should show all templates when All button clicked', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const executiveButton = screen.getByRole('button', { name: /👔 executive/i })
      await user.click(executiveButton)

      const allButton = screen.getByRole('button', { name: /^all$/i })
      await user.click(allButton)

      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
      expect(screen.getByText('Quality Metrics')).toBeInTheDocument()
    })

    it('should highlight active category button', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const allButton = screen.getByRole('button', { name: /^all$/i })
      expect(allButton).toHaveClass('active')

      const executiveButton = screen.getByRole('button', { name: /👔 executive/i })
      await user.click(executiveButton)

      expect(executiveButton).toHaveClass('active')
      expect(allButton).not.toHaveClass('active')
    })

    it('should update results count after filtering', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const executiveButton = screen.getByRole('button', { name: /👔 executive/i })
      await user.click(executiveButton)

      const executiveCount = REPORT_TEMPLATES.filter((t) => t.category === TemplateCategory.EXECUTIVE).length
      expect(screen.getByText(`Showing ${executiveCount} of ${REPORT_TEMPLATES.length} templates`)).toBeInTheDocument()
    })
  })

  describe('Template Selection', () => {
    it('should call onSelectTemplate when template clicked', async () => {
      const user = userEvent.setup()
      const onSelectTemplate = vi.fn()
      render(<TemplateSelector onSelectTemplate={onSelectTemplate} />)

      const templateCard = screen.getByText('Executive Summary').closest('div')
      await user.click(templateCard)

      expect(onSelectTemplate).toHaveBeenCalledTimes(1)
      expect(onSelectTemplate).toHaveBeenCalledWith(expect.objectContaining({
        id: 'executive-summary',
        name: 'Executive Summary',
      }))
    })

    it('should call onSelectTemplate on Enter key', async () => {
      const user = userEvent.setup()
      const onSelectTemplate = vi.fn()
      render(<TemplateSelector onSelectTemplate={onSelectTemplate} />)

      const templateCard = screen.getByText('Executive Summary').closest('div')
      templateCard.focus()
      await user.keyboard('{Enter}')

      expect(onSelectTemplate).toHaveBeenCalled()
    })

    it('should call onSelectTemplate on Space key', async () => {
      const user = userEvent.setup()
      const onSelectTemplate = vi.fn()
      render(<TemplateSelector onSelectTemplate={onSelectTemplate} />)

      const templateCard = screen.getByText('Executive Summary').closest('div')
      templateCard.focus()
      await user.keyboard(' ')

      expect(onSelectTemplate).toHaveBeenCalled()
    })

    it('should highlight selected template', () => {
      render(<TemplateSelector selectedTemplateId="executive-summary" />)

      const templateCard = screen.getByText('Executive Summary').closest('div')
      expect(templateCard).toHaveClass('selected')
    })

    it('should show selected indicator', () => {
      render(<TemplateSelector selectedTemplateId="executive-summary" />)
      expect(screen.getByText('✓ Selected')).toBeInTheDocument()
    })

    it('should not crash when onSelectTemplate is not provided', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const templateCard = screen.getByText('Executive Summary').closest('div')
      await user.click(templateCard)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for search input', () => {
      render(<TemplateSelector />)
      const searchInput = screen.getByLabelText('Search templates')
      expect(searchInput).toBeInTheDocument()
    })

    it('should have proper ARIA labels for clear button', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector />)

      const searchInput = screen.getByPlaceholderText('Search templates...')
      await user.type(searchInput, 'test')

      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('should have proper ARIA pressed state for category filters', () => {
      render(<TemplateSelector />)
      const allButton = screen.getByRole('button', { name: /^all$/i })
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have keyboard navigation support', () => {
      render(<TemplateSelector />)
      const allButtons = screen.getAllByRole('button')
      const buttonsWithTabIndex = allButtons.filter((btn) => btn.hasAttribute('tabIndex'))
      expect(buttonsWithTabIndex.length).toBeGreaterThan(0)
    })
  })

  describe('Specific Templates', () => {
    it('should display all 15+ templates', () => {
      render(<TemplateSelector />)
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
      expect(screen.getByText('Risk Report')).toBeInTheDocument()
      expect(screen.getByText('Financial Report')).toBeInTheDocument()
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
      expect(screen.getByText('Timeline Analysis')).toBeInTheDocument()
      expect(screen.getByText('Quality Metrics')).toBeInTheDocument()
      expect(screen.getByText('Stakeholder Report')).toBeInTheDocument()
      expect(screen.getByText('Portfolio Health')).toBeInTheDocument()
      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument()
      expect(screen.getByText('Comparative Analysis')).toBeInTheDocument()
      expect(screen.getByText('Trend Report')).toBeInTheDocument()
      expect(screen.getByText('Capacity Planning')).toBeInTheDocument()
      expect(screen.getByText('ROI Analysis')).toBeInTheDocument()
    })
  })
})
