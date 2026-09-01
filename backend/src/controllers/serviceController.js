import { pool } from '../db/pool.js'

function mapServiceRow(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    basePrice: Number(r.base_price),
  }
}

export async function listServices(req, res) {
  try {
    const result = await pool.query('SELECT id, name, category, base_price FROM services ORDER BY name')
    res.json({ data: result.rows.map(mapServiceRow) })
  } catch (error) {
    console.error('Failed to list services:', error)
    res.status(500).json({ error: 'Failed to list services' })
  }
}
