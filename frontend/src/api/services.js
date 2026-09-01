import { apiGet } from './client'

export const getServices = () => apiGet('/api/services')
