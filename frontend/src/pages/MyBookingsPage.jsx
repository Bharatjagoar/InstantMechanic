import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { getBookings } from '../api/bookings'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { BOOKING_STATUS_META, formatCurrency, formatDate } from '../lib/status'

export default function MyBookingsPage() {
  const [page, setPage] = useState(1)

  const { data, loading, error, reload } = useApi(
    () => getBookings({ page, limit: 15, sortBy: 'scheduled_at', sortOrder: 'desc' }),
    [page]
  )

  useSocketEvent('booking:updated', reload)
  useSocketEvent('booking:created', reload)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            My Bookings
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Every service you've booked, updated live as it moves along.
          </p>
        </div>
        <Link
          to="/book"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--series-bookings)' }}
        >
          Book a Service
        </Link>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        {loading ? (
          <LoadingState label="Loading your bookings..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState message="You haven't booked a service yet" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Booking ID', 'Vehicle', 'Service', 'Mechanic', 'Status', 'Amount', 'Date/Time'].map((label) => (
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
                  {data.data.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        #{booking.id}
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
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {booking.mechanic ? booking.mechanic.name : 'Awaiting a free mechanic'}
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
                    </tr>
                  ))}
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
