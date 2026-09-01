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
