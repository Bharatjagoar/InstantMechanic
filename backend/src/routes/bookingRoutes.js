import { Router } from 'express'
import { listBookings, getBookingById, updateBookingStatus } from '../controllers/bookingController.js'

const router = Router()

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings with search, filter, sort, and pagination
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

export default router
