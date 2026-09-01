import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'

function mapUserRow(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    customerId: r.customer_id,
    mechanicId: r.mechanic_id,
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const row = result.rows[0]

    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = mapUserRow(row)
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '12h' })

    res.json({ token, user })
  } catch (error) {
    console.error('Failed to log in:', error)
    res.status(500).json({ error: 'Failed to log in' })
  }
}

export async function me(req, res) {
  res.json({ user: req.user })
}

export async function register(req, res) {
  const client = await pool.connect()
  try {
    const { name, email, phone, password, vehicle } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'name, email, phone, and password are required' })
    }
    if (!vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate) {
      return res.status(400).json({ error: 'vehicle make, model, and licensePlate are required' })
    }

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    await client.query('BEGIN')

    const customerResult = await client.query(
      'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
      [name, email, phone]
    )
    const customerId = customerResult.rows[0].id

    await client.query(
      'INSERT INTO vehicles (customer_id, make, model, year, license_plate) VALUES ($1, $2, $3, $4, $5)',
      [customerId, vehicle.make, vehicle.model, vehicle.year || null, vehicle.licensePlate]
    )

    const passwordHash = await bcrypt.hash(password, 10)
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role, customer_id)
       VALUES ($1, $2, $3, 'customer', $4)
       RETURNING id, name, email, role, customer_id, mechanic_id`,
      [name, email, passwordHash, customerId]
    )

    await client.query('COMMIT')

    const user = mapUserRow(userResult.rows[0])
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '12h' })

    res.status(201).json({ token, user })
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }
    console.error('Failed to register:', error)
    res.status(500).json({ error: 'Failed to register' })
  } finally {
    client.release()
  }
}
