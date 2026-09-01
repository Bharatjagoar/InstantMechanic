// Guards destructive/admin-only routes (like re-seeding) from being publicly callable
// once the backend is deployed. Not full auth — just enough to stop anyone with the URL
// from wiping the database.
export function requireSeedKey(req, res, next) {
  const providedKey = req.header('x-seed-key')

  if (!process.env.SEED_SECRET) {
    return res.status(500).json({ error: 'SEED_SECRET is not configured on the server' })
  }

  if (providedKey !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
