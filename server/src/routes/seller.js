import { Router } from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Artisan from '../models/Artisan.js'
import User from '../models/User.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { authenticateToken } from '../middleware/firebase-auth.js'

const router = Router()

// ============= SELLER DASHBOARD STATS =============
router.get('/stats', authenticateToken, async (req, res) => {
	try {
		// Find artisan by userId
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const artisanId = artisan._id

		// Get statistics
		const [
			totalProducts,
			activeProducts,
			totalOrders,
			completedOrders,
			totalRevenue,
			totalRating,
			reviewCount
		] = await Promise.all([
			Product.countDocuments({ artisanId, isActive: true }),
			Product.countDocuments({ artisanId, isActive: true, inStock: true }),
			Order.countDocuments({ 'items.productArtisan': artisanId }),
			Order.countDocuments({ 'items.productArtisan': artisanId, status: 'delivered' }),
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisanId, status: 'delivered' } },
				{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
			]),
			Product.aggregate([
				{ $match: { artisanId } },
				{ $group: { _id: null, avgRating: { $avg: '$rating' } } }
			]),
			Product.aggregate([
				{ $match: { artisanId } },
				{ $group: { _id: null, totalReviews: { $sum: '$reviewCount' } } }
			])
		])

		const revenue = totalRevenue[0]?.total || 0
		const avgRating = totalRating[0]?.avgRating || 0
		const reviews = reviewCount[0]?.totalReviews || 0

		res.json({
			stats: {
				totalProducts,
				activeProducts,
				totalOrders,
				completedOrders,
				totalRevenue: revenue,
				averageRating: avgRating,
				totalReviews: reviews,
				artisanId: artisanId.toString()
			}
		})
	} catch (error) {
		console.error('Seller stats error:', error)
		res.status(500).json({ error: 'Failed to fetch seller statistics' })
	}
})

// ============= PRODUCTS MANAGEMENT =============
// Get seller's products
router.get('/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const search = req.query.search || ''
		const status = req.query.status || 'all'

		let query = { artisanId: artisan._id }

		// Filter by status
		if (status === 'active') {
			query.isActive = true
		} else if (status === 'inactive') {
			query.isActive = false
		}

		// Search functionality
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			]
		}

		const skip = (page - 1) * limit
		const [products, total] = await Promise.all([
			Product.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Product.countDocuments(query)
		])

		res.json({
			products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get seller products error:', error)
		res.status(500).json({ error: 'Failed to fetch products' })
	}
})

// Create product
router.post('/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const {
			name,
			description,
			price,
			originalPrice,
			images,
			category,
			subcategory,
			materials,
			colors,
			tags,
			stockCount,
			dimensions,
			weight,
			shippingTime,
			isHandmade,
			featured
		} = req.body

		// Validation
		if (!name || !price || !category) {
			return res.status(400).json({
				error: 'Missing required fields: name, price, category'
			})
		}

		const product = new Product({
			name,
			description,
			price: parseFloat(price),
			originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
			images: Array.isArray(images) ? images : [],
			artisanId: artisan._id,
			category,
			subcategory,
			materials,
			colors,
			tags,
			stockCount: parseInt(stockCount) || 0,
			inStock: parseInt(stockCount) > 0,
			dimensions,
			weight,
			shippingTime,
			isHandmade: isHandmade !== false,
			featured: featured === true,
			isActive: true
		})

		await product.save()

		// Update artisan product count
		artisan.totalProducts = (artisan.totalProducts || 0) + 1
		await artisan.save()

		res.status(201).json({
			message: 'Product created successfully',
			product
		})
	} catch (error) {
		console.error('Create product error:', error)
		res.status(500).json({ error: 'Failed to create product' })
	}
})

// Get single product
router.get('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOne({
			_id: req.params.id,
			artisanId: artisan._id
		})

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json(product)
	} catch (error) {
		console.error('Get product error:', error)
		res.status(500).json({ error: 'Failed to fetch product' })
	}
})

// Update product
router.put('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOneAndUpdate(
			{ _id: req.params.id, artisanId: artisan._id },
			{
				...req.body,
				updatedAt: new Date()
			},
			{ new: true }
		)

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json({
			message: 'Product updated successfully',
			product
		})
	} catch (error) {
		console.error('Update product error:', error)
		res.status(500).json({ error: 'Failed to update product' })
	}
})

