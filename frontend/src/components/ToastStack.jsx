import { useCallback, useState } from 'react'
import { Radio } from 'lucide-react'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { BOOKING_STATUS_META } from '../lib/status'

let idCounter = 0

export function ToastStack() {
  const [toasts, setToasts] = useState([])

  const handleBookingUpdated = useCallback((booking) => {
    const id = ++idCounter
    const label = BOOKING_STATUS_META[booking.status]?.label || booking.status
    setToasts((prev) => [...prev, { id, message: `Booking #${booking.id} → ${label}` }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  useSocketEvent('booking:updated', handleBookingUpdated)

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <Radio size={15} style={{ color: 'var(--series-bookings)' }} />
          {toast.message}
        </div>
      ))}
    </div>
  )
}
