import { Router } from 'express'
import { getDashboard } from '../controllers/dashboardController.js'

const router = Router()

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get overview stats and chart data for the ops dashboard
 *     description: >
 *       Returns the 8 headline stats (total/today's/completed/pending/cancelled bookings,
 *       total revenue, active mechanics, new customers) plus 4 chart datasets
 *       (bookings over time, revenue over time, status breakdown, category breakdown).
 *     responses:
 *       200:
 *         description: Dashboard overview and chart data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalBookings: { type: integer, example: 550 }
 *                     todayBookings: { type: integer, example: 3 }
 *                     completedBookings: { type: integer, example: 292 }
 *                     pendingBookings: { type: integer, example: 89 }
 *                     cancelledBookings: { type: integer, example: 64 }
 *                     totalRevenue: { type: number, example: 686503 }
 *                     activeMechanics: { type: integer, example: 17 }
 *                     newCustomers: { type: integer, example: 16 }
 *                 charts:
 *                   type: object
 *                   properties:
 *                     bookingsOverTime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, format: date }
 *                           count: { type: integer }
 *                     revenueOverTime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, format: date }
 *                           revenue: { type: number }
 *                     statusBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status: { type: string }
 *                           count: { type: integer }
 *                     categoryBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category: { type: string }
 *                           count: { type: integer }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', getDashboard)

export default router
