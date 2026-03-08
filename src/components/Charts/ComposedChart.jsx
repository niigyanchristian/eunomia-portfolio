import { ComposedChart as RechartsComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ComposedChart.css'

export const ComposedChart = ({
  data = [],
  xKey = 'label',
  elements = [],
  colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true,
  loading = false,
  error = null,
  height = 300
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

  const renderElement = (element, index) => {
    const color = element.color || colors[index % colors.length]
    const name = element.name || element.dataKey

    switch (element.type) {
      case 'line':
        return (
          <Line
            key={element.dataKey}
            type="monotone"
            dataKey={element.dataKey}
            stroke={color}
            strokeWidth={2}
            name={name}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )
      case 'bar':
        return (
          <Bar
            key={element.dataKey}
            dataKey={element.dataKey}
            fill={color}
            name={name}
            radius={[4, 4, 0, 0]}
          />
        )
      case 'area':
        return (
          <Area
            key={element.dataKey}
            type="monotone"
            dataKey={element.dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.6}
            strokeWidth={2}
            name={name}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
          {elements.map((element, index) => renderElement(element, index))}
        </RechartsComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
