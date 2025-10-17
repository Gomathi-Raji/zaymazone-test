import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true, maxLength: 200 },
	description: { type: String, default: '', maxLength: 4000 },
	price: { type: Number, required: true, min: 0 },
	originalPrice: { type: Number, min: 0 }, // for discounts
	images: { type: [String], default: [], validate: [arrayLimit, 'Maximum 10 images allowed'] },
	artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
	category: { 
		type: String, 
		required: true,
		enum: ['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'paintings', 'crafts', 'toys'],
		index: true 
	},
	subcategory: { type: String, trim: true },
	materials: [{ type: String, trim: true }],
	dimensions: { type: String, default: '' }, // Changed to string to match frontend format (e.g., "15cm x 15cm x 20cm")
	weight: { type: String, default: '' }, // Changed to string to match frontend format (e.g., "800g")
	colors: [{ type: String, trim: true }],
	tags: [{ type: String, trim: true, lowercase: true }],
	inStock: { type: Boolean, default: true },
	stock: { type: Number, default: 0, min: 0 }, // Changed from stockCount to stock to match seed script
	isHandmade: { type: Boolean, default: true },
	shippingTime: { type: String, default: '3-5 days' },
	rating: { type: Number, min: 0, max: 5, default: 0 },
	reviewCount: { type: Number, default: 0 },
	viewCount: { type: Number, default: 0 },
	salesCount: { type: Number, default: 0 },
	isFeatured: { type: Boolean, default: false }, // Changed from featured to isFeatured to match seed script
	isActive: { type: Boolean, default: true },
	// Approval workflow fields
	approvalStatus: { 
		type: String, 
		enum: ['pending', 'approved', 'rejected'], 
		default: 'pending',
		index: true
	},
	approvalNotes: { type: String, trim: true },
	rejectionReason: { type: String, trim: true },
	approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	approvedAt: { type: Date },
	seoTitle: { type: String, trim: true },
	seoDescription: { type: String, trim: true }
}, { timestamps: true })

// Array length validator
function arrayLimit(val) {
	return val.length <= 10;
}

// Indexes for performance
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ artisanId: 1, isActive: 1 })
productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ price: 1 })
productSchema.index({ rating: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ featured: -1, isActive: 1 })

export default mongoose.model('Product', productSchema)


