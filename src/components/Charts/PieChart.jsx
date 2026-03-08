import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './PieChart.css'

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

export const PieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_COLORS,
  showLegend = true,
  showLabels = true,
  loading = false,
  error = null,
  height = 300,
  innerRadius = 0
}) => {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="chart-spinner"></div>
        <p>Loading chart data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chart-container error">
        <p className="chart-error-message">{error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty">
        <p className="chart-empty-message">No data available</p>
      </div>
    )
  }

  const renderLabel = (entry) => {
    if (!showLabels) return null
    const percent = ((entry.value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(1)
    return `${entry[nameKey]}: ${percent}%`
  }

  return (
    <div className="chart-container pie-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius > 0 ? innerRadius + 60 : 80}
            label={showLabels ? renderLabel : false}
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
