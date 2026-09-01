import { Router } from 'express'
import { seedDatabase } from '../controllers/adminController.js'
import { requireSeedKey } from '../middleware/requireSeedKey.js'

const router = Router()

/**
 * @openapi
 * /admin/seed:
 *   post:
 *     tags: [Admin]
 *     summary: Wipe and re-seed the database with realistic sample data
 *     description: >
 *       Truncates all tables and inserts fresh sample data (services, mechanics,
 *       customers, vehicles, bookings). Guarded by a shared secret so it can't be
 *       triggered by anyone who just finds the URL.
 *     security:
 *       - seedKey: []
 *     responses:
 *       200:
 *         description: Row counts inserted
 *       401:
 *         description: Missing or incorrect x-seed-key header
 */
router.post('/seed', requireSeedKey, seedDatabase)

export default router
