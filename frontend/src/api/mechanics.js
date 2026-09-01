import { apiGet } from './client'

export const getMechanics = () => apiGet('/api/mechanics')
