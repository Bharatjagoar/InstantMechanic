import { apiGet, apiPatch, apiPost } from './client'

export const getBookings = (params) => apiGet('/api/bookings', params)
export const getBookingById = (id) => apiGet(`/api/bookings/${id}`)
export const updateBookingStatus = (id, status) => apiPatch(`/api/bookings/${id}/status`, { status })
export const createBooking = (payload) => apiPost('/api/bookings', payload)
export const assignMechanic = (id, mechanicId) => apiPatch(`/api/bookings/${id}/assign`, { mechanicId })
