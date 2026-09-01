import { io } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Singleton — every component that needs live updates shares this one connection.
export const socket = io(API_BASE_URL, { autoConnect: true })
