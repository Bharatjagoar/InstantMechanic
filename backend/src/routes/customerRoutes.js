import { Router } from 'express'
import { listCustomers } from '../controllers/customerController.js'

const router = Router()

router.get('/', listCustomers)

export default router
