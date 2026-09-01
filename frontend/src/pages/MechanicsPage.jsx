import { useApi } from '../hooks/useApi'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { getMechanics } from '../api/mechanics'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { MECHANIC_STATUS_META, BOOKING_STATUS_META, formatDate } from '../lib/status'

export default function MechanicsPage() {
  const { data, loading, error, reload } = useApi(getMechanics, [])

  // Jobs-completed / last-booking are derived from bookings — refetch on any status
  // change so they never drift from the source of truth. A new booking can also
  // auto-assign a mechanic (flipping them to busy), so refetch on creation too.
  useSocketEvent('booking:updated', reload)
  useSocketEvent('booking:created', reload)

  if (loading) return <LoadingState label="Loading mechanics..." />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (data.data.length === 0) return <EmptyState message="No mechanics found" />

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mechanics
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Current status and workload across the team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((mechanic) => (
          <div
            key={mechanic.id}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {mechanic.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {mechanic.specialization}
                </p>
              </div>
              <StatusBadge meta={MECHANIC_STATUS_META} status={mechanic.status} />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Jobs completed</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {mechanic.jobsCompleted}
              </span>
            </div>

            <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {mechanic.lastBooking ? 'Last booking' : 'No bookings yet'}
              </p>
              {mechanic.lastBooking && (
                <div className="mt-1 flex items-center justify-between">
                  <StatusBadge meta={BOOKING_STATUS_META} status={mechanic.lastBooking.status} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(mechanic.lastBooking.scheduledAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
