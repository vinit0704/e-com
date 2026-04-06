const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const rateLimit   = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const { errorHandler, notFound } = require('./middleware/error.middleware')

const authRoutes       = require('./routes/auth.routes')
const productRoutes    = require('./routes/product.routes')
const categoryRoutes   = require('./routes/category.routes')
const reviewRoutes     = require('./routes/review.routes')
const cartRoutes       = require('./routes/cart.routes')
const orderRoutes      = require('./routes/order.routes')
const couponRoutes     = require('./routes/coupon.routes')
const addressRoutes    = require('./routes/address.routes')
const adminRoutes      = require('./routes/admin.routes')
const newsletterRoutes = require('./routes/newsletter.routes')

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy:  { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(null, true) // temporarily allow all — change after testing
    }
  },
  credentials: true,
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}))

// Handle preflight requests
app.options('*', cors())

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Too many requests, please try again later' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many auth attempts, try again in 15 minutes' },
})

app.use('/api/', globalLimiter)
app.use('/api/v1/auth/login',    authLimiter)
app.use('/api/v1/auth/register', authLimiter)

// ── Stripe webhook (raw body BEFORE json parser) ──────────────────────────────
app.use('/api/v1/orders/webhook', express.raw({ type: 'application/json' }))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Sanitize MongoDB queries ──────────────────────────────────────────────────
app.use(mongoSanitize())

// ── Trust proxy (for deployment) ──────────────────────────────────────────────
app.set('trust proxy', 1)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',       authRoutes)
app.use('/api/v1/products',   productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/reviews',    reviewRoutes)
app.use('/api/v1/cart',       cartRoutes)
app.use('/api/v1/orders',     orderRoutes)
app.use('/api/v1/coupons',    couponRoutes)
app.use('/api/v1/addresses',  addressRoutes)
app.use('/api/v1/admin',      adminRoutes)
app.use('/api/v1/newsletter', newsletterRoutes)

app.get('/api/v1/health', (req, res) => res.json({
  status: 'ok', week: 4, timestamp: new Date().toISOString()
}))

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

module.exports = app
