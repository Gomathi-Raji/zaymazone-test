import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Helper function to generate tokens
const generateTokens = (userId, email) => {
	const accessToken = jwt.sign(
		{ sub: userId, email }, 
		process.env.JWT_SECRET || 'dev-secret', 
		{ expiresIn: '15m' } // Short-lived access token
	)
	
	const refreshToken = crypto.randomBytes(64).toString('hex')
	
	return { accessToken, refreshToken }
}

// Helper function to clean expired refresh tokens
const cleanExpiredTokens = async (userId) => {
	await User.findByIdAndUpdate(userId, {
		$pull: { refreshTokens: { expiresAt: { $lt: new Date() } } }
	})
}

const signUpSchema = z.object({
	name: z.string().min(1).max(120),
	email: z.string().email().max(254),
	password: z.string().min(8).max(128),
})

const signInSchema = z.object({
	email: z.string().email().max(254),
	password: z.string().min(6).max(128),
})

router.post('/signup', async (req, res) => {
	try {
		const parsed = signUpSchema.safeParse(req.body)
		if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
		
		const { name, email, password } = parsed.data
		const existing = await User.findOne({ email })
		if (existing) return res.status(409).json({ error: 'Email already in use' })
		
		const passwordHash = await bcrypt.hash(password, 10)
		const user = await User.create({ name, email, passwordHash })
		
		const { accessToken, refreshToken } = generateTokens(user._id, email)
		
		// Store refresh token
		const refreshTokenExpiry = new Date()
		refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30) // 30 days
		
		user.refreshTokens.push({
			token: refreshToken,
			expiresAt: refreshTokenExpiry,
			deviceInfo: req.headers['user-agent'] || 'Unknown'
		})
		await user.save()
		
		return res.status(201).json({ 
			accessToken, 
			refreshToken,
			user: { id: user._id, name, email, role: user.role } 
		})
	} catch (error) {
		console.error('Signup error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/signin', async (req, res) => {
	try {
		const parsed = signInSchema.safeParse(req.body)
		if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials' })
		
		const { email, password } = parsed.data
		const user = await User.findOne({ email, isActive: true })
		if (!user) return res.status(401).json({ error: 'Invalid credentials' })
		
		const ok = await bcrypt.compare(password, user.passwordHash)
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
		
		// Clean expired tokens before creating new ones
		await cleanExpiredTokens(user._id)
		
		const { accessToken, refreshToken } = generateTokens(user._id, email)
		
		// Store refresh token
		const refreshTokenExpiry = new Date()
		refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30) // 30 days
		
		user.refreshTokens.push({
			token: refreshToken,
			expiresAt: refreshTokenExpiry,
			deviceInfo: req.headers['user-agent'] || 'Unknown'
		})
		user.lastLogin = new Date()
		await user.save()
		
		return res.json({ 
			accessToken, 
			refreshToken,
			user: { id: user._id, name: user.name, email, role: user.role } 
		})
	} catch (error) {
		console.error('Signin error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
	try {
		const { refreshToken } = req.body
		if (!refreshToken) {
			return res.status(401).json({ error: 'Refresh token required' })
		}
		
		const user = await User.findOne({
			'refreshTokens.token': refreshToken,
			'refreshTokens.expiresAt': { $gt: new Date() }
		})
		
		if (!user || !user.isActive) {
			return res.status(401).json({ error: 'Invalid or expired refresh token' })
		}
		
		// Generate new tokens
		const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.email)
		
		// Remove old refresh token and add new one
		user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken)
		
		const refreshTokenExpiry = new Date()
		refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30)
		
		user.refreshTokens.push({
			token: newRefreshToken,
			expiresAt: refreshTokenExpiry,
			deviceInfo: req.headers['user-agent'] || 'Unknown'
		})
		
		await user.save()
		
		return res.json({ 
			accessToken, 
			refreshToken: newRefreshToken,
			user: { id: user._id, name: user.name, email: user.email, role: user.role }
		})
	} catch (error) {
		console.error('Refresh token error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

// Logout endpoint
router.post('/logout', requireAuth, async (req, res) => {
	try {
		const { refreshToken } = req.body
		const userId = req.user.sub
		
		if (refreshToken) {
			// Remove specific refresh token
			await User.findByIdAndUpdate(userId, {
				$pull: { refreshTokens: { token: refreshToken } }
			})
		} else {
			// Remove all refresh tokens (logout from all devices)
			await User.findByIdAndUpdate(userId, {
				$set: { refreshTokens: [] }
			})
		}
		
		return res.json({ message: 'Logged out successfully' })
	} catch (error) {
		console.error('Logout error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

// Get current user info
router.get('/me', requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.user.sub)
			.select('-passwordHash -refreshTokens -emailVerificationToken -passwordResetToken')
		
		if (!user || !user.isActive) {
			return res.status(404).json({ error: 'User not found' })
		}
		
		return res.json({ user })
	} catch (error) {
		console.error('Get user error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

export default router


