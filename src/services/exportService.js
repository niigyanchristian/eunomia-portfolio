import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import PptxGenJS from 'pptxgenjs'
import { format } from 'date-fns'

const DEFAULT_BRAND = {
  name: 'Portfolio Report',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#10b981',
  fontFamily: 'helvetica',
}

function formatDate(dateStr, dateFormat = 'MMM dd, yyyy') {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), dateFormat)
  } catch {
    return dateStr
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

function buildSectionsFromMetrics(metrics) {
  const sections = []

  if (metrics.totalProjects !== undefined || metrics.completionRate !== undefined || metrics.velocity !== undefined) {
    const items = []
    if (metrics.totalProjects !== undefined) items.push({ label: 'Total Projects', value: metrics.totalProjects })
    if (metrics.completionRate !== undefined) items.push({ label: 'Completion Rate', value: `${metrics.completionRate}%` })
    if (metrics.velocity !== undefined) items.push({ label: 'Velocity', value: metrics.velocity })
    if (metrics.overdueProjects !== undefined) items.push({ label: 'Overdue Projects', value: metrics.overdueProjects })
    if (metrics.atRiskProjects !== undefined) items.push({ label: 'At Risk Projects', value: metrics.atRiskProjects })
    sections.push({ title: 'Key Metrics', type: 'metrics', data: items })
  }

  if (metrics.categoryBreakdown) {
    const tableData = Object.entries(metrics.categoryBreakdown).map(([category, count]) => ({
      category,
      count,
    }))
    sections.push({
      title: 'Category Breakdown',
      type: 'table',
      columns: [
        { key: 'category', label: 'Category' },
        { key: 'count', label: 'Count' },
      ],
      data: tableData,
    })
  }

  if (metrics.statusDistribution) {
    const tableData = Object.entries(metrics.statusDistribution).map(([status, count]) => ({
      status,
      count,
    }))
    sections.push({
      title: 'Status Distribution',
      type: 'table',
      columns: [
        { key: 'status', label: 'Status' },
        { key: 'count', label: 'Count' },
      ],
      data: tableData,
    })
  }

  if (metrics.timeline && metrics.timeline.length > 0) {
    const tableData = metrics.timeline.map((entry) => ({
      period: entry.period || entry.label || '',
      total: entry.total || entry.value || 0,
    }))
    sections.push({
      title: 'Timeline',
      type: 'table',
      columns: [
        { key: 'period', label: 'Period' },
        { key: 'total', label: 'Total' },
      ],
      data: tableData,
    })
  }

  if (metrics.trendData && metrics.trendData.length > 0 && !metrics.timeline) {
    const tableData = metrics.trendData.map((entry) => ({
      period: entry.period || entry.label || '',
      total: entry.total || entry.value || 0,
    }))
    sections.push({
      title: 'Trend Data',
      type: 'table',
      columns: [
        { key: 'period', label: 'Period' },
        { key: 'total', label: 'Total' },
      ],
      data: tableData,
    })
  }

  if (metrics.recentUpdates && metrics.recentUpdates.length > 0) {
    sections.push({
      title: 'Recent Updates',
      type: 'table',
      columns: [
        { key: 'title', label: 'Project' },
        { key: 'status', label: 'Status' },
        { key: 'updatedAt', label: 'Updated' },
      ],
      data: metrics.recentUpdates.map((u) => ({
        ...u,
        updatedAt: formatDate(u.updatedAt),
      })),
    })
  }

  if (metrics.milestones && metrics.milestones.length > 0) {
    sections.push({
      title: 'Milestones',
      type: 'table',
      columns: [
        { key: 'title', label: 'Project' },
        { key: 'completionDate', label: 'Target Date' },
        { key: 'status', label: 'Status' },
      ],
      data: metrics.milestones.map((m) => ({
        ...m,
        completionDate: formatDate(m.completionDate),
      })),
    })
  }

  return sections
}

// ──────────────────────────────────────────
// PDF Export
// ──────────────────────────────────────────

export async function exportToPDF(reportData, config = {}) {
  if (!reportData) {
    throw new Error('Report data is required for PDF export')
  }

  const {
    pageSize = 'a4',
    orientation = 'portrait',
    branding = {},
    includeSections,
    dateFormat = 'MMM dd, yyyy',
  } = config

  const brand = { ...DEFAULT_BRAND, ...branding }
  const primaryRgb = hexToRgb(brand.primaryColor)
  const secondaryRgb = hexToRgb(brand.secondaryColor)

  const doc = new jsPDF({ orientation, format: pageSize })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  const reportTitle = reportData.templateName || reportData.config?.title || 'Report'
  const generatedAt = reportData.generatedAt
    ? formatDate(reportData.generatedAt, dateFormat)
    : formatDate(new Date().toISOString(), dateFormat)

  // --- Header on first page ---
  doc.setFillColor(...primaryRgb)
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont(brand.fontFamily, 'bold')
  doc.text(brand.name, margin, 18)
  doc.setFontSize(14)
  doc.text(reportTitle, margin, 30)

  // --- Date and summary info ---
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont(brand.fontFamily, 'normal')
  let yPos = 50
  doc.text(`Generated: ${generatedAt}`, margin, yPos)
  yPos += 8

  if (reportData.summary) {
    doc.text(`Total Projects: ${reportData.summary.totalProjects}`, margin, yPos)
    yPos += 6
    if (reportData.summary.filtersApplied > 0) {
      doc.text(`Filters Applied: ${reportData.summary.filtersApplied}`, margin, yPos)
      yPos += 6
    }
  }

  yPos += 4

  // --- Table of Contents ---
  const sections = buildSectionsFromMetrics(reportData.metrics || {})
  const filteredSections = includeSections
    ? sections.filter((s) => includeSections.includes(s.title))
    : sections

  if (filteredSections.length > 1) {
    doc.setFontSize(14)
    doc.setFont(brand.fontFamily, 'bold')
    doc.setTextColor(...primaryRgb)
    doc.text('Table of Contents', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont(brand.fontFamily, 'normal')
    doc.setTextColor(0, 0, 0)
    filteredSections.forEach((section, index) => {
      doc.text(`${index + 1}. ${section.title}`, margin + 4, yPos)
      yPos += 6
    })
    yPos += 6
  }

  // --- Comparisons ---
  if (reportData.comparisons && (reportData.comparisons.yoy !== undefined || reportData.comparisons.qoq !== undefined)) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }
    doc.setFontSize(14)
    doc.setFont(brand.fontFamily, 'bold')
    doc.setTextColor(...primaryRgb)
    doc.text('Period Comparisons', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont(brand.fontFamily, 'normal')
    doc.setTextColor(0, 0, 0)
    if (reportData.comparisons.yoy !== undefined) {
      doc.text(`Year-over-Year Change: ${reportData.comparisons.yoy}%`, margin + 4, yPos)
      yPos += 6
    }
    if (reportData.comparisons.qoq !== undefined) {
      doc.text(`Quarter-over-Quarter Change: ${reportData.comparisons.qoq}%`, margin + 4, yPos)
      yPos += 6
    }
    yPos += 6
  }

  // --- Sections ---
  for (const section of filteredSections) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont(brand.fontFamily, 'bold')
    doc.setTextColor(...primaryRgb)
    doc.text(section.title, margin, yPos)
    yPos += 8

    if (section.type === 'metrics') {
      doc.setFontSize(10)
      doc.setFont(brand.fontFamily, 'normal')
      doc.setTextColor(0, 0, 0)
      for (const item of section.data) {
        doc.text(`${item.label}: ${item.value}`, margin + 4, yPos)
        yPos += 6
      }
      yPos += 4
    }

    if (section.type === 'table' && section.data.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [section.columns.map((c) => c.label)],
        body: section.data.map((row) => section.columns.map((c) => String(row[c.key] ?? ''))),
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: primaryRgb,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
      })
      yPos = doc.lastAutoTable.finalY + 10
    }
  }

  // --- Chart images ---
  if (config.chartImages && config.chartImages.length > 0) {
    for (const imgData of config.chartImages) {
      if (yPos > pageHeight - 100) {
        doc.addPage()
        yPos = 20
      }
      const imgWidth = pageWidth - margin * 2
      const imgHeight = imgWidth * 0.5
      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 10
    }
  }

  // --- Footer on all pages ---
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont(brand.fontFamily, 'normal')
    doc.setTextColor(...secondaryRgb)
    doc.text(`${brand.name} | ${reportTitle}`, margin, pageHeight - 10)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10)
  }

  return doc.output('blob')
}

