import { apiGet } from './client'

export const getMyVehicles = () => apiGet('/api/vehicles/mine')
