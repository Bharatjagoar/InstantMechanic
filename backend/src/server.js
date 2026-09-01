import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import 'dotenv/config'
import adminRoutes from './routes/adminRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import mechanicRoutes from './routes/mechanicRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import { setIO } from './realtime/io.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/admin', adminRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/mechanics', mechanicRoutes)
app.use('/api/customers', customerRoutes)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`))
})

setIO(io)

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
