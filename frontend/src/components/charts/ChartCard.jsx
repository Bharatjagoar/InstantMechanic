export function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
