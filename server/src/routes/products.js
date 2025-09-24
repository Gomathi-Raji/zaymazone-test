import { Router } from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(4000).optional().default(''),
	price: z.number().nonnegative(),
	images: z.array(z.string().url()).optional().default([]),
	artisanId: z.string().min(1),
	category: z.string().max(120).optional(),
	stock: z.number().int().nonnegative().optional().default(0),
})

router.get('/', async (_req, res) => {
	const items = await Product.find().limit(200).lean()
	return res.json(items)
})

router.get('/:id', async (req, res) => {
	const item = await Product.findById(req.params.id).lean()
	if (!item) return res.status(404).json({ error: 'Not found' })
	return res.json(item)
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


