import { Router } from 'express'
import { z } from 'zod'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js'
import { requireAuth, requireActiveUser, requireAdmin } from '../middleware/auth.js'
import { validate, idSchema, paginationSchema } from '../middleware/validation.js'
import { apiLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Validation schemas
const shippingAddressSchema = z.object({
	fullName: z.string().min(1).max(100),
	street: z.string().min(1).max(200),
	city: z.string().min(1).max(100),
	state: z.string().min(1).max(100),
	zipCode: z.string().min(1).max(20),
	country: z.string().default('India'),
	phone: z.string().min(10).max(15)
})

const orderItemSchema = z.object({
	productId: idSchema,
	quantity: z.number().int().min(1).max(10)
})

const createOrderSchema = z.object({
	items: z.array(orderItemSchema).min(1).max(20),
	shippingAddress: shippingAddressSchema,
	paymentMethod: z.enum(['cod', 'razorpay', 'upi']),
	paymentId: z.string().optional(),
	notes: z.string().max(500).optional(),
	isGift: z.boolean().default(false),
	giftMessage: z.string().max(200).optional()
})

const updateOrderStatusSchema = z.object({
	status: z.enum(['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
	note: z.string().max(200).optional(),
	trackingNumber: z.string().optional()
})

// Apply rate limiting to all order routes
router.use(apiLimiter)

// Get user's orders
router.get('/my-orders', 
	requireAuth, 
	requireActiveUser,
	validate(paginationSchema, 'query'),
	async (req, res) => {
		try {
			const { page, limit, sort, order } = req.validatedQuery
			const skip = (page - 1) * limit
			
			const sortObj = {}
			if (sort) {
				sortObj[sort] = order === 'asc' ? 1 : -1
			} else {
				sortObj.createdAt = -1
			}
			
			const orders = await Order.find({ userId: req.user.sub })
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('items.productId', 'name images')
				.select('-__v')
				.lean()
			
			const total = await Order.countDocuments({ userId: req.user.sub })
			
			res.json({
				orders,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching orders:', error)
			res.status(500).json({ error: 'Failed to fetch orders' })
		}
	}
)

// Get single order
router.get('/:id',
	requireAuth,
	requireActiveUser,
	validate(z.object({ id: idSchema }), 'params'),
	async (req, res) => {
		try {
			const order = await Order.findOne({ 
				_id: req.validatedParams.id,
				userId: req.user.sub 
			})
				.populate('items.productId', 'name images category')
				.populate('items.artisanId', 'name location')
				.lean()
			
			if (!order) {
				return res.status(404).json({ error: 'Order not found' })
			}
			
			res.json(order)
		} catch (error) {
			console.error('Error fetching order:', error)
			res.status(500).json({ error: 'Failed to fetch order' })
		}
	}
)

// Create new order
router.post('/',
	requireAuth,
	requireActiveUser,
	validate(createOrderSchema),
	async (req, res) => {
		try {
			const orderData = req.validatedBody
			const userId = req.user.sub
			
			// Validate products and calculate totals
			const productIds = orderData.items.map(item => item.productId)
			const products = await Product.find({ 
				_id: { $in: productIds },
				isActive: true 
			}).populate('artisanId', '_id')
			
			if (products.length !== orderData.items.length) {
				return res.status(400).json({ error: 'Some products are not available' })
			}
			
			// Check stock and build order items
			const orderItems = []
			let subtotal = 0
			
			for (const orderItem of orderData.items) {
				const product = products.find(p => p._id.toString() === orderItem.productId)
				
				if (product.stock < orderItem.quantity) {
					return res.status(400).json({ 
						error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
					})
				}
				
				const itemPrice = product.price * orderItem.quantity
				subtotal += itemPrice
				
				orderItems.push({
					productId: product._id,
					name: product.name,
					price: product.price,
					quantity: orderItem.quantity,
					artisanId: product.artisanId._id,
					image: product.images[0] || ''
				})
			}
			
			// Calculate totals (simplified for now)
			const shippingCost = subtotal > 1000 ? 0 : 50 // Free shipping above ₹1000
			const tax = Math.round(subtotal * 0.05) // 5% tax
			const total = subtotal + shippingCost + tax
			
			// Generate unique order number
			const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
			
			// Create order
			const order = new Order({
				orderNumber,
				userId,
				items: orderItems,
				subtotal,
				shippingCost,
				tax,
				total,
				shippingAddress: orderData.shippingAddress,
				paymentMethod: orderData.paymentMethod,
				paymentId: orderData.paymentId,
				notes: orderData.notes,
				isGift: orderData.isGift,
				giftMessage: orderData.giftMessage,
				statusHistory: [{
					status: 'placed',
					timestamp: new Date(),
					note: 'Order placed successfully'
				}]
			})
			
			await order.save()
			
			// Update product stock
			for (const item of orderItems) {
				await Product.findByIdAndUpdate(
					item.productId,
					{ 
						$inc: { 
							stock: -item.quantity,
							salesCount: item.quantity 
						}
					}
				)
			}
			
			// Clear cart after successful order
			await Cart.findOneAndUpdate(
				{ userId },
				{ $set: { items: [] } }
			)
			
			// Populate order for response
			const populatedOrder = await Order.findById(order._id)
				.populate('items.productId', 'name images')
				.lean()
			
			res.status(201).json(populatedOrder)
		} catch (error) {
			console.error('Error creating order:', error)
			res.status(500).json({ error: 'Failed to create order' })
		}
	}
)

// Cancel order (user can only cancel if status is 'placed' or 'confirmed')
router.patch('/:id/cancel',
	requireAuth,
	requireActiveUser,
	validate(z.object({ id: idSchema }), 'params'),
	async (req, res) => {
		try {
			const order = await Order.findOne({
				_id: req.validatedParams.id,
				userId: req.user.sub
			})
			
			if (!order) {
				return res.status(404).json({ error: 'Order not found' })
			}
			
			if (!['placed', 'confirmed'].includes(order.status)) {
				return res.status(400).json({ 
					error: 'Order cannot be cancelled at this stage' 
				})
			}
			
			// Update order status
			order.status = 'cancelled'
			order.cancelledAt = new Date()
			order.statusHistory.push({
				status: 'cancelled',
				timestamp: new Date(),
				note: 'Cancelled by customer'
			})
			
			await order.save()
			
			// Restore product stock
			for (const item of order.items) {
				await Product.findByIdAndUpdate(
					item.productId,
					{ 
						$inc: { 
							stock: item.quantity,
							salesCount: -item.quantity 
						}
					}
				)
			}
			
			res.json({ message: 'Order cancelled successfully', order })
		} catch (error) {
			console.error('Error cancelling order:', error)
			res.status(500).json({ error: 'Failed to cancel order' })
		}
	}
)

// Admin routes for order management
router.get('/admin/all',
	requireAuth,
	requireActiveUser,
	requireAdmin,
	validate(paginationSchema, 'query'),
	async (req, res) => {
		try {
			const { page, limit, sort, order } = req.validatedQuery
			const skip = (page - 1) * limit
			
			const sortObj = {}
			if (sort) {
				sortObj[sort] = order === 'asc' ? 1 : -1
			} else {
				sortObj.createdAt = -1
			}
			
			const orders = await Order.find()
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('userId', 'name email')
				.populate('items.productId', 'name images')
				.select('-__v')
				.lean()
			
			const total = await Order.countDocuments()
			
			res.json({
				orders,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching all orders:', error)
			res.status(500).json({ error: 'Failed to fetch orders' })
		}
	}
)

// Admin update order status
router.patch('/:id/status',
	requireAuth,
	requireActiveUser,
	requireAdmin,
	validate(z.object({ id: idSchema }), 'params'),
	validate(updateOrderStatusSchema),
	async (req, res) => {
		try {
			const { status, note, trackingNumber } = req.validatedBody
			
			const order = await Order.findById(req.validatedParams.id)
			
			if (!order) {
				return res.status(404).json({ error: 'Order not found' })
			}
			
			// Update order
			order.status = status
			if (trackingNumber) order.trackingNumber = trackingNumber
			
			order.statusHistory.push({
				status,
				timestamp: new Date(),
				note: note || `Status updated to ${status}`
			})
			
			if (status === 'delivered') {
				order.deliveredAt = new Date()
			}
			
			await order.save()
			
			res.json({ message: 'Order status updated successfully', order })
		} catch (error) {
			console.error('Error updating order status:', error)
			res.status(500).json({ error: 'Failed to update order status' })
		}
	}
)

export default router