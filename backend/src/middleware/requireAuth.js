import jwt from 'jsonwebtoken'

// Verifies the bearer token and attaches the decoded payload as req.user.
// Payload shape: { id, role, customerId, mechanicId, name, email }
export function requireAuth(req, res, next) {
  const header = req.header('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured on the server' })
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