// ──────────────────────────────────────────
// Excel Export
// ──────────────────────────────────────────

export function exportToExcel(reportData, config = {}) {
  if (!reportData) {
    throw new Error('Report data is required for Excel export')
  }

  const {
    includeSections,
    dateFormat = 'MMM dd, yyyy',
  } = config

  const workbook = XLSX.utils.book_new()
  const metrics = reportData.metrics || {}
  const reportTitle = reportData.templateName || reportData.config?.title || 'Report'
  const generatedAt = reportData.generatedAt
    ? formatDate(reportData.generatedAt, dateFormat)
    : formatDate(new Date().toISOString(), dateFormat)

  // --- Summary Sheet ---
  const summaryData = [
    ['Report Summary'],
    [''],
    ['Report Name', reportTitle],
    ['Generated At', generatedAt],
    ['Total Projects', reportData.summary?.totalProjects ?? 'N/A'],
    ['Filtered From', reportData.summary?.filteredFrom ?? 'N/A'],
    ['Filters Applied', reportData.summary?.filtersApplied ?? 0],
    [''],
    ['Key Metrics'],
  ]

  if (metrics.totalProjects !== undefined) summaryData.push(['Total Projects', metrics.totalProjects])
  if (metrics.completionRate !== undefined) summaryData.push(['Completion Rate', `${metrics.completionRate}%`])
  if (metrics.velocity !== undefined) summaryData.push(['Velocity', metrics.velocity])
  if (metrics.overdueProjects !== undefined) summaryData.push(['Overdue Projects', metrics.overdueProjects])
  if (metrics.atRiskProjects !== undefined) summaryData.push(['At Risk Projects', metrics.atRiskProjects])

  if (reportData.comparisons) {
    summaryData.push([''])
    summaryData.push(['Period Comparisons'])
    if (reportData.comparisons.yoy !== undefined) summaryData.push(['Year-over-Year', `${reportData.comparisons.yoy}%`])
    if (reportData.comparisons.qoq !== undefined) summaryData.push(['Quarter-over-Quarter', `${reportData.comparisons.qoq}%`])
    if (reportData.comparisons.currentPeriod !== undefined) summaryData.push(['Current Period', reportData.comparisons.currentPeriod])
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // --- Data Sheets from sections ---
  const sections = buildSectionsFromMetrics(metrics)
  const filteredSections = includeSections
    ? sections.filter((s) => includeSections.includes(s.title))
    : sections

  for (const section of filteredSections) {
    if (section.type === 'table' && section.data.length > 0) {
      const sheetName = section.title.substring(0, 31)
      const headerRow = section.columns.map((c) => c.label)
      const dataRows = section.data.map((row) => section.columns.map((c) => row[c.key] ?? ''))
      const sheetData = [headerRow, ...dataRows]
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

      worksheet['!cols'] = section.columns.map(() => ({ wch: 20 }))

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    }
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// ──────────────────────────────────────────
// PowerPoint Export
// ──────────────────────────────────────────

export async function exportToPowerPoint(reportData, config = {}) {
  if (!reportData) {
    throw new Error('Report data is required for PowerPoint export')
  }

  const {
    branding = {},
    includeSections,
    dateFormat = 'MMM dd, yyyy',
  } = config

  const brand = { ...DEFAULT_BRAND, ...branding }
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = brand.name
  pptx.subject = reportData.templateName || 'Report'

  const reportTitle = reportData.templateName || reportData.config?.title || 'Report'
  const generatedAt = reportData.generatedAt
    ? formatDate(reportData.generatedAt, dateFormat)
    : formatDate(new Date().toISOString(), dateFormat)

  // --- Title Slide ---
  const titleSlide = pptx.addSlide()
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: brand.primaryColor.replace('#', '') },
  })
  titleSlide.addText(reportTitle, {
    x: 0.8, y: 1.5, w: '80%', h: 1.5,
    fontSize: 36, color: 'FFFFFF', bold: true,
    fontFace: 'Arial',
  })
  titleSlide.addText(brand.name, {
    x: 0.8, y: 3.2, w: '80%', h: 0.6,
    fontSize: 18, color: 'FFFFFF', fontFace: 'Arial',
  })
  titleSlide.addText(`Generated: ${generatedAt}`, {
    x: 0.8, y: 4.0, w: '80%', h: 0.5,
    fontSize: 14, color: 'DDDDDD', fontFace: 'Arial',
  })
  titleSlide.addNotes(`${reportTitle} - Generated on ${generatedAt} by ${brand.name}`)

  // --- Summary Slide ---
  const summarySlide = pptx.addSlide()
  addSlideHeader(summarySlide, 'Summary', brand)

  const summaryItems = []
  if (reportData.summary) {
    summaryItems.push(`Total Projects: ${reportData.summary.totalProjects}`)
    if (reportData.summary.filtersApplied > 0) {
      summaryItems.push(`Filters Applied: ${reportData.summary.filtersApplied}`)
    }
  }
  if (reportData.metrics?.completionRate !== undefined) {
    summaryItems.push(`Completion Rate: ${reportData.metrics.completionRate}%`)
  }
  if (reportData.metrics?.velocity !== undefined) {
    summaryItems.push(`Velocity: ${reportData.metrics.velocity}`)
  }
  if (reportData.comparisons?.yoy !== undefined) {
    summaryItems.push(`YoY Change: ${reportData.comparisons.yoy}%`)
  }
  if (reportData.comparisons?.qoq !== undefined) {
    summaryItems.push(`QoQ Change: ${reportData.comparisons.qoq}%`)
  }

  if (summaryItems.length > 0) {
    summarySlide.addText(
      summaryItems.map((item) => ({ text: item, options: { bullet: true, breakLine: true } })),
      {
        x: 0.8, y: 1.5, w: '80%', h: 4,
        fontSize: 18, color: '333333', fontFace: 'Arial',
        paraSpaceAfter: 12,
      }
    )
  }
  summarySlide.addNotes('Summary of key metrics and comparisons for the reporting period.')

  // --- Section Slides ---
  const sections = buildSectionsFromMetrics(reportData.metrics || {})
  const filteredSections = includeSections
    ? sections.filter((s) => includeSections.includes(s.title))
    : sections

  for (const section of filteredSections) {
    const slide = pptx.addSlide()
    addSlideHeader(slide, section.title, brand)

    if (section.type === 'metrics') {
      const metricsText = section.data.map((item) => ({
        text: `${item.label}: ${item.value}`,
        options: { bullet: true, breakLine: true },
      }))
      slide.addText(metricsText, {
        x: 0.8, y: 1.5, w: '80%', h: 4,
        fontSize: 20, color: '333333', fontFace: 'Arial',
        paraSpaceAfter: 14,
      })
      slide.addNotes(`Key metrics: ${section.data.map((i) => `${i.label}=${i.value}`).join(', ')}`)
    }

    if (section.type === 'table' && section.data.length > 0) {
      const headerRow = section.columns.map((c) => ({
        text: c.label,
        options: {
          bold: true,
          color: 'FFFFFF',
          fill: { color: brand.primaryColor.replace('#', '') },
          fontSize: 12,
          fontFace: 'Arial',
        },
      }))

      const bodyRows = section.data.slice(0, 15).map((row, rowIndex) =>
        section.columns.map((c) => ({
          text: String(row[c.key] ?? ''),
          options: {
            fontSize: 11,
            color: '333333',
            fill: { color: rowIndex % 2 === 0 ? 'F5F7FA' : 'FFFFFF' },
            fontFace: 'Arial',
          },
        }))
      )

      slide.addTable([headerRow, ...bodyRows], {
        x: 0.5, y: 1.5, w: 12,
        border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
        colW: section.columns.map(() => 12 / section.columns.length),
        rowH: 0.4,
        autoPage: false,
      })

      if (section.data.length > 15) {
        slide.addText(`Showing 15 of ${section.data.length} rows`, {
          x: 0.5, y: 6.8, w: 12, h: 0.3,
          fontSize: 10, color: '999999', fontFace: 'Arial', italic: true,
        })
      }
      slide.addNotes(`${section.title}: ${section.data.length} rows of data.`)
    }
  }

  // --- Chart image slides ---
  if (config.chartImages && config.chartImages.length > 0) {
    for (const imgData of config.chartImages) {
      const chartSlide = pptx.addSlide()
      addSlideHeader(chartSlide, 'Chart', brand)
      chartSlide.addImage({
        data: imgData,
        x: 0.5, y: 1.5, w: 12, h: 5.5,
      })
      chartSlide.addNotes('Chart visualization.')
    }
  }

  const pptxBlob = await pptx.write({ outputType: 'blob' })
  return pptxBlob
}

function addSlideHeader(slide, title, brand) {
  slide.addShape(slide._slideLayout?._pptx?.ShapeType?.rect || 'rect', {
    x: 0, y: 0, w: '100%', h: 1.2,
    fill: { color: brand.primaryColor.replace('#', '') },
  })
  slide.addText(title, {
    x: 0.8, y: 0.2, w: '80%', h: 0.8,
    fontSize: 28, color: 'FFFFFF', bold: true,
    fontFace: 'Arial',
  })
}

// ──────────────────────────────────────────
// Download Helper
// ──────────────────────────────────────────

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
