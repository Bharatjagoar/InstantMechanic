import { CalendarDays, CheckCircle2, Clock, XCircle, IndianRupee, Wrench, UserPlus, ListChecks } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getDashboard } from '../api/dashboard'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/charts/ChartCard'
import { TrendChart } from '../components/charts/TrendChart'
import { BreakdownBarChart } from '../components/charts/BreakdownBarChart'
import { LoadingState, ErrorState } from '../components/StateViews'
import { BOOKING_STATUS_HEX, BOOKING_STATUS_META, formatCurrency } from '../lib/status'
import { colorForCategory } from '../lib/categories'

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi(getDashboard, [])

  if (loading) return <LoadingState label="Loading dashboard..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const { overview, charts } = data

  const statusData = charts.statusBreakdown.map((s) => ({
    status: BOOKING_STATUS_META[s.status]?.label || s.status,
    key: s.status,
    count: s.count,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Operations Overview
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Live snapshot of bookings, mechanics, and revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Bookings" value={overview.totalBookings} icon={ListChecks} accent="var(--series-bookings)" />
        <StatCard label="Today's Bookings" value={overview.todayBookings} icon={CalendarDays} accent="var(--status-assigned)" />
        <StatCard label="Completed" value={overview.completedBookings} icon={CheckCircle2} accent="var(--status-completed)" />
        <StatCard label="Pending" value={overview.pendingBookings} icon={Clock} accent="var(--status-pending)" />
        <StatCard label="Cancelled" value={overview.cancelledBookings} icon={XCircle} accent="var(--status-cancelled)" />
        <StatCard label="Total Revenue" value={formatCurrency(overview.totalRevenue)} icon={IndianRupee} accent="var(--series-revenue)" />
        <StatCard label="Active Mechanics" value={overview.activeMechanics} icon={Wrench} accent="var(--mechanic-available)" />
        <StatCard label="New Customers" value={overview.newCustomers} icon={UserPlus} accent="var(--status-on_the_way)" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Bookings Over Time (30 days)">
          <TrendChart data={charts.bookingsOverTime} dataKey="count" color="#2a78d6" />
        </ChartCard>
        <ChartCard title="Revenue Over Time (30 days)">
          <TrendChart data={charts.revenueOverTime} dataKey="revenue" color="#eb6834" valueFormatter={formatCurrency} />
        </ChartCard>
        <ChartCard title="Booking Status">
          <BreakdownBarChart
            data={statusData}
            nameKey="status"
            valueKey="count"
            colorFor={(label) => {
              const entry = statusData.find((s) => s.status === label)
              return BOOKING_STATUS_HEX[entry?.key] || '#898781'
            }}
          />
        </ChartCard>
        <ChartCard title="Service Category Breakdown">
          <BreakdownBarChart
            data={charts.categoryBreakdown}
            nameKey="category"
            valueKey="count"
            colorFor={colorForCategory}
          />
        </ChartCard>
      </div>
    </div>
  )
}
