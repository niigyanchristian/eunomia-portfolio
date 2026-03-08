import { describe, it, expect } from 'vitest'
import {
  REPORT_TEMPLATES,
  TemplateCategory,
  ChartType,
  TimeRangePreset,
  getTemplateById,
  getTemplatesByCategory,
  searchTemplates,
  getAllCategories,
  getTemplateCounts,
} from './reportTemplates'

describe('reportTemplates', () => {
  describe('REPORT_TEMPLATES', () => {
    it('should have at least 15 templates', () => {
      expect(REPORT_TEMPLATES.length).toBeGreaterThanOrEqual(15)
    })

    it('should have all templates with required fields', () => {
      REPORT_TEMPLATES.forEach((template) => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('category')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('metrics')
        expect(template).toHaveProperty('visualizations')
        expect(template).toHaveProperty('defaultTimeRange')
        expect(template).toHaveProperty('suggestedFilters')
        expect(template).toHaveProperty('layout')

        expect(typeof template.id).toBe('string')
        expect(typeof template.name).toBe('string')
        expect(typeof template.category).toBe('string')
        expect(typeof template.description).toBe('string')
        expect(Array.isArray(template.metrics)).toBe(true)
        expect(Array.isArray(template.visualizations)).toBe(true)
        expect(Array.isArray(template.suggestedFilters)).toBe(true)
      })
    })

    it('should have unique template IDs', () => {
      const ids = REPORT_TEMPLATES.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid categories', () => {
      const validCategories = Object.values(TemplateCategory)
      REPORT_TEMPLATES.forEach((template) => {
        expect(validCategories).toContain(template.category)
      })
    })

    it('should have at least one metric per template', () => {
      REPORT_TEMPLATES.forEach((template) => {
        expect(template.metrics.length).toBeGreaterThan(0)
      })
    })

    it('should have at least one visualization per template', () => {
      REPORT_TEMPLATES.forEach((template) => {
        expect(template.visualizations.length).toBeGreaterThan(0)
      })
    })

    it('should have valid visualization chart types', () => {
      const validChartTypes = Object.values(ChartType)
      REPORT_TEMPLATES.forEach((template) => {
        template.visualizations.forEach((viz) => {
          expect(validChartTypes).toContain(viz.type)
          expect(typeof viz.metric).toBe('string')
          expect(typeof viz.title).toBe('string')
        })
      })
    })

    it('should have valid time range presets', () => {
      const validTimeRanges = Object.values(TimeRangePreset)
      REPORT_TEMPLATES.forEach((template) => {
        expect(validTimeRanges).toContain(template.defaultTimeRange)
      })
    })

    it('should have valid layout structure', () => {
      REPORT_TEMPLATES.forEach((template) => {
        expect(template.layout).toHaveProperty('sections')
        expect(Array.isArray(template.layout.sections)).toBe(true)
        expect(template.layout.sections.length).toBeGreaterThan(0)

        template.layout.sections.forEach((section) => {
          expect(section).toHaveProperty('type')
          expect(section).toHaveProperty('position')
          expect(typeof section.type).toBe('string')
          expect(typeof section.position).toBe('string')
        })
      })
    })
  })

  describe('getTemplateById', () => {
    it('should return template by id', () => {
      const template = getTemplateById('executive-summary')
      expect(template).toBeDefined()
      expect(template.id).toBe('executive-summary')
      expect(template.name).toBe('Executive Summary')
    })

    it('should return null for non-existent template', () => {
      const template = getTemplateById('non-existent-template')
      expect(template).toBeNull()
    })

    it('should find all templates by their IDs', () => {
      REPORT_TEMPLATES.forEach((originalTemplate) => {
        const foundTemplate = getTemplateById(originalTemplate.id)
        expect(foundTemplate).toEqual(originalTemplate)
      })
    })
  })

  describe('getTemplatesByCategory', () => {
    it('should return templates for executive category', () => {
      const templates = getTemplatesByCategory(TemplateCategory.EXECUTIVE)
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((template) => {
        expect(template.category).toBe(TemplateCategory.EXECUTIVE)
      })
    })

    it('should return templates for analysis category', () => {
      const templates = getTemplatesByCategory(TemplateCategory.ANALYSIS)
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((template) => {
        expect(template.category).toBe(TemplateCategory.ANALYSIS)
      })
    })

    it('should return templates for financial category', () => {
      const templates = getTemplatesByCategory(TemplateCategory.FINANCIAL)
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((template) => {
        expect(template.category).toBe(TemplateCategory.FINANCIAL)
      })
    })

    it('should return templates for operations category', () => {
      const templates = getTemplatesByCategory(TemplateCategory.OPERATIONS)
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((template) => {
        expect(template.category).toBe(TemplateCategory.OPERATIONS)
      })
    })

    it('should return templates for strategic category', () => {
      const templates = getTemplatesByCategory(TemplateCategory.STRATEGIC)
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((template) => {
        expect(template.category).toBe(TemplateCategory.STRATEGIC)
      })
    })

    it('should return empty array for invalid category', () => {
      const templates = getTemplatesByCategory('invalid-category')
      expect(templates).toEqual([])
    })
  })

  describe('searchTemplates', () => {
    it('should find templates by name', () => {
      const results = searchTemplates('Executive')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.name.includes('Executive'))).toBe(true)
    })

    it('should find templates by description', () => {
      const results = searchTemplates('budget')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.description.toLowerCase().includes('budget'))).toBe(true)
    })

    it('should find templates by metric', () => {
      const results = searchTemplates('completion')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const resultsLower = searchTemplates('risk')
      const resultsUpper = searchTemplates('RISK')
      const resultsMixed = searchTemplates('RiSk')
      expect(resultsLower.length).toBe(resultsUpper.length)
      expect(resultsLower.length).toBe(resultsMixed.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchTemplates('xyzabc123nonexistent')
      expect(results).toEqual([])
    })

    it('should return all templates for empty search', () => {
      const results = searchTemplates('')
      expect(results.length).toBe(REPORT_TEMPLATES.length)
    })
  })

  describe('getAllCategories', () => {
    it('should return all category values', () => {
      const categories = getAllCategories()
      expect(categories).toEqual(Object.values(TemplateCategory))
    })

    it('should return array of strings', () => {
      const categories = getAllCategories()
      expect(Array.isArray(categories)).toBe(true)
      categories.forEach((category) => {
        expect(typeof category).toBe('string')
      })
    })
  })

  describe('getTemplateCounts', () => {
    it('should return count object', () => {
      const counts = getTemplateCounts()
      expect(typeof counts).toBe('object')
    })

    it('should have counts for all categories', () => {
      const counts = getTemplateCounts()
      Object.values(TemplateCategory).forEach((category) => {
        expect(counts).toHaveProperty(category)
        expect(typeof counts[category]).toBe('number')
        expect(counts[category]).toBeGreaterThan(0)
      })
    })

    it('should have correct total count', () => {
      const counts = getTemplateCounts()
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
      expect(total).toBe(REPORT_TEMPLATES.length)
    })
  })

  describe('Specific Template Validation', () => {
    it('should have executive-summary template', () => {
      const template = getTemplateById('executive-summary')
      expect(template).toBeDefined()
      expect(template.name).toBe('Executive Summary')
      expect(template.category).toBe(TemplateCategory.EXECUTIVE)
    })

    it('should have detailed-analysis template', () => {
      const template = getTemplateById('detailed-analysis')
      expect(template).toBeDefined()
      expect(template.name).toBe('Detailed Analysis')
      expect(template.category).toBe(TemplateCategory.ANALYSIS)
    })

    it('should have risk-report template', () => {
      const template = getTemplateById('risk-report')
      expect(template).toBeDefined()
      expect(template.name).toBe('Risk Report')
    })

    it('should have financial-report template', () => {
      const template = getTemplateById('financial-report')
      expect(template).toBeDefined()
      expect(template.name).toBe('Financial Report')
      expect(template.category).toBe(TemplateCategory.FINANCIAL)
    })

    it('should have performance-dashboard template', () => {
      const template = getTemplateById('performance-dashboard')
      expect(template).toBeDefined()
      expect(template.name).toBe('Performance Dashboard')
    })

    it('should have resource-utilization template', () => {
      const template = getTemplateById('resource-utilization')
      expect(template).toBeDefined()
      expect(template.name).toBe('Resource Utilization')
    })

    it('should have timeline-analysis template', () => {
      const template = getTemplateById('timeline-analysis')
      expect(template).toBeDefined()
      expect(template.name).toBe('Timeline Analysis')
    })

    it('should have quality-metrics template', () => {
      const template = getTemplateById('quality-metrics')
      expect(template).toBeDefined()
      expect(template.name).toBe('Quality Metrics')
    })

    it('should have stakeholder-report template', () => {
      const template = getTemplateById('stakeholder-report')
      expect(template).toBeDefined()
      expect(template.name).toBe('Stakeholder Report')
    })

    it('should have portfolio-health template', () => {
      const template = getTemplateById('portfolio-health')
      expect(template).toBeDefined()
      expect(template.name).toBe('Portfolio Health')
    })

    it('should have strategic-alignment template', () => {
      const template = getTemplateById('strategic-alignment')
      expect(template).toBeDefined()
      expect(template.name).toBe('Strategic Alignment')
      expect(template.category).toBe(TemplateCategory.STRATEGIC)
    })

    it('should have comparative-analysis template', () => {
      const template = getTemplateById('comparative-analysis')
      expect(template).toBeDefined()
      expect(template.name).toBe('Comparative Analysis')
    })

    it('should have trend-report template', () => {
      const template = getTemplateById('trend-report')
      expect(template).toBeDefined()
      expect(template.name).toBe('Trend Report')
    })

    it('should have capacity-planning template', () => {
      const template = getTemplateById('capacity-planning')
      expect(template).toBeDefined()
      expect(template.name).toBe('Capacity Planning')
    })

    it('should have roi-analysis template', () => {
      const template = getTemplateById('roi-analysis')
      expect(template).toBeDefined()
      expect(template.name).toBe('ROI Analysis')
      expect(template.category).toBe(TemplateCategory.FINANCIAL)
    })
  })
})
