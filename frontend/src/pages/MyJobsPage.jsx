import { useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { getBookings, updateBookingStatus } from '../api/bookings'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { BOOKING_STATUS_META, formatCurrency, formatDate } from '../lib/status'

// Mirrors the backend's MECHANIC_ALLOWED_TRANSITIONS — the server is the real
// enforcement, this just keeps the dropdown from offering an option that would 400.
const NEXT_STATUS = {
  assigned: 'on_the_way',
  on_the_way: 'completed',
}

export default function MyJobsPage() {
  const [page, setPage] = useState(1)
  const [updatingIds, setUpdatingIds] = useState(() => new Set())

  const { data, loading, error, reload, setData } = useApi(
    () => getBookings({ page, limit: 15, sortBy: 'scheduled_at', sortOrder: 'desc' }),
    [page]
  )

  const handleBookingUpdated = useCallback(
    (updatedBooking) => {
      setData((prev) => {
        if (!prev) return prev
        const exists = prev.data.some((b) => b.id === updatedBooking.id)
        if (!exists) return prev
        return { ...prev, data: prev.data.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)) }
      })
    },
    [setData]
  )
  useSocketEvent('booking:updated', handleBookingUpdated)
  useSocketEvent('booking:created', reload)

  async function handleAdvance(bookingId, nextStatus) {
    setUpdatingIds((prev) => new Set(prev).add(bookingId))
    try {
      const updated = await updateBookingStatus(bookingId, nextStatus)
      handleBookingUpdated(updated)
    } catch (err) {
      console.error('Failed to update job status:', err.message)
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(bookingId)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          My Jobs
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Jobs assigned to you. Move each one forward as you go.
        </p>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        {loading ? (
          <LoadingState label="Loading your jobs..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState message="No jobs assigned to you right now" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Booking ID', 'Customer', 'Vehicle', 'Service', 'Status', 'Amount', 'Date/Time', ''].map((label) => (
                      <th
                        key={label}
                        className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((booking) => {
                    const nextStatus = NEXT_STATUS[booking.status]
                    const isUpdating = updatingIds.has(booking.id)

                    return (
                      <tr key={booking.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          #{booking.id}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {booking.customer.name}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {booking.vehicle.make} {booking.vehicle.model}
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {booking.vehicle.licensePlate}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {booking.service.name}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge meta={BOOKING_STATUS_META} status={booking.status} />
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(booking.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(booking.scheduledAt)}
                        </td>
                        <td className="px-4 py-3">
                          {nextStatus ? (
                            <button
                              onClick={() => handleAdvance(booking.id, nextStatus)}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                              style={{ borderColor: 'var(--border)', color: 'var(--series-bookings)' }}
                            >
                              {isUpdating && <Loader2 size={12} className="animate-spin" />}
                              Mark {BOOKING_STATUS_META[nextStatus].label}
                            </button>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3">
              <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
