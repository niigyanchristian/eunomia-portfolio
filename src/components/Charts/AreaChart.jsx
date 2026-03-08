import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './AreaChart.css'

export const AreaChart = ({
  data = [],
  xKey = 'label',
  areas = [],
  colors = ['#3b82f6', '#8b5cf6', '#10b981'],
  showGrid = true,
  showLegend = true,
  loading = false,
  error = null,
  height = 300,
  stacked = false
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

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.color || colors[index % colors.length]}
              fill={area.color || colors[index % colors.length]}
              fillOpacity={0.6}
              strokeWidth={2}
              name={area.name || area.dataKey}
              stackId={stacked ? '1' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
