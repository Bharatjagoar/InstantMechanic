import { Loader2, AlertTriangle, Inbox } from 'lucide-react'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
      <Loader2 className="animate-spin" size={22} />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16" style={{ color: 'var(--status-cancelled)' }}>
      <AlertTriangle size={22} />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-lg border px-3 py-1.5 text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Nothing to show here yet' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
      <Inbox size={22} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
