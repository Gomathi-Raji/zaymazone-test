import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
	productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
	name: { type: String, required: true }, // snapshot of product name
	price: { type: Number, required: true }, // snapshot of price at time of order
	quantity: { type: Number, required: true, min: 1 },
	artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true },
	image: { type: String } // snapshot of first product image
})

const orderSchema = new mongoose.Schema({
	orderNumber: { type: String, required: true, unique: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	items: [orderItemSchema],
	subtotal: { type: Number, required: true, min: 0 },
	shippingCost: { type: Number, default: 0, min: 0 },
	tax: { type: Number, default: 0, min: 0 },
	discount: { type: Number, default: 0, min: 0 },
	total: { type: Number, required: true, min: 0 },
	
	// Shipping Address
	shippingAddress: {
		fullName: { type: String, required: true },
		street: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, default: 'India' },
		phone: { type: String, required: true }
	},
	
	// Payment
	paymentMethod: { 
		type: String, 
		required: true, 
		enum: ['cod', 'razorpay', 'upi'] 
	},
	paymentStatus: { 
		type: String, 
		default: 'pending', 
		enum: ['pending', 'paid', 'failed', 'refunded'] 
	},
	paymentId: { type: String }, // Razorpay payment ID
	
	// Order Status
	status: { 
		type: String, 
		default: 'placed', 
		enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] 
	},
	statusHistory: [{
		status: { type: String, required: true },
		timestamp: { type: Date, default: Date.now },
		note: { type: String }
	}],
	
	// Tracking
	trackingNumber: { type: String },
	estimatedDelivery: { type: Date },
	deliveredAt: { type: Date },
	cancelledAt: { type: Date },
	cancellationReason: { type: String },
	
	// Additional Info
	notes: { type: String, maxLength: 500 },
	isGift: { type: Boolean, default: false },
	giftMessage: { type: String, maxLength: 200 }
}, { timestamps: true })

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
	if (!this.orderNumber) {
		const count = await mongoose.model('Order').countDocuments()
		this.orderNumber = `ZM${Date.now().toString().slice(-8)}${(count + 1).toString().padStart(4, '0')}`
	}
	next()
})

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 })
// orderNumber already has unique index from pre-save middleware, no need for additional index
orderSchema.index({ status: 1 })
orderSchema.index({ 'items.artisanId': 1 })

export default mongoose.model('Order', orderSchema)