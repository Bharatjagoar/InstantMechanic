import { pool } from '../db/pool.js'

// Whitelisted so the sort column can never come directly from user input (SQL injection guard).
const SORT_COLUMNS = {
  scheduled_at: 'b.scheduled_at',
  amount: 'b.amount',
  status: 'b.status',
  created_at: 'b.created_at',
  id: 'b.id',
}

const BOOKING_SELECT = `
  SELECT
    b.id, b.status, b.amount, b.scheduled_at, b.created_at, b.updated_at,
    c.id AS customer_id, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
    v.id AS vehicle_id, v.make AS vehicle_make, v.model AS vehicle_model, v.license_plate,
    s.id AS service_id, s.name AS service_name, s.category AS service_category,
    m.id AS mechanic_id, m.name AS mechanic_name
  FROM bookings b
  JOIN customers c ON c.id = b.customer_id
  JOIN vehicles v ON v.id = b.vehicle_id
  JOIN services s ON s.id = b.service_id
  LEFT JOIN mechanics m ON m.id = b.mechanic_id
`

function mapBookingRow(r) {
  return {
    id: r.id,
    status: r.status,
    amount: Number(r.amount),
    scheduledAt: r.scheduled_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    customer: { id: r.customer_id, name: r.customer_name, phone: r.customer_phone, email: r.customer_email },
    vehicle: { id: r.vehicle_id, make: r.vehicle_make, model: r.vehicle_model, licensePlate: r.license_plate },
    service: { id: r.service_id, name: r.service_name, category: r.service_category },
    mechanic: r.mechanic_id ? { id: r.mechanic_id, name: r.mechanic_name } : null,
  }
}

export async function listBookings(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const offset = (page - 1) * limit

    const sortBy = SORT_COLUMNS[req.query.sortBy] || SORT_COLUMNS.scheduled_at
    const sortOrder = req.query.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    const conditions = []
    const params = []

    if (req.query.status) {
      const statuses = req.query.status.split(',').map((s) => s.trim())
      params.push(statuses)
      conditions.push(`b.status = ANY($${params.length})`)
    }

    if (req.query.mechanicId) {
      params.push(req.query.mechanicId)
      conditions.push(`b.mechanic_id = $${params.length}`)
    }

    if (req.query.dateFrom) {
      params.push(req.query.dateFrom)
      conditions.push(`b.scheduled_at >= $${params.length}`)
    }

    if (req.query.dateTo) {
      params.push(req.query.dateTo)
      conditions.push(`b.scheduled_at <= $${params.length}`)
    }

    if (req.query.search) {
      const term = `%${req.query.search}%`
      params.push(term)
      const searchParamIndex = params.length
      const searchConditions = [`c.name ILIKE $${searchParamIndex}`, `v.license_plate ILIKE $${searchParamIndex}`]

      if (/^\d+$/.test(req.query.search)) {
        params.push(Number(req.query.search))
        searchConditions.push(`b.id = $${params.length}`)
      }

      conditions.push(`(${searchConditions.join(' OR ')})`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN vehicles v ON v.id = b.vehicle_id
       ${whereClause}`,
      params
    )
    const total = Number(countResult.rows[0].count)

    params.push(limit, offset)
    const dataResult = await pool.query(
      `${BOOKING_SELECT} ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    res.json({
      data: dataResult.rows.map(mapBookingRow),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to list bookings:', error)
    res.status(500).json({ error: 'Failed to list bookings' })
  }
}

export async function getBookingById(req, res) {
  try {
    const result = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    res.json(mapBookingRow(result.rows[0]))
  } catch (error) {
    console.error('Failed to get booking:', error)
    res.status(500).json({ error: 'Failed to get booking' })
  }
}
