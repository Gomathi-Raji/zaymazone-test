import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'

import authRouter from './routes/auth.js'
import productsRouter from './routes/products.js'
import artisansRouter from './routes/artisans.js'
import ordersRouter from './routes/orders.js'
import cartRouter from './routes/cart.js'
import reviewsRouter from './routes/reviews.js'
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js'
import { sanitize } from './middleware/validation.js'

const app = express()

// Trust proxy for rate limiting
app.set('trust proxy', 1)

// Security & parsing
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
	origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:8080'],
	credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('combined'))
app.use(requestLogger)
app.use(sanitize)

// Global rate limit
app.use(rateLimit({
	windowMs: 60 * 1000,
	max: 120,
}))

// Health
app.get('/', (_req, res) => res.json({
	name: 'Zaymazone API',
	version: '1.0.0',
	status: 'ok',
	endpoints: {
		health: 'GET /health',
		auth: ['POST /api/auth/signup', 'POST /api/auth/signin'],
		products: ['GET /api/products', 'GET /api/products/:id', 'POST /api/products', 'PUT /api/products/:id', 'DELETE /api/products/:id'],
		artisans: ['GET /api/artisans', 'GET /api/artisans/:id', 'POST /api/artisans', 'PUT /api/artisans/:id', 'DELETE /api/artisans/:id'],
		orders: ['GET /api/orders/my-orders', 'GET /api/orders/:id', 'POST /api/orders', 'PATCH /api/orders/:id/cancel'],
		cart: ['GET /api/cart', 'POST /api/cart/add', 'PATCH /api/cart/item/:productId', 'DELETE /api/cart/item/:productId'],
		reviews: ['GET /api/reviews/product/:productId', 'GET /api/reviews/my-reviews', 'POST /api/reviews', 'PATCH /api/reviews/:id']
	}
}))
app.get('/health', (_req, res) => res.json({ ok: true }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/artisans', artisansRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/cart', cartRouter)
app.use('/api/reviews', reviewsRouter)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

// DB and server
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'
const port = process.env.PORT || 4000

async function start() {
	await mongoose.connect(mongoUri)
	app.listen(port, () => {
		console.log(`API listening on http://localhost:${port}`)
	})
}

start().catch((err) => {
	console.error('Failed to start server', err)
	process.exit(1)
})


