import { Router } from 'express'
import { listBookings, getBookingById } from '../controllers/bookingController.js'

const router = Router()

router.get('/', listBookings)
router.get('/:id', getBookingById)

export default router
