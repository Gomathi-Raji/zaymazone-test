import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'

const router = Router()

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
	const parsed = signUpSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const { name, email, password } = parsed.data
	const existing = await User.findOne({ email })
	if (existing) return res.status(409).json({ error: 'Email already in use' })
	const passwordHash = await bcrypt.hash(password, 10)
	const user = await User.create({ name, email, passwordHash })
	const token = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
	return res.status(201).json({ token, user: { id: user._id, name, email } })
})

router.post('/signin', async (req, res) => {
	const parsed = signInSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials' })
	const { email, password } = parsed.data
	const user = await User.findOne({ email })
	if (!user) return res.status(401).json({ error: 'Invalid credentials' })
	const ok = await bcrypt.compare(password, user.passwordHash)
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
	const token = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
	return res.json({ token, user: { id: user._id, name: user.name, email } })
})

export default router


