import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Loader2, Eye, EyeOff } from 'lucide-react'
import { register as registerRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../lib/roles'

const inputStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--page-plane)',
  color: 'var(--text-primary)',
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { token, user } = await registerRequest({
        name,
        email,
        phone,
        password,
        vehicle: { make, model, year: year ? Number(year) : undefined, licensePlate },
      })
      login(user, token)
      navigate(ROLE_HOME[user.role] ?? '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to register')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--page-plane)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: 'var(--series-bookings)' }}
          >
            <Car size={20} />
          </span>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Instant Mechanic
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-xl border p-5"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Full name
            </label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Phone
            </label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="flex items-center rounded-lg border px-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2 text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 p-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mt-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
            <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Your vehicle
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Make" required value={make} onChange={(e) => setMake(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
              <input placeholder="Model" required value={model} onChange={(e) => setModel(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
              <input placeholder="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
              <input
                placeholder="License plate"
                required
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--status-cancelled)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--series-bookings)' }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Create account
          </button>
        </form>

        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--series-bookings)' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
