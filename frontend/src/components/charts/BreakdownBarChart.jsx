import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { ResponsiveContainer } from 'recharts'

const GRID_COLOR = '#e1e0d9'
const MUTED_COLOR = '#898781'

export function BreakdownBarChart({ data, nameKey, valueKey, colorFor }) {
  const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey])

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 40)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
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
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e1e0d9' }}
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
