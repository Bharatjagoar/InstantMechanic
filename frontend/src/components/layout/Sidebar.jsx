import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, Wrench, Users, Car, X, LogOut } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS_BY_ROLE = {
  ops: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/bookings', label: 'Bookings', icon: CalendarClock },
    { to: '/mechanics', label: 'Mechanics', icon: Wrench },
    { to: '/customers', label: 'Customers', icon: Users },
  ],
  customer: [
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarClock, end: true },
    { to: '/book', label: 'Book a Service', icon: Wrench },
  ],
  mechanic: [{ to: '/my-jobs', label: 'My Jobs', icon: CalendarClock, end: true }],
}

const ROLE_SUBTITLE = { ops: 'Operations', customer: 'Customer', mechanic: 'Mechanic' }

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = NAV_ITEMS_BY_ROLE[user?.role] ?? []

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

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
                {ROLE_SUBTITLE[user?.role] ?? 'Operations'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden" style={{ color: 'var(--text-muted)' }} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
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

        <div className="mt-auto flex flex-col gap-2 px-3 pb-5">
          <div className="flex items-center justify-between rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ROLE_SUBTITLE[user?.role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-2"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
