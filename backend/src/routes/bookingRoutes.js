import { Router } from 'express'
import { listBookings, getBookingById, updateBookingStatus } from '../controllers/bookingController.js'

const router = Router()

router.get('/', listBookings)
router.get('/:id', getBookingById)
router.patch('/:id/status', updateBookingStatus)

export default router
