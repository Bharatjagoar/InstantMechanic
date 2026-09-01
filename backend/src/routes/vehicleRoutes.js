import { Router } from 'express'
import { listMyVehicles } from '../controllers/vehicleController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

/**
 * @openapi
 * /vehicles/mine:
 *   get:
 *     tags: [Vehicles]
 *     summary: List the logged-in customer's own vehicles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles owned by the logged-in customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Vehicle' }
 */
router.get('/mine', requireAuth, requireRole('customer'), listMyVehicles)

export default router
