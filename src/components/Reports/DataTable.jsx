import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import './DataTable.css'

export const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  exportFileName = 'data-export',
  loading = false,
  error = null
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({})

  const filteredData = useMemo(() => {
    let result = [...data]

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => {
          const cellValue = String(row[key] || '').toLowerCase()
          return cellValue.includes(value.toLowerCase())
        })
      }
    })

    return result
  }, [data, filters])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const csvContent = [
      columns.map((col) => col.label).join(','),
      ...sortedData.map((row) =>
        columns.map((col) => {
          const value = row[col.key]
          const stringValue = value === null || value === undefined ? '' : String(value)
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${exportFileName}.csv`
    link.click()
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sortedData.map((row) =>
        columns.reduce((acc, col) => {
          acc[col.label] = row[col.key]
          return acc
        }, {})
      )
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`)
  }

  if (loading) {
    return (
      <div className="data-table-container loading">
        <div className="table-spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="data-table-container error">
        <p className="table-error-message">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="data-table-container empty">
        <p className="table-empty-message">No data available</p>
      </div>
    )
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <div className="table-info">
          <span className="table-count">
            Showing {paginatedData.length} of {sortedData.length} rows
            {sortedData.length !== data.length && ` (filtered from ${data.length})`}
          </span>
        </div>
        <div className="table-actions">
          <button className="export-btn" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="export-btn" onClick={handleExportExcel}>
            Export Excel
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.sortable !== false ? 'sortable' : ''}>
                  <div className="th-content">
                    <span
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className="th-label"
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                    {col.filterable !== false && (
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="filter-input"
                        value={filters[col.key] || ''}
                        onChange={(e) => handleFilter(col.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
