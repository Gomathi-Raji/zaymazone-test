import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true, maxLength: 120 },
	email: { type: String, required: true, unique: true, lowercase: true, index: true, maxLength: 254 },
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ['user', 'artisan', 'admin'], default: 'user' },
	avatar: { type: String, default: '' },
	phone: { type: String, trim: true },
	address: {
		street: { type: String, trim: true },
		city: { type: String, trim: true },
		state: { type: String, trim: true },
		zipCode: { type: String, trim: true },
		country: { type: String, default: 'India' }
	},
	isEmailVerified: { type: Boolean, default: false },
	emailVerificationToken: { type: String },
	passwordResetToken: { type: String },
	passwordResetExpires: { type: Date },
	preferences: {
		newsletter: { type: Boolean, default: true },
		notifications: { type: Boolean, default: true },
		language: { type: String, default: 'en' }
	},
	lastLogin: { type: Date },
	isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 })
userSchema.index({ role: 1 })

export default mongoose.model('User', userSchema)


