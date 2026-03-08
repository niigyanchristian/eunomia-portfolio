import { useState, useRef, useEffect } from 'react'
import { exportToPDF, exportToExcel, exportToPowerPoint, downloadBlob } from '../../services/exportService'
import './ExportButton.css'

const EXPORT_FORMATS = [
  { key: 'pdf', label: 'PDF Document', icon: '📄', extension: '.pdf' },
  { key: 'excel', label: 'Excel Spreadsheet', icon: '📊', extension: '.xlsx' },
  { key: 'powerpoint', label: 'PowerPoint Presentation', icon: '📽', extension: '.pptx' },
]

export const ExportButton = ({
  reportData,
  config = {},
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [message, setMessage] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const generateFilename = (format) => {
    const name = reportData?.templateName || reportData?.config?.title || 'report'
    const safeName = name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase()
    const dateStr = new Date().toISOString().split('T')[0]
    const ext = EXPORT_FORMATS.find((f) => f.key === format)?.extension || ''
    return `${safeName}-${dateStr}${ext}`
  }

  const handleExport = async (format) => {
    setIsOpen(false)
    setExporting(format)
    setMessage(null)
    onExportStart?.(format)

    try {
      let blob
      switch (format) {
        case 'pdf':
          blob = await exportToPDF(reportData, config)
          break
        case 'excel':
          blob = exportToExcel(reportData, config)
          break
        case 'powerpoint':
          blob = await exportToPowerPoint(reportData, config)
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      const filename = generateFilename(format)
      downloadBlob(blob, filename)
      setMessage({ type: 'success', text: `${EXPORT_FORMATS.find((f) => f.key === format)?.label} exported successfully` })
      onExportComplete?.(format, filename)
    } catch (error) {
      const errorMsg = error.message || 'Export failed'
      setMessage({ type: 'error', text: errorMsg })
      onExportError?.(format, error)
    } finally {
      setExporting(null)
    }
  }

  const isDisabled = disabled || !reportData

  return (
    <div className="export-button-container" ref={dropdownRef}>
      <button
        className="export-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDisabled || exporting !== null}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {exporting ? (
          <>
            <span className="export-spinner" aria-hidden="true"></span>
            Exporting...
          </>
        ) : (
          'Export Report'
        )}
      </button>

      {isOpen && (
        <ul className="export-dropdown" role="listbox">
          {EXPORT_FORMATS.map((format) => (
            <li key={format.key} role="option" aria-selected={false}>
              <button
                className="export-option-btn"
                onClick={() => handleExport(format.key)}
                disabled={exporting !== null}
              >
                <span className="export-option-icon" aria-hidden="true">{format.icon}</span>
                <span className="export-option-label">{format.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <div className={`export-message export-message-${message.type}`} role="status">
          {message.text}
        </div>
      )}
    </div>
  )
}
