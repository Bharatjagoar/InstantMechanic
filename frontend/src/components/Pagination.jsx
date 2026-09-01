import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: 'var(--border)' }}>
      <span style={{ color: 'var(--text-muted)' }}>
        Page {page} of {totalPages} &middot; {total} total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center justify-center rounded-lg border p-1.5 disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center justify-center rounded-lg border p-1.5 disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
