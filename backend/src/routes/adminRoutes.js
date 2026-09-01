import { Router } from 'express'
import { seedDatabase } from '../controllers/adminController.js'
import { requireSeedKey } from '../middleware/requireSeedKey.js'

const router = Router()

router.post('/seed', requireSeedKey, seedDatabase)

export default router
