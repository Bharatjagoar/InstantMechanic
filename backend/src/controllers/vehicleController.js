import { pool } from '../db/pool.js'

function mapVehicleRow(r) {
  return {
    id: r.id,
    make: r.make,
    model: r.model,
    year: r.year,
    licensePlate: r.license_plate,
  }
}

export async function listMyVehicles(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, make, model, year, license_plate FROM vehicles WHERE customer_id = $1 ORDER BY id',
      [req.user.customerId]
    )
    res.json({ data: result.rows.map(mapVehicleRow) })
  } catch (error) {
    console.error('Failed to list vehicles:', error)
    res.status(500).json({ error: 'Failed to list vehicles' })
  }
}
