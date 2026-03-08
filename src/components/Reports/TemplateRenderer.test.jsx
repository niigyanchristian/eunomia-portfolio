import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TemplateRenderer from './TemplateRenderer'

const mockReportData = {
  totalProjects: 50,
  completionRate: 75.5,
  publishedCount: 30,
  draftCount: 20,
  statusDistribution: {
    published: 30,
    draft: 15,
    archived: 5,
  },
  categoryBreakdown: {
    'Web Development': 20,
    'Mobile Apps': 15,
    'Data Science': 10,
    'DevOps': 5,
  },
  periodChange: 12.5,
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31',
  },
  projectDetails: [
    {
      name: 'Project Alpha',
      status: 'published',
      category: 'Web Development',
      createdAt: '2024-03-15',
    },
    {
      name: 'Project Beta',
      status: 'draft',
      category: 'Mobile Apps',
      createdAt: '2024-06-20',
    },
  ],
  trendData: [
    { label: 'Jan 2024', total: 5, published: 3, draft: 2 },
    { label: 'Feb 2024', total: 8, published: 5, draft: 3 },
    { label: 'Mar 2024', total: 12, published: 8, draft: 4 },
  ],
}

describe('TemplateRenderer', () => {
  describe('Rendering', () => {
    it('should render error message for non-existent template', () => {
      render(<TemplateRenderer templateId="non-existent-template" data={mockReportData} />)
      expect(screen.getByText(/template not found/i)).toBeInTheDocument()
    })

    it('should render empty state when no data provided', () => {
      render(<TemplateRenderer templateId="executive-summary" data={null} />)
      expect(screen.getByText(/no data available/i)).toBeInTheDocument()
    })

    it('should render template header with name', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
    })

    it('should render template description', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText(/High-level KPIs/i)).toBeInTheDocument()
    })

    it('should render custom title from config', () => {
      const config = { title: 'Custom Report Title' }
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} config={config} />)
      expect(screen.getByText('Custom Report Title')).toBeInTheDocument()
    })

    it('should render date range when available', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText(/2024-01-01 to 2024-12-31/i)).toBeInTheDocument()
    })
  })

  describe('Metric Cards', () => {
    it('should render metric cards for available metrics', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const totalProjectsElements = screen.getAllByText('Total Projects')
      expect(totalProjectsElements.length).toBeGreaterThan(0)
      const valueElements = screen.getAllByText('50')
      expect(valueElements.length).toBeGreaterThan(0)
    })

    it('should format numeric metrics with locale string', () => {
      const largeData = { ...mockReportData, totalProjects: 1000000 }
      render(<TemplateRenderer templateId="executive-summary" data={largeData} />)
      const elements = screen.getAllByText('1,000,000')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render completion rate metric', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const rateElements = screen.getAllByText('Completion Rate')
      expect(rateElements.length).toBeGreaterThan(0)
      const valueElements = screen.getAllByText('75.5')
      expect(valueElements.length).toBeGreaterThan(0)
    })

    it('should not render metrics with undefined values', () => {
      const dataWithMissing = { totalProjects: 50 }
      render(<TemplateRenderer templateId="executive-summary" data={dataWithMissing} />)
      expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument()
    })
  })

  describe('Visualizations', () => {
    it('should render chart containers', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const chartTitles = screen.getAllByText(/Project Status|Projects by Category|Completion Trend/i)
      expect(chartTitles.length).toBeGreaterThan(0)
    })

    it('should render empty state for charts with no data', () => {
      const emptyData = { totalProjects: 5 }
      render(<TemplateRenderer templateId="executive-summary" data={emptyData} />)
      const emptyMessages = screen.getAllByText(/No data for/i)
      expect(emptyMessages.length).toBeGreaterThan(0)
    })

    it('should prepare chart data from object metrics', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText('Project Status')).toBeInTheDocument()
    })

    it('should prepare chart data from array metrics', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText('Completion Trend')).toBeInTheDocument()
    })
  })

  describe('Data Table', () => {
    it('should render project details table', () => {
      render(<TemplateRenderer templateId="detailed-analysis" data={mockReportData} />)
      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
      expect(screen.getByText('Project Beta')).toBeInTheDocument()
    })

    it('should render status badges', () => {
      render(<TemplateRenderer templateId="detailed-analysis" data={mockReportData} />)
      const statusElements = screen.getAllByText('published')
      expect(statusElements.length).toBeGreaterThan(0)
    })

    it('should render empty message when no project details', () => {
      const dataWithoutDetails = { ...mockReportData, projectDetails: [] }
      render(<TemplateRenderer templateId="detailed-analysis" data={dataWithoutDetails} />)
      expect(screen.getByText(/No projects to display/i)).toBeInTheDocument()
    })

    it('should limit table to 10 rows', () => {
      const manyProjects = Array.from({ length: 20 }, (_, i) => ({
        name: `Project ${i}`,
        status: 'published',
        category: 'Web',
        createdAt: '2024-01-01',
      }))
      const dataWithMany = { ...mockReportData, projectDetails: manyProjects }
      render(<TemplateRenderer templateId="detailed-analysis" data={dataWithMany} />)

      expect(screen.getByText('Project 0')).toBeInTheDocument()
      expect(screen.getByText('Project 9')).toBeInTheDocument()
      expect(screen.queryByText('Project 10')).not.toBeInTheDocument()
    })
  })

  describe('Alerts', () => {
    it('should render warning alert for overdue projects', () => {
      const dataWithAlerts = { ...mockReportData, overdueProjects: 5 }
      render(<TemplateRenderer templateId="risk-report" data={dataWithAlerts} />)
      expect(screen.getByText(/5 overdue projects/i)).toBeInTheDocument()
    })

    it('should render warning alert for at-risk projects', () => {
      const dataWithAlerts = { ...mockReportData, atRiskProjects: 3 }
      render(<TemplateRenderer templateId="risk-report" data={dataWithAlerts} />)
      expect(screen.getByText(/3 at-risk projects/i)).toBeInTheDocument()
    })

    it('should render info alert for low completion rate', () => {
      const dataWithLowRate = { ...mockReportData, completionRate: 40 }
      render(<TemplateRenderer templateId="risk-report" data={dataWithLowRate} />)
      expect(screen.getByText(/Low completion rate: 40%/i)).toBeInTheDocument()
    })

    it('should show no alerts message when everything is good', () => {
      const goodData = { ...mockReportData, completionRate: 90 }
      render(<TemplateRenderer templateId="risk-report" data={goodData} />)
      expect(screen.getByText(/No alerts at this time/i)).toBeInTheDocument()
    })
  })

  describe('Different Template Types', () => {
    it('should render detailed-analysis template', () => {
      render(<TemplateRenderer templateId="detailed-analysis" data={mockReportData} />)
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
    })

    it('should render risk-report template', () => {
      render(<TemplateRenderer templateId="risk-report" data={mockReportData} />)
      expect(screen.getByText('Risk Report')).toBeInTheDocument()
    })

    it('should render financial-report template', () => {
      render(<TemplateRenderer templateId="financial-report" data={mockReportData} />)
      expect(screen.getByText('Financial Report')).toBeInTheDocument()
    })

    it('should render performance-dashboard template', () => {
      render(<TemplateRenderer templateId="performance-dashboard" data={mockReportData} />)
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
    })

    it('should render resource-utilization template', () => {
      render(<TemplateRenderer templateId="resource-utilization" data={mockReportData} />)
      expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
    })

    it('should render timeline-analysis template', () => {
      render(<TemplateRenderer templateId="timeline-analysis" data={mockReportData} />)
      expect(screen.getByText('Timeline Analysis')).toBeInTheDocument()
    })

    it('should render quality-metrics template', () => {
      render(<TemplateRenderer templateId="quality-metrics" data={mockReportData} />)
      expect(screen.getByText('Quality Metrics')).toBeInTheDocument()
    })

    it('should render stakeholder-report template', () => {
      render(<TemplateRenderer templateId="stakeholder-report" data={mockReportData} />)
      expect(screen.getByText('Stakeholder Report')).toBeInTheDocument()
    })

    it('should render portfolio-health template', () => {
      render(<TemplateRenderer templateId="portfolio-health" data={mockReportData} />)
      expect(screen.getByText('Portfolio Health')).toBeInTheDocument()
    })

    it('should render strategic-alignment template', () => {
      render(<TemplateRenderer templateId="strategic-alignment" data={mockReportData} />)
      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument()
    })

    it('should render comparative-analysis template', () => {
      render(<TemplateRenderer templateId="comparative-analysis" data={mockReportData} />)
      expect(screen.getByText('Comparative Analysis')).toBeInTheDocument()
    })

    it('should render trend-report template', () => {
      render(<TemplateRenderer templateId="trend-report" data={mockReportData} />)
      expect(screen.getByText('Trend Report')).toBeInTheDocument()
    })

    it('should render capacity-planning template', () => {
      render(<TemplateRenderer templateId="capacity-planning" data={mockReportData} />)
      expect(screen.getByText('Capacity Planning')).toBeInTheDocument()
    })

    it('should render roi-analysis template', () => {
      render(<TemplateRenderer templateId="roi-analysis" data={mockReportData} />)
      expect(screen.getByText('ROI Analysis')).toBeInTheDocument()
    })
  })

  describe('Layout Sections', () => {
    it('should render sections in correct order', () => {
      const { container } = render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const sections = container.querySelectorAll('.template-layout > div')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should apply correct position classes', () => {
      const { container } = render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const topSection = container.querySelector('.section-top')
      expect(topSection).toBeInTheDocument()
    })

    it('should handle multiple column layouts', () => {
      const { container } = render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      const chartSection = container.querySelector('.columns-2')
      expect(chartSection).toBeInTheDocument()
    })
  })

  describe('Data Binding', () => {
    it('should bind data correctly to metrics', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getAllByText('50').length).toBeGreaterThan(0)
      expect(screen.getAllByText('75.5').length).toBeGreaterThan(0)
    })

    it('should handle missing data gracefully', () => {
      const partialData = { totalProjects: 10 }
      render(<TemplateRenderer templateId="executive-summary" data={partialData} />)
      expect(screen.getAllByText('10').length).toBeGreaterThan(0)
    })

    it('should handle nested object data', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getAllByText('Status Distribution').length).toBeGreaterThan(0)
    })

    it('should handle array data', () => {
      render(<TemplateRenderer templateId="executive-summary" data={mockReportData} />)
      expect(screen.getByText('Completion Trend')).toBeInTheDocument()
    })
  })
})
