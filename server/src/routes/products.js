import { Router } from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { validate, paginationSchema, searchSchema } from '../middleware/validation.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(4000).optional().default(''),
	price: z.number().nonnegative(),
	originalPrice: z.number().nonnegative().optional(),
	images: z.array(z.string()).optional().default([]),
	artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/),
	category: z.enum(['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'paintings', 'crafts', 'toys']),
	subcategory: z.string().optional(),
	materials: z.array(z.string()).optional().default([]),
	colors: z.array(z.string()).optional().default([]),
	tags: z.array(z.string()).optional().default([]),
	stock: z.number().int().nonnegative().optional().default(0),
	dimensions: z.object({
		length: z.number().optional(),
		width: z.number().optional(),
		height: z.number().optional(),
		unit: z.enum(['cm', 'inch']).optional()
	}).optional(),
	weight: z.number().optional(),
	shippingTime: z.string().optional(),
	isFeatured: z.boolean().optional().default(false)
})

// Enhanced products listing with search, filter, and pagination
router.get('/', 
	validate(z.object({
		...paginationSchema.shape,
		...searchSchema.shape,
		featured: z.coerce.boolean().optional(),
		sortBy: z.enum(['name', 'price', 'rating', 'createdAt', 'salesCount']).optional().default('createdAt')
	}), 'query'),
	async (req, res) => {
		try {
			const {
				page = 1,
				limit = 20,
				q,
				category,
				minPrice,
				maxPrice,
				artisanId,
				inStock,
				featured,
				sortBy = 'createdAt',
				order = 'desc'
			} = req.validatedQuery

			// Build filter
			const filter = { isActive: true }

			if (q) {
				filter.$text = { $search: q }
			}

			if (category) {
				filter.category = category
			}

			if (minPrice !== undefined || maxPrice !== undefined) {
				filter.price = {}
				if (minPrice !== undefined) filter.price.$gte = minPrice
				if (maxPrice !== undefined) filter.price.$lte = maxPrice
			}

			if (artisanId) {
				filter.artisanId = artisanId
			}

			if (inStock) {
				filter.stock = { $gt: 0 }
			}

			if (featured !== undefined) {
				filter.isFeatured = featured
			}

			// Build sort
			const sort = {}
			if (q && !sortBy) {
				sort.score = { $meta: 'textScore' }
			} else {
				sort[sortBy] = order === 'desc' ? -1 : 1
			}

			// Execute query with pagination
			const skip = (page - 1) * limit
			const [products, total] = await Promise.all([
				Product.find(filter)
					.sort(sort)
					.skip(skip)
					.limit(limit)
					.populate('artisanId', 'name location rating')
					.lean(),
				Product.countDocuments(filter)
			])

			const totalPages = Math.ceil(total / limit)

			return res.json({
				products,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1
				}
			})
		} catch (error) {
			console.error('Products list error:', error)
			return res.status(500).json({ error: 'Server error' })
		}
	}
)

// Get single product with artisan details
router.get('/:id', optionalAuth, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
			.populate('artisanId', 'name bio location rating totalRatings avatar specialties')
			.lean()

		if (!product || !product.isActive) {
			return res.status(404).json({ error: 'Product not found' })
		}

		// Increment view count (fire and forget)
		Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec()

		return res.json(product)
	} catch (error) {
		console.error('Get product error:', error)
		return res.status(500).json({ error: 'Server error' })
	}
})

router.post('/', requireAuth, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const existsArtisan = await Artisan.findById(parsed.data.artisanId)
	if (!existsArtisan) return res.status(400).json({ error: 'Invalid artisanId' })
	const created = await Product.create(parsed.data)
	return res.status(201).json(created)
})

router.put('/:id', requireAuth, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const updated = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
	if (!updated) return res.status(404).json({ error: 'Not found' })
	return res.json(updated)
})

router.delete('/:id', requireAuth, async (req, res) => {
	const deleted = await Product.findByIdAndDelete(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Not found' })
	return res.status(204).end()
})

export default router


