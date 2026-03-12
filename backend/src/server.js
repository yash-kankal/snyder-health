require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const connectDB = require('./lib/db')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const mealsRoutes = require('./routes/meals')
const caloriesRoutes = require('./routes/calories')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// ── Connect database ────────────────────────────────────────────────────────
connectDB()

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  'https://snyder-health.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

// Global rate-limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}))

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/user',     userRoutes)
app.use('/api/chat',     chatRoutes)
app.use('/api/meals',    mealsRoutes)
app.use('/api/calories', caloriesRoutes)

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
)

// ── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`🚀 SnyderHealth backend running on http://localhost:${PORT}`))
