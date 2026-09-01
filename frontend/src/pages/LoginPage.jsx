import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Loader2, Eye, EyeOff } from 'lucide-react'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../lib/roles'

const DEMO_ACCOUNTS = [
  { role: 'Ops', email: 'ops@instantmechanic.demo' },
  { role: 'Mechanic', email: 'mechanic1@instantmechanic.demo' },
  { role: 'Customer', email: 'emma_bartell@yahoo.com' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { token, user } = await loginRequest(email, password)
      login(user, token)
      navigate(ROLE_HOME[user.role] ?? '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to log in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--page-plane)' }}>
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
            Log in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-xl border p-5"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div
              className="flex items-center rounded-lg border px-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--page-plane)' }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                required
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
            Log in
          </button>
        </form>

        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Demo accounts (password: password123)
          </p>
          <div className="flex flex-col gap-1">
            {DEMO_ACCOUNTS.map((a) => (
              <div key={a.email} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{a.role}</span>
                <span>{a.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
