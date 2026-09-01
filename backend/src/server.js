import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import 'dotenv/config'
import seedRoutes from './routes/seedRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import mechanicRoutes from './routes/mechanicRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import { setIO } from './realtime/io.js'
import { swaggerSpec } from './config/swagger.js'

const app = express()
const PORT = process.env.PORT || 4000
const HOST = process.env.HOST || '0.0.0.0'

app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', seedRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/mechanics', mechanicRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/services', serviceRoutes)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`))
})

setIO(io)

httpServer.listen(PORT, HOST, () => {
  console.log(`Backend running on ${HOST}:${PORT}`)
  console.log(`API docs available at http://localhost:${PORT}/api-docs`)
})
