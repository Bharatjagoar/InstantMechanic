import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, Wrench, Users, Car } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock },
  { to: '/mechanics', label: 'Mechanics', icon: Wrench },
  { to: '/customers', label: 'Customers', icon: Users },
]

export function Sidebar() {
  return (
    <aside
      className="hidden w-60 shrink-0 border-r md:flex md:flex-col"
      style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 px-5 py-5">
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

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
    </aside>
  )
}
