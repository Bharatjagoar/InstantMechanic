import { useCallback, useState } from 'react'
import { Radio } from 'lucide-react'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useAuth } from '../context/AuthContext'
import { BOOKING_STATUS_META } from '../lib/status'

let idCounter = 0

// Every socket event is broadcast to all connected clients regardless of role, so
// this filters to only the bookings actually relevant to the logged-in user — a
// customer/mechanic shouldn't get a popup about someone else's booking.
function isRelevantToUser(booking, user) {
  if (!user) return false
  if (user.role === 'ops') return true
  if (user.role === 'customer') return booking.customer.id === user.customerId
  if (user.role === 'mechanic') return booking.mechanic?.id === user.mechanicId
  return false
}

export function ToastStack() {
  const [toasts, setToasts] = useState([])
  const { user } = useAuth()

  const pushToast = useCallback((message) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const handleBookingUpdated = useCallback(
    (booking) => {
      if (!isRelevantToUser(booking, user)) return
      const label = BOOKING_STATUS_META[booking.status]?.label || booking.status
      pushToast(`Booking #${booking.id} → ${label}`)
    },
    [user, pushToast]
  )

  // New-booking notifications go to ops only — the mechanic auto-assigned to it
  // (if any) finds out by seeing the job appear in "My Jobs", not via a popup.
  const handleBookingCreated = useCallback(
    (booking) => {
      if (user?.role !== 'ops') return
      pushToast(`New booking #${booking.id} from ${booking.customer.name}`)
    },
    [user, pushToast]
  )

  useSocketEvent('booking:updated', handleBookingUpdated)
  useSocketEvent('booking:created', handleBookingCreated)

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
