import { apiGet, apiPost } from './client'

export const login = (email, password) => apiPost('/api/auth/login', { email, password })
export const getMe = () => apiGet('/api/auth/me')
