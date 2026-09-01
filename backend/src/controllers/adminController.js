import { faker } from '@faker-js/faker'
import { pool } from '../db/pool.js'
import { bulkInsert } from '../db/bulkInsert.js'
import { randomInt, pickOne, pickWeighted, randomDateBetween } from '../utils/random.js'
import {
  SERVICES,
  VEHICLE_MODELS,
  MECHANIC_SPECIALIZATIONS,
  BOOKING_STATUS_WEIGHTS,
  MECHANIC_STATUS_WEIGHTS,
} from '../data/seedSource.js'

const CUSTOMER_COUNT = 60
const MECHANIC_COUNT = 22
const BOOKING_COUNT = 550
const HISTORY_DAYS = 90

function licensePlate() {
  const stateCodes = ['DL', 'HR', 'UP', 'MH', 'KA', 'RJ']
  const state = pickOne(stateCodes)
  const rtoCode = randomInt(1, 99).toString().padStart(2, '0')
  const letters = faker.string.alpha({ length: 2, casing: 'upper' })
  const digits = randomInt(1000, 9999)
  return `${state}${rtoCode}${letters}${digits}`
}

export async function seedDatabase(req, res) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Wipe existing data so the endpoint is safely re-runnable during development.
    await client.query('TRUNCATE bookings, vehicles, customers, mechanics, services RESTART IDENTITY CASCADE')

    // --- Services (fixed reference list) ---
    const serviceIds = await bulkInsert(
      client,
      'services',
      ['name', 'category', 'base_price'],
      SERVICES.map((s) => [s.name, s.category, s.base_price])
    )

    // --- Mechanics ---
    const mechanicRows = Array.from({ length: MECHANIC_COUNT }, () => [
      faker.person.fullName(),
      faker.phone.number({ style: 'international' }),
      pickOne(MECHANIC_SPECIALIZATIONS),
      pickWeighted(MECHANIC_STATUS_WEIGHTS),
    ])
    const mechanicIds = await bulkInsert(
      client,
      'mechanics',
      ['name', 'phone', 'specialization', 'status'],
      mechanicRows
    )

    // --- Customers ---
    const now = new Date()
    const historyStart = new Date(now.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000)

    const customerRows = Array.from({ length: CUSTOMER_COUNT }, () => {
      const name = faker.person.fullName()
      return [
        name,
        faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
        faker.phone.number({ style: 'international' }),
        randomDateBetween(historyStart, now),
      ]
    })
    const customerIds = await bulkInsert(
      client,
      'customers',
      ['name', 'email', 'phone', 'created_at'],
      customerRows
    )

    // --- Vehicles (1-2 per customer, tracked per-customer for booking assignment) ---
    const vehicleRowsFlat = []
    const vehicleCustomerMap = [] // parallel array: vehicleCustomerMap[i] -> customer_id for vehicleRowsFlat[i]

    customerIds.forEach((customerId) => {
      const vehicleCount = randomInt(1, 2)
      for (let i = 0; i < vehicleCount; i++) {
        const { make, model } = pickOne(VEHICLE_MODELS)
        vehicleRowsFlat.push([customerId, make, model, randomInt(2012, 2024), licensePlate()])
        vehicleCustomerMap.push(customerId)
      }
    })

    const vehicleIds = await bulkInsert(
      client,
      'vehicles',
      ['customer_id', 'make', 'model', 'year', 'license_plate'],
      vehicleRowsFlat
    )

    // Group vehicle ids by customer so bookings only reference a vehicle the customer owns.
    const vehiclesByCustomer = new Map()
    vehicleIds.forEach((vehicleId, index) => {
      const customerId = vehicleCustomerMap[index]
      if (!vehiclesByCustomer.has(customerId)) vehiclesByCustomer.set(customerId, [])
      vehiclesByCustomer.get(customerId).push(vehicleId)
    })

    // --- Bookings ---
    const bookingRows = Array.from({ length: BOOKING_COUNT }, () => {
      const customerId = pickOne(customerIds)
      const vehicleId = pickOne(vehiclesByCustomer.get(customerId))
      const serviceIndex = randomInt(0, SERVICES.length - 1)
      const serviceId = serviceIds[serviceIndex]
      const service = SERVICES[serviceIndex]

      const status = pickWeighted(BOOKING_STATUS_WEIGHTS)
      // Unassigned only makes sense for bookings still pending; every other state implies a mechanic took it.
      const mechanicId = status === 'pending' ? null : pickOne(mechanicIds)

      const priceVariance = 0.9 + Math.random() * 0.3 // +/-10-30% real-world variance
      const amount = Math.round(service.base_price * priceVariance)

      // A handful of scheduled slots land in the next few days so "today's bookings" has data.
      const scheduledAt = randomDateBetween(historyStart, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000))
      const createdAt = new Date(scheduledAt.getTime() - randomInt(1, 72) * 60 * 60 * 1000)

      return [customerId, vehicleId, serviceId, mechanicId, status, amount, scheduledAt, createdAt]
    })

    await bulkInsert(
      client,
      'bookings',
      ['customer_id', 'vehicle_id', 'service_id', 'mechanic_id', 'status', 'amount', 'scheduled_at', 'created_at']
      ,
      bookingRows
    )

    await client.query('COMMIT')

    res.json({
      message: 'Database seeded successfully',
      counts: {
        services: serviceIds.length,
        mechanics: mechanicIds.length,
        customers: customerIds.length,
        vehicles: vehicleIds.length,
        bookings: bookingRows.length,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Seeding failed:', error)
    res.status(500).json({ error: 'Seeding failed', detail: error.message })
  } finally {
    client.release()
  }
}
