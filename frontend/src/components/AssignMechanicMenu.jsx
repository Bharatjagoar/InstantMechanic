import { useState } from 'react'
import { Search } from 'lucide-react'

export function AssignMechanicMenu({ mechanics, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = mechanics.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      {/* Invisible backdrop — closes the menu on click outside, same pattern as the mobile sidebar drawer */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="absolute left-0 z-50 mt-1 w-56 rounded-lg border p-2 text-left shadow-lg"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div
          className="mb-2 flex items-center gap-2 rounded-md border px-2 py-1.5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)' }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mechanics..."
            className="w-full bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              No mechanics match
            </p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>{m.name}</span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: m.status === 'available' ? 'var(--mechanic-available)' : 'var(--text-muted)' }}
                >
                  {m.status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
