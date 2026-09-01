import { Router } from 'express'
import { listServices } from '../controllers/serviceController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

/**
 * @openapi
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: List all services (used to populate the booking form)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Service' }
 */
router.get('/', requireAuth, listServices)

export default router
