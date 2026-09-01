export const BOOKING_STATUS_META = {
  pending: { label: 'Pending', color: 'var(--status-pending)' },
  assigned: { label: 'Assigned', color: 'var(--status-assigned)' },
  on_the_way: { label: 'On The Way', color: 'var(--status-on_the_way)' },
  completed: { label: 'Completed', color: 'var(--status-completed)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-cancelled)' },
}

// Plain hex mirror of the CSS custom properties above — SVG fills (recharts) need a
// literal color value, not a var() reference, so light/dark steps are duplicated here.
export const BOOKING_STATUS_HEX = {
  light: {
    pending: '#eda100',
    assigned: '#2a78d6',
    on_the_way: '#4a3aa7',
    completed: '#008300',
    cancelled: '#e34948',
  },
  dark: {
    pending: '#c98500',
    assigned: '#3987e5',
    on_the_way: '#9085e9',
    completed: '#008300',
    cancelled: '#e66767',
  },
}

export const MECHANIC_STATUS_META = {
  available: { label: 'Available', color: 'var(--mechanic-available)' },
  busy: { label: 'Busy', color: 'var(--mechanic-busy)' },
  offline: { label: 'Offline', color: 'var(--mechanic-offline)' },
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  )
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
