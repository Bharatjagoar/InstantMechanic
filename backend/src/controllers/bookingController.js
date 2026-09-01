import { pool } from '../db/pool.js'
import { getIO } from '../realtime/io.js'
import { BOOKING_STATUSES } from '../data/seedSource.js'

// Which status a mechanic may move their own assigned booking to next.
// Mechanics can only move forward; ops can set any status.
const MECHANIC_ALLOWED_TRANSITIONS = {
  assigned: ['on_the_way'],
  on_the_way: ['completed'],
}

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

    // Force-scope by role, regardless of what was asked for in the query string —
    // this is what makes GET /bookings double as "my bookings" / "my jobs".
    if (req.user.role === 'customer') {
      params.push(req.user.customerId)
      conditions.push(`b.customer_id = $${params.length}`)
    } else if (req.user.role === 'mechanic') {
      params.push(req.user.mechanicId)
      conditions.push(`b.mechanic_id = $${params.length}`)
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

    const booking = mapBookingRow(result.rows[0])

    if (req.user.role === 'customer' && booking.customer.id !== req.user.customerId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (req.user.role === 'mechanic' && booking.mechanic?.id !== req.user.mechanicId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json(booking)
  } catch (error) {
    console.error('Failed to get booking:', error)
    res.status(500).json({ error: 'Failed to get booking' })
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${BOOKING_STATUSES.join(', ')}` })
    }

    // Customers never change booking status directly; only ops and the assigned
    // mechanic do, and the mechanic only within the allowed forward transitions.
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const current = await pool.query('SELECT status, mechanic_id FROM bookings WHERE id = $1', [req.params.id])
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    const { status: currentStatus, mechanic_id: currentMechanicId } = current.rows[0]

    if (req.user.role === 'mechanic') {
      if (currentMechanicId !== req.user.mechanicId) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      const allowed = MECHANIC_ALLOWED_TRANSITIONS[currentStatus] || []
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `A mechanic can only move a booking from "${currentStatus}" to: ${allowed.join(', ') || 'nothing further'}` })
      }
    }

    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id])

    // Free up the mechanic once their job is done, so they re-enter the available pool.
    if (currentMechanicId && (status === 'completed' || status === 'cancelled')) {
      await pool.query("UPDATE mechanics SET status = 'available' WHERE id = $1", [currentMechanicId])
    }

    const result = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id])
    const booking = mapBookingRow(result.rows[0])

    getIO().emit('booking:updated', booking)

    res.json(booking)
  } catch (error) {
    console.error('Failed to update booking status:', error)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
}

export async function createBooking(req, res) {
  const client = await pool.connect()
  try {
    const { vehicleId, serviceId, scheduledAt } = req.body

    if (!vehicleId || !serviceId || !scheduledAt) {
      return res.status(400).json({ error: 'vehicleId, serviceId, and scheduledAt are required' })
    }

    const vehicleResult = await client.query('SELECT id FROM vehicles WHERE id = $1 AND customer_id = $2', [
      vehicleId,
      req.user.customerId,
    ])
    if (vehicleResult.rows.length === 0) {
      return res.status(403).json({ error: 'That vehicle does not belong to you' })
    }

    const serviceResult = await client.query('SELECT base_price FROM services WHERE id = $1', [serviceId])
    if (serviceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Service not found' })
    }
    const amount = serviceResult.rows[0].base_price

    await client.query('BEGIN')

    // Auto-assign: grab one available mechanic if there is one, right now, atomically —
    // FOR UPDATE SKIP LOCKED means two simultaneous bookings can never grab the same mechanic.
    const mechanicResult = await client.query(
      "SELECT id FROM mechanics WHERE status = 'available' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED"
    )
    const mechanic = mechanicResult.rows[0]

    const insertResult = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, service_id, mechanic_id, status, amount, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        req.user.customerId,
        vehicleId,
        serviceId,
        mechanic ? mechanic.id : null,
        mechanic ? 'assigned' : 'pending',
        amount,
        scheduledAt,
      ]
    )

    if (mechanic) {
      await client.query("UPDATE mechanics SET status = 'busy' WHERE id = $1", [mechanic.id])
    }

    await client.query('COMMIT')

    const result = await client.query(`${BOOKING_SELECT} WHERE b.id = $1`, [insertResult.rows[0].id])
    const booking = mapBookingRow(result.rows[0])

    getIO().emit('booking:created', booking)

    res.status(201).json(booking)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to create booking:', error)
    res.status(500).json({ error: 'Failed to create booking' })
  } finally {
    client.release()
  }
}

export async function assignMechanic(req, res) {
  try {
    const { mechanicId } = req.body

    if (!mechanicId) {
      return res.status(400).json({ error: 'mechanicId is required' })
    }

    // Fallback path only — used when a booking is stuck at "pending" because no
    // mechanic was available at creation time. WHERE status = 'pending' guards
    // against double-assigning a booking that's already been handled.
    const updateResult = await pool.query(
      "UPDATE bookings SET mechanic_id = $1, status = 'assigned' WHERE id = $2 AND status = 'pending' RETURNING id",
      [mechanicId, req.params.id]
    )

    if (updateResult.rows.length === 0) {
      return res.status(409).json({ error: 'Booking not found or not pending' })
    }

    await pool.query("UPDATE mechanics SET status = 'busy' WHERE id = $1", [mechanicId])

    const result = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id])
    const booking = mapBookingRow(result.rows[0])

    getIO().emit('booking:updated', booking)

    res.json(booking)
  } catch (error) {
    console.error('Failed to assign mechanic:', error)
    res.status(500).json({ error: 'Failed to assign mechanic' })
  }
}
