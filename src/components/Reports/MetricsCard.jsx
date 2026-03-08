import './MetricsCard.css'

const METRIC_TYPES = {
  currency: 'currency',
  percentage: 'percentage',
  count: 'count',
  decimal: 'decimal'
}

const formatValue = (value, type) => {
  if (value === null || value === undefined) return 'N/A'

  switch (type) {
    case METRIC_TYPES.currency:
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case METRIC_TYPES.percentage:
      return `${value.toFixed(1)}%`
    case METRIC_TYPES.decimal:
      return value.toFixed(2)
    case METRIC_TYPES.count:
    default:
      return value.toLocaleString()
  }
}

export const MetricsCard = ({
  title,
  value,
  type = METRIC_TYPES.count,
  yoyChange = null,
  qoqChange = null,
  icon = null,
  trend = 'neutral'
}) => {
  const getTrendClass = (change) => {
    if (change === null || change === undefined) return 'neutral'
    if (change > 0) return 'positive'
    if (change < 0) return 'negative'
    return 'neutral'
  }

  const renderChange = (change, label) => {
    if (change === null || change === undefined) return null

    const trendClass = getTrendClass(change)
    const isPositive = change > 0
    const isNegative = change < 0

    return (
      <div className={`metric-change ${trendClass}`}>
        <span className="change-indicator">
          {isPositive && '↑'}
          {isNegative && '↓'}
          {!isPositive && !isNegative && '→'}
        </span>
        <span className="change-value">{Math.abs(change).toFixed(1)}%</span>
        <span className="change-label">{label}</span>
      </div>
    )
  }

  return (
    <div className={`metrics-card trend-${trend}`}>
      <div className="metrics-card-header">
        {icon && <div className="metrics-icon">{icon}</div>}
        <h3 className="metrics-title">{title}</h3>
      </div>

      <div className="metrics-value">
        {formatValue(value, type)}
      </div>

      {(yoyChange !== null || qoqChange !== null) && (
        <div className="metrics-comparisons">
          {yoyChange !== null && renderChange(yoyChange, 'YoY')}
          {qoqChange !== null && renderChange(qoqChange, 'QoQ')}
        </div>
      )}
    </div>
  )
}
