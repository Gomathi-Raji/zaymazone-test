import mongoose from 'mongoose'

const artisanSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	bio: { type: String, default: '' },
	location: { type: String, index: true },
	socials: { type: Map, of: String, default: {} },
}, { timestamps: true })

export default mongoose.model('Artisan', artisanSchema)