// Delete/deactivate product
router.delete('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOneAndUpdate(
			{ _id: req.params.id, artisanId: artisan._id },
			{ isActive: false },
			{ new: true }
		)

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json({ message: 'Product deleted successfully' })
	} catch (error) {
		console.error('Delete product error:', error)
		res.status(500).json({ error: 'Failed to delete product' })
	}
})

// ============= ORDERS MANAGEMENT =============
// Get seller's orders
router.get('/orders', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const status = req.query.status || 'all'

		let query = { 'items.productArtisan': artisan._id }

		if (status !== 'all') {
			query.status = status
		}

		const skip = (page - 1) * limit
		const [orders, total] = await Promise.all([
			Order.find(query)
				.populate('userId', 'name email phone')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Order.countDocuments(query)
		])

		res.json({
			orders,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get seller orders error:', error)
		res.status(500).json({ error: 'Failed to fetch orders' })
	}
})

// Get single order
router.get('/orders/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const order = await Order.findOne({
			_id: req.params.id,
			'items.productArtisan': artisan._id
		}).populate('userId', 'name email phone address')

		if (!order) {
			return res.status(404).json({ error: 'Order not found' })
		}

		res.json(order)
	} catch (error) {
		console.error('Get order error:', error)
		res.status(500).json({ error: 'Failed to fetch order' })
	}
})

// Update order status
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const { status } = req.body

		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' })
		}

		const order = await Order.findOneAndUpdate(
			{ _id: req.params.id, 'items.productArtisan': artisan._id },
			{ status, updatedAt: new Date() },
			{ new: true }
		)

		if (!order) {
			return res.status(404).json({ error: 'Order not found' })
		}

		res.json({
			message: 'Order status updated successfully',
			order
		})
	} catch (error) {
		console.error('Update order status error:', error)
		res.status(500).json({ error: 'Failed to update order status' })
	}
})

// ============= PROFILE MANAGEMENT =============
// Get seller profile
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		res.json({
			profile: {
				_id: artisan._id,
				name: artisan.name,
				bio: artisan.bio,
				avatar: artisan.avatar,
				coverImage: artisan.coverImage,
				location: artisan.location,
				specialties: artisan.specialties,
				experience: artisan.experience,
				socials: artisan.socials,
				verification: artisan.verification,
				businessInfo: artisan.businessInfo,
				totalProducts: artisan.totalProducts,
				totalSales: artisan.totalSales,
				rating: artisan.rating,
				totalRatings: artisan.totalRatings,
				isActive: artisan.isActive,
				joinedDate: artisan.createdAt
			}
		})
	} catch (error) {
		console.error('Get profile error:', error)
		res.status(500).json({ error: 'Failed to fetch profile' })
	}
})

// Update seller profile
router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const { name, bio, avatar, coverImage, location, specialties, experience, socials } = req.body

		const artisan = await Artisan.findOneAndUpdate(
			{ userId: req.user._id },
			{
				name,
				bio,
				avatar,
				coverImage,
				location,
				specialties,
				experience,
				socials,
				updatedAt: new Date()
			},
			{ new: true }
		)

		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		res.json({
			message: 'Profile updated successfully',
			profile: artisan
		})
	} catch (error) {
		console.error('Update profile error:', error)
		res.status(500).json({ error: 'Failed to update profile' })
	}
})

// ============= ANALYTICS =============
// Get sales analytics
router.get('/analytics/sales', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		// Last 30 days sales
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

		const salesData = await Order.aggregate([
			{
				$match: {
					'items.productArtisan': artisan._id,
					createdAt: { $gte: thirtyDaysAgo }
				}
			},
			{
				$group: {
					_id: {
						$dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
					},
					sales: { $sum: 1 },
					revenue: { $sum: '$totalAmount' }
				}
			},
			{ $sort: { _id: 1 } }
		])

		res.json({ analytics: { sales: salesData } })
	} catch (error) {
		console.error('Sales analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch analytics' })
	}
})

// Get product performance
router.get('/analytics/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const products = await Product.find({ artisanId: artisan._id })
			.select('name price rating reviewCount viewCount salesCount')
			.sort({ salesCount: -1 })
			.limit(10)

		res.json({ analytics: { products } })
	} catch (error) {
		console.error('Product analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch product analytics' })
	}
})

export default router
