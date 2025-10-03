import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
	productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
	quantity: { type: Number, required: true, min: 1, max: 10 },
	addedAt: { type: Date, default: Date.now }
})

const cartSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
	items: [cartItemSchema],
	updatedAt: { type: Date, default: Date.now }
})

// Update timestamp on save
cartSchema.pre('save', function(next) {
	this.updatedAt = Date.now()
	next()
})

export default mongoose.model('Cart', cartSchema)