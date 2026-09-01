import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { ResponsiveContainer } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const GRID_COLORS = { light: '#e1e0d9', dark: '#2c2c2a' }
const MUTED_COLOR = '#898781'
const SURFACE_COLORS = { light: '#fcfcfb', dark: '#1a1a19' }
const CURSOR_COLORS = { light: 'rgba(0,0,0,0.03)', dark: 'rgba(255,255,255,0.05)' }

export function BreakdownBarChart({ data, nameKey, valueKey, colorFor }) {
  const { theme } = useTheme()
  const gridColor = GRID_COLORS[theme]
  const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey])

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 40)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={100}
          tick={{ fontSize: 12, fill: MUTED_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: CURSOR_COLORS[theme] }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: `1px solid ${gridColor}`,
            backgroundColor: SURFACE_COLORS[theme],
            color: theme === 'dark' ? '#ffffff' : '#0b0b0b',
          }}
        />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} maxBarSize={22}>
          {sorted.map((entry) => (
            <Cell key={entry[nameKey]} fill={colorFor(entry[nameKey])} />
          ))}
          <LabelList dataKey={valueKey} position="right" style={{ fontSize: 11, fill: MUTED_COLOR }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
