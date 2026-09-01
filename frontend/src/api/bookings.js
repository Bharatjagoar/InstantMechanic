import { apiGet } from './client'

export const getBookings = (params) => apiGet('/api/bookings', params)
export const getBookingById = (id) => apiGet(`/api/bookings/${id}`)
