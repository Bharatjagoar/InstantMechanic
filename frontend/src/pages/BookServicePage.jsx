import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getMyVehicles } from '../api/vehicles'
import { getServices } from '../api/services'
import { createBooking } from '../api/bookings'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { formatCurrency } from '../lib/status'

export default function BookServicePage() {
  const navigate = useNavigate()
  const { data: vehicles, loading: vehiclesLoading, error: vehiclesError } = useApi(getMyVehicles, [])
  const { data: services, loading: servicesLoading, error: servicesError } = useApi(getServices, [])

  const [vehicleId, setVehicleId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vehicles?.data.length && !vehicleId) setVehicleId(String(vehicles.data[0].id))
  }, [vehicles, vehicleId])

  useEffect(() => {
    if (services?.data.length && !serviceId) setServiceId(String(services.data[0].id))
  }, [services, serviceId])

  const loading = vehiclesLoading || servicesLoading
  const loadError = vehiclesError || servicesError

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createBooking({
        vehicleId: Number(vehicleId),
        serviceId: Number(serviceId),
        scheduledAt: new Date(scheduledAt).toISOString(),
      })
      navigate('/my-bookings')
    } catch (err) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading..." />
  if (loadError) return <ErrorState message={loadError} />
  if (!vehicles.data.length) {
    return <EmptyState message="No vehicles on file for your account — contact ops to add one." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Book a Service
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          If a mechanic is free right now, they're assigned to you immediately.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-md flex-col gap-4 rounded-xl border p-5"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Vehicle
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)', color: 'var(--text-primary)' }}
          >
            {vehicles.data.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} &middot; {v.licensePlate}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Service
          </label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)', color: 'var(--text-primary)' }}
          >
            {services.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category}) &middot; {formatCurrency(s.basePrice)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Preferred date &amp; time
          </label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)', color: 'var(--text-primary)' }}
          />
        </div>

        {error && (
          <p className="text-xs" style={{ color: 'var(--status-cancelled)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--series-bookings)' }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Book Service
        </button>
      </form>
    </div>
  )
}
