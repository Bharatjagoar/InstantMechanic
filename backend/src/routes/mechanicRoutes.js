import { Router } from 'express'
import { listMechanics } from '../controllers/mechanicController.js'

const router = Router()

router.get('/', listMechanics)

export default router
