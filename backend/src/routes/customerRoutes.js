import { Router } from 'express'
import { listCustomers } from '../controllers/customerController.js'

const router = Router()

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: List customers with search and pagination
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
 *         description: Matches customer name or email
 *     responses:
 *       200:
 *         description: Paginated list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - { $ref: '#/components/schemas/Customer' }
 *                       - type: object
 *                         properties:
 *                           vehicleCount: { type: integer, example: 2 }
 *                           totalBookings: { type: integer, example: 26 }
 *                           createdAt: { type: string, format: date-time }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', listCustomers)

export default router
