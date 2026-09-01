import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, Wrench, Users, Car, X } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock },
  { to: '/mechanics', label: 'Mechanics', icon: Wrench },
  { to: '/customers', label: 'Customers', icon: Users },
]

export function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop — mobile only, closes the drawer on tap outside */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: 'var(--series-bookings)' }}
            >
              <Car size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Instant Mechanic
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Operations
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden" style={{ color: 'var(--text-muted)' }} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'color-mix(in srgb, var(--series-bookings) 12%, transparent)' : 'transparent',
                color: isActive ? 'var(--series-bookings)' : 'var(--text-secondary)',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 pb-5">
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
