import { apiGet, apiPatch } from './client'

export const getBookings = (params) => apiGet('/api/bookings', params)
export const getBookingById = (id) => apiGet(`/api/bookings/${id}`)
export const updateBookingStatus = (id, status) => apiPatch(`/api/bookings/${id}/status`, { status })
