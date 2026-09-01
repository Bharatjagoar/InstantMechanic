import { Router } from 'express'
import { listMechanics } from '../controllers/mechanicController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

/**
 * @openapi
 * /mechanics:
 *   get:
 *     tags: [Mechanics]
 *     summary: List all mechanics with derived workload stats (ops only)
 *     description: >
 *       jobsCompleted and lastBooking are computed live from the bookings table
 *       (not stored counters), so they can never drift out of sync. Ops-only —
 *       exposes every mechanic's contact info, which customer/mechanic roles
 *       should never see in full.
 *     security:
 *       - bearerAuth: []
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
router.get('/', requireAuth, requireRole('ops'), listMechanics)

export default router
