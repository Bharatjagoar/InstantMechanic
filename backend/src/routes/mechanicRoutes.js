import { Router } from 'express'
import { listMechanics } from '../controllers/mechanicController.js'

const router = Router()

/**
 * @openapi
 * /mechanics:
 *   get:
 *     tags: [Mechanics]
 *     summary: List all mechanics with derived workload stats
 *     description: >
 *       jobsCompleted and lastBooking are computed live from the bookings table
 *       (not stored counters), so they can never drift out of sync.
 *     responses:
 *       200:
 *         description: List of mechanics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Mechanic' }
 */
router.get('/', listMechanics)

export default router
