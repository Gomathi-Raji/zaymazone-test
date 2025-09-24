import { Router } from 'express'
import { z } from 'zod'
import Artisan from '../models/Artisan.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	bio: z.string().max(4000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	socials: z.record(z.string(), z.string().url()).optional().default({}),
})

router.get('/', async (_req, res) => {
	const items = await Artisan.find().limit(200).lean()
	return res.json(items)
})

router.get('/:id', async (req, res) => {
	const item = await Artisan.findById(req.params.id).lean()
	if (!item) return res.status(404).json({ error: 'Not found' })
	return res.json(item)
})

router.post('/', requireAuth, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const created = await Artisan.create(parsed.data)
	return res.status(201).json(created)
})

router.put('/:id', requireAuth, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const updated = await Artisan.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
	if (!updated) return res.status(404).json({ error: 'Not found' })
	return res.json(updated)
})

router.delete('/:id', requireAuth, async (req, res) => {
	const deleted = await Artisan.findByIdAndDelete(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Not found' })
	return res.status(204).end()
})

export default router


