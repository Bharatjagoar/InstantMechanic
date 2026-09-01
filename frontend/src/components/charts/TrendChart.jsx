import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const GRID_COLORS = { light: '#e1e0d9', dark: '#2c2c2a' }
const MUTED_COLOR = '#898781' // same step in both modes per the palette
const SURFACE_COLORS = { light: '#fcfcfb', dark: '#1a1a19' }

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function TrendChart({ data, dataKey, color, valueFormatter }) {
  const { theme } = useTheme()
  const gridColor = GRID_COLORS[theme]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          stroke={MUTED_COLOR}
          tick={{ fontSize: 11, fill: MUTED_COLOR }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke={MUTED_COLOR}
          tick={{ fontSize: 11, fill: MUTED_COLOR }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={(value) => [valueFormatter ? valueFormatter(value) : value, undefined]}
          labelFormatter={formatShortDate}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: `1px solid ${gridColor}`,
            backgroundColor: SURFACE_COLORS[theme],
            color: theme === 'dark' ? '#ffffff' : '#0b0b0b',
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${dataKey})`}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
