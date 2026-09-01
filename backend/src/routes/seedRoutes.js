import { Router } from 'express'
import { seedDatabase, deleteAllData } from '../controllers/seedController.js'
import { requireSeedKey } from '../middleware/requireSeedKey.js'

const router = Router()

/**
 * @openapi
 * /seed:
 *   post:
 *     tags: [Seeding]
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

/**
 * @openapi
 * /delete:
 *   post:
 *     tags: [Seeding]
 *     summary: Delete all data from every table, including login accounts
 *     description: >
 *       Truncates every table (users, bookings, vehicles, customers, mechanics, services)
 *       and does not repopulate anything — the database is left empty afterward. This
 *       removes every login account, including the seeded demo accounts, so signing back
 *       in requires registering again or re-seeding. Guarded by the same shared secret as
 *       /seed. **Destructive and irreversible** — there is no confirmation step.
 *     security:
 *       - seedKey: []
 *     responses:
 *       200:
 *         description: Row counts that existed immediately before deletion
 *       401:
 *         description: Missing or incorrect x-seed-key header
 */
router.post('/delete', requireSeedKey, deleteAllData)

export default router
