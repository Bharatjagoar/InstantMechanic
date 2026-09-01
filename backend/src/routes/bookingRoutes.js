import { Router } from 'express'
import {
  listBookings,
  getBookingById,
  updateBookingStatus,
  createBooking,
  assignMechanic,
} from '../controllers/bookingController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.use(requireAuth)

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings with search, filter, sort, and pagination
 *     description: >
 *       Ops sees every booking. A customer's or mechanic's results are automatically
 *       scoped to their own bookings/jobs regardless of query params — this same
 *       endpoint is "my bookings" for a customer and "my jobs" for a mechanic.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches customer name, vehicle license plate, or exact booking ID
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Comma-separated list of statuses, e.g. "pending,assigned"
 *       - in: query
 *         name: mechanicId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [scheduled_at, amount, status, created_at, id], default: scheduled_at }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Booking' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', listBookings)

/**
 * @openapi
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get a single booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Booking detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', getBookingById)

/**
 * @openapi
 * /bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update a booking's status
 *     description: >
 *       Updates the booking's status and broadcasts the change to every connected
 *       dashboard client over Socket.io as a `booking:updated` event, so open
 *       dashboards reflect the change live without a page reload.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, assigned, on_the_way, completed, cancelled]
 *     responses:
 *       200:
 *         description: The updated booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/:id/status', updateBookingStatus)

/**
 * @openapi
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking (customer only)
 *     description: >
 *       Creates a booking for the logged-in customer's own vehicle. If a mechanic is
 *       currently available, one is auto-assigned immediately and the booking is
 *       created as "assigned"; otherwise it's created as "pending" for ops to assign
 *       later via PATCH /bookings/{id}/assign. Broadcasts `booking:created` over
 *       Socket.io.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, serviceId, scheduledAt]
 *             properties:
 *               vehicleId: { type: integer }
 *               serviceId: { type: integer }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: The created booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       403:
 *         description: The vehicle does not belong to the logged-in customer
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireRole('customer'), createBooking)

/**
 * @openapi
 * /bookings/{id}/assign:
 *   patch:
 *     tags: [Bookings]
 *     summary: Manually assign a mechanic to a pending booking (ops only, fallback)
 *     description: >
 *       Fallback for bookings stuck at "pending" because no mechanic was available
 *       at creation time. Broadcasts the update as `booking:updated`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mechanicId]
 *             properties:
 *               mechanicId: { type: integer }
 *     responses:
 *       200:
 *         description: The updated booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       409:
 *         description: Booking not found or not pending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/:id/assign', requireRole('ops'), assignMechanic)

export default router
