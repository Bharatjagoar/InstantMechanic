import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import adminRoutes from './routes/adminRoutes.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
