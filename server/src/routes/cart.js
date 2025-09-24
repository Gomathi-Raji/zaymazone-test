import { Router } from 'express'
import { z } from 'zod'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { requireAuth, requireActiveUser } from '../middleware/auth.js'
import { validate, idSchema } from '../middleware/validation.js'

const router = Router()

const addToCartSchema = z.object({
	productId: idSchema,
	quantity: z.number().int().min(1).max(10).default(1)
})

const updateCartItemSchema = z.object({
	quantity: z.number().int().min(0).max(10) // 0 to remove item
})

// Get user's cart
router.get('/',
	requireAuth,
	requireActiveUser,
	async (req, res) => {
		try {
			const cart = await Cart.findOne({ userId: req.user.sub })
				.populate({
					path: 'items.productId',
					select: 'name price images stock isActive artisanId',
					populate: {
						path: 'artisanId',
						select: 'name location'
					}
				})
				.lean()
			
			if (!cart) {
				return res.json({ items: [], total: 0, itemCount: 0 })
			}
			
			// Filter out inactive products and calculate totals
			const activeItems = cart.items.filter(item => 
				item.productId && item.productId.isActive
			)
			
			const total = activeItems.reduce((sum, item) => 
				sum + (item.productId.price * item.quantity), 0
			)
			
			const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0)
			
			res.json({
				items: activeItems,
				total,
				itemCount,
				updatedAt: cart.updatedAt
			})
		} catch (error) {
			console.error('Error fetching cart:', error)
			res.status(500).json({ error: 'Failed to fetch cart' })
		}
	}
)

// Add item to cart
router.post('/add',
	requireAuth,
	requireActiveUser,
	validate(addToCartSchema),
	async (req, res) => {
		try {
			const { productId, quantity } = req.validatedBody
			const userId = req.user.sub
			
			// Verify product exists and is active
			const product = await Product.findOne({ 
				_id: productId, 
				isActive: true 
			}).select('stock name price')
			
			if (!product) {
				return res.status(404).json({ error: 'Product not found' })
			}
			
			if (product.stock < quantity) {
				return res.status(400).json({ 
					error: `Insufficient stock. Available: ${product.stock}` 
				})
			}
			
			// Find or create cart
			let cart = await Cart.findOne({ userId })
			
			if (!cart) {
				cart = new Cart({ userId, items: [] })
			}
			
			// Check if product already in cart
			const existingItemIndex = cart.items.findIndex(
				item => item.productId.toString() === productId
			)
			
			if (existingItemIndex > -1) {
				// Update quantity
				const newQuantity = cart.items[existingItemIndex].quantity + quantity
				
				if (newQuantity > product.stock) {
					return res.status(400).json({ 
						error: `Cannot add ${quantity} items. Total would exceed stock of ${product.stock}` 
					})
				}
				
				if (newQuantity > 10) {
					return res.status(400).json({ 
						error: 'Maximum 10 items per product allowed' 
					})
				}
				
				cart.items[existingItemIndex].quantity = newQuantity
			} else {
				// Add new item
				cart.items.push({ productId, quantity })
			}
			
			await cart.save()
			
			// Return updated cart
			const updatedCart = await Cart.findOne({ userId })
				.populate({
					path: 'items.productId',
					select: 'name price images stock artisanId',
					populate: {
						path: 'artisanId',
						select: 'name location'
					}
				})
				.lean()
			
			const total = updatedCart.items.reduce((sum, item) => 
				sum + (item.productId.price * item.quantity), 0
			)
			
			const itemCount = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
			
			res.json({
				message: 'Item added to cart',
				cart: {
					items: updatedCart.items,
					total,
					itemCount,
					updatedAt: updatedCart.updatedAt
				}
			})
		} catch (error) {
			console.error('Error adding to cart:', error)
			res.status(500).json({ error: 'Failed to add item to cart' })
		}
	}
)

// Update cart item quantity
router.patch('/item/:productId',
	requireAuth,
	requireActiveUser,
	validate(z.object({ productId: idSchema }), 'params'),
	validate(updateCartItemSchema),
	async (req, res) => {
		try {
			const { productId } = req.validatedParams
			const { quantity } = req.validatedBody
			const userId = req.user.sub
			
			const cart = await Cart.findOne({ userId })
			
			if (!cart) {
				return res.status(404).json({ error: 'Cart not found' })
			}
			
			const itemIndex = cart.items.findIndex(
				item => item.productId.toString() === productId
			)
			
			if (itemIndex === -1) {
				return res.status(404).json({ error: 'Item not found in cart' })
			}
			
			if (quantity === 0) {
				// Remove item from cart
				cart.items.splice(itemIndex, 1)
			} else {
				// Verify stock for new quantity
				const product = await Product.findById(productId).select('stock')
				
				if (!product) {
					return res.status(404).json({ error: 'Product not found' })
				}
				
				if (product.stock < quantity) {
					return res.status(400).json({ 
						error: `Insufficient stock. Available: ${product.stock}` 
					})
				}
				
				cart.items[itemIndex].quantity = quantity
			}
			
			await cart.save()
			
			// Return updated cart
			const updatedCart = await Cart.findOne({ userId })
				.populate({
					path: 'items.productId',
					select: 'name price images stock artisanId',
					populate: {
						path: 'artisanId',
						select: 'name location'
					}
				})
				.lean()
			
			const total = updatedCart.items.reduce((sum, item) => 
				sum + (item.productId.price * item.quantity), 0
			)
			
			const itemCount = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
			
			res.json({
				message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
				cart: {
					items: updatedCart.items,
					total,
					itemCount,
					updatedAt: updatedCart.updatedAt
				}
			})
		} catch (error) {
			console.error('Error updating cart:', error)
			res.status(500).json({ error: 'Failed to update cart' })
		}
	}
)

// Remove item from cart
router.delete('/item/:productId',
	requireAuth,
	requireActiveUser,
	validate(z.object({ productId: idSchema }), 'params'),
	async (req, res) => {
		try {
			const { productId } = req.validatedParams
			const userId = req.user.sub
			
			const cart = await Cart.findOne({ userId })
			
			if (!cart) {
				return res.status(404).json({ error: 'Cart not found' })
			}
			
			const initialLength = cart.items.length
			cart.items = cart.items.filter(
				item => item.productId.toString() !== productId
			)
			
			if (cart.items.length === initialLength) {
				return res.status(404).json({ error: 'Item not found in cart' })
			}
			
			await cart.save()
			
			res.json({ message: 'Item removed from cart' })
		} catch (error) {
			console.error('Error removing from cart:', error)
			res.status(500).json({ error: 'Failed to remove item from cart' })
		}
	}
)

// Clear entire cart
router.delete('/clear',
	requireAuth,
	requireActiveUser,
	async (req, res) => {
		try {
			await Cart.findOneAndUpdate(
				{ userId: req.user.sub },
				{ $set: { items: [] } },
				{ upsert: true }
			)
			
			res.json({ message: 'Cart cleared successfully' })
		} catch (error) {
			console.error('Error clearing cart:', error)
			res.status(500).json({ error: 'Failed to clear cart' })
		}
	}
)

export default router