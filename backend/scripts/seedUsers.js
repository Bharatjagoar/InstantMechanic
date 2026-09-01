// Seeds demo login accounts (3 customers, 3 mechanics, 1 ops) against whatever
// customers/mechanics already exist in the database. Never touches TRUNCATE — safe
// to run alongside the main seed data, and safe to re-run (ON CONFLICT DO NOTHING).
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { pool } from '../src/db/pool.js'

const DEMO_PASSWORD = 'password123'

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  const { rows: customers } = await pool.query('SELECT id, name, email FROM customers ORDER BY id LIMIT 3')
  const { rows: mechanics } = await pool.query('SELECT id, name FROM mechanics ORDER BY id LIMIT 3')

  for (const c of customers) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, customer_id)
       VALUES ($1, $2, $3, 'customer', $4)
       ON CONFLICT (email) DO NOTHING`,
      [c.name, c.email, passwordHash, c.id]
    )
  }

  for (const [i, m] of mechanics.entries()) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, mechanic_id)
       VALUES ($1, $2, $3, 'mechanic', $4)
       ON CONFLICT (email) DO NOTHING`,
      [m.name, `mechanic${i + 1}@instantmechanic.demo`, passwordHash, m.id]
    )
  }

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Ops Admin', 'ops@instantmechanic.demo', $1, 'ops')
     ON CONFLICT (email) DO NOTHING`,
    [passwordHash]
  )

  const { rows: seeded } = await pool.query('SELECT email, role FROM users ORDER BY role, email')
  console.log(`Seeded/confirmed ${seeded.length} demo users. Password for all: ${DEMO_PASSWORD}`)
  seeded.forEach((u) => console.log(`  ${u.role.padEnd(9)} ${u.email}`))

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
