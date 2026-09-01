import { pool } from '../db/pool.js'

// jobs_completed and last_booking are intentionally derived here, not stored columns —
// bookings stays the single source of truth, so these numbers can never drift out of sync.
const MECHANICS_QUERY = `
  SELECT
    m.id, m.name, m.phone, m.specialization, m.status,
    COALESCE(jc.jobs_completed, 0) AS jobs_completed,
    lb.id AS last_booking_id, lb.status AS last_booking_status, lb.scheduled_at AS last_booking_scheduled_at
  FROM mechanics m
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS jobs_completed
    FROM bookings
    WHERE mechanic_id = m.id AND status = 'completed'
  ) jc ON true
  LEFT JOIN LATERAL (
    SELECT id, status, scheduled_at
    FROM bookings
    WHERE mechanic_id = m.id
    ORDER BY scheduled_at DESC
    LIMIT 1
  ) lb ON true
  ORDER BY m.name
`

function mapMechanicRow(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    specialization: r.specialization,
    status: r.status,
    jobsCompleted: Number(r.jobs_completed),
    lastBooking: r.last_booking_id
      ? { id: r.last_booking_id, status: r.last_booking_status, scheduledAt: r.last_booking_scheduled_at }
      : null,
  }
}

export async function listMechanics(req, res) {
  try {
    const result = await pool.query(MECHANICS_QUERY)
    res.json({ data: result.rows.map(mapMechanicRow) })
  } catch (error) {
    console.error('Failed to list mechanics:', error)
    res.status(500).json({ error: 'Failed to list mechanics' })
  }
}
