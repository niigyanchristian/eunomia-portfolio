import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './BarChart.css'

export const BarChart = ({
  data = [],
  xKey = 'label',
  bars = [],
  colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true,
  loading = false,
  error = null,
  height = 300,
  layout = 'vertical'
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
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {layout === 'vertical' ? (
            <>
              <XAxis
                type="number"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.color || colors[index % colors.length]}
              name={bar.name || bar.dataKey}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
