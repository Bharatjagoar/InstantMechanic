import { useState } from 'react'
import { Search } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { apiGet } from '../api/client'
import { Pagination } from '../components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { formatDate } from '../lib/status'

const getCustomers = (params) => apiGet('/api/customers', params)

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, loading, error, reload } = useApi(
    () => getCustomers({ search: debouncedSearch, page, limit: 15 }),
    [debouncedSearch, page]
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Customers
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Everyone who has booked a service with Instant Mechanic.
        </p>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2 sm:w-96"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}
      >
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name or email..."
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        {loading ? (
          <LoadingState label="Loading customers..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState message="No customers match your search" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Name', 'Email', 'Phone', 'Vehicles', 'Bookings', 'Joined'].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {customer.name}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {customer.email}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {customer.vehicleCount}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {customer.totalBookings}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(customer.createdAt)}
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
