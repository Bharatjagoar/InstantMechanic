import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Car } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--page-plane)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b px-4 py-3 md:hidden"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-secondary)' }} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: 'var(--series-bookings)' }}
          >
            <Car size={15} />
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Instant Mechanic
          </span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
