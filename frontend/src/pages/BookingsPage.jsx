import { useCallback, useState } from 'react'
import { Search, ArrowUpDown, Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { getBookings, updateBookingStatus } from '../api/bookings'
import { Pagination } from '../components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { BOOKING_STATUS_META, formatCurrency, formatDate } from '../lib/status'

const STATUS_OPTIONS = ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled']

const COLUMNS = [
  { key: 'id', label: 'Booking ID', sortable: true },
  { key: 'customer', label: 'Customer' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'service', label: 'Service' },
  { key: 'mechanic', label: 'Mechanic' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'scheduled_at', label: 'Date/Time', sortable: true },
]

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('scheduled_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [updatingIds, setUpdatingIds] = useState(() => new Set())

  const debouncedSearch = useDebouncedValue(search)

  const { data, loading, error, reload, setData } = useApi(
    () => getBookings({ search: debouncedSearch, status, page, limit: 15, sortBy, sortOrder }),
    [debouncedSearch, status, page, sortBy, sortOrder]
  )

  // Patches a matching row in place when ANY client changes a booking's status —
  // satisfies "reflect the change without a full page reload."
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

  function toggleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  async function handleStatusChange(bookingId, newStatus) {
    setUpdatingIds((prev) => new Set(prev).add(bookingId))
    try {
      const updated = await updateBookingStatus(bookingId, newStatus)
      handleBookingUpdated(updated)
    } catch (err) {
      console.error('Failed to update booking status:', err.message)
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
          Bookings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Search, filter, and track every service booking. Status changes here are broadcast live to every open dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by customer or license plate..."
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)' }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        {loading ? (
          <LoadingState label="Loading bookings..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState message="No bookings match your filters" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {col.sortable ? (
                          <button className="flex items-center gap-1" onClick={() => toggleSort(col.key)}>
                            {col.label}
                            <ArrowUpDown size={12} />
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((booking) => {
                    const meta = BOOKING_STATUS_META[booking.status]
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
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {booking.mechanic ? booking.mechanic.name : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={booking.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              className="rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none disabled:opacity-60"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                                color: meta.color,
                              }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {BOOKING_STATUS_META[s].label}
                                </option>
                              ))}
                            </select>
                            {isUpdating && <Loader2 size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(booking.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(booking.scheduledAt)}
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
