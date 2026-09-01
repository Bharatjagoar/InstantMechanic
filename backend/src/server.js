import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import adminRoutes from './routes/adminRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import mechanicRoutes from './routes/mechanicRoutes.js'
import customerRoutes from './routes/customerRoutes.js'

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

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
