import { pool } from '../db/pool.js'

export async function listCustomers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const offset = (page - 1) * limit

    const conditions = []
    const params = []

    if (req.query.search) {
      params.push(`%${req.query.search}%`)
      conditions.push(`(c.name ILIKE $${params.length} OR c.email ILIKE $${params.length})`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countResult = await pool.query(`SELECT COUNT(*) FROM customers c ${whereClause}`, params)
    const total = Number(countResult.rows[0].count)

    params.push(limit, offset)
    const dataResult = await pool.query(
      `
      SELECT
        c.id, c.name, c.email, c.phone, c.created_at,
        COUNT(DISTINCT v.id) AS vehicle_count,
        COUNT(b.id) AS total_bookings
      FROM customers c
      LEFT JOIN vehicles v ON v.customer_id = c.id
      LEFT JOIN bookings b ON b.customer_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    )

    res.json({
      data: dataResult.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        createdAt: r.created_at,
        vehicleCount: Number(r.vehicle_count),
        totalBookings: Number(r.total_bookings),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to list customers:', error)
    res.status(500).json({ error: 'Failed to list customers' })
  }
}
