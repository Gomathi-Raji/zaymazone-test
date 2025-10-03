import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../src/models/User.js'
import Artisan from '../src/models/Artisan.js'
import Product from '../src/models/Product.js'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'

async function createSampleUsers() {
	return [
		{
			name: 'John Doe',
			email: 'john@example.com',
			passwordHash: await bcrypt.hash('password123', 10),
			role: 'user'
		},
		{
			name: 'Admin User',
			email: 'admin@zaymazone.com',
			passwordHash: await bcrypt.hash('admin123', 10),
			role: 'admin'
		},
		{
			name: 'Rajesh Kumar',
			email: 'rajesh@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan'
		},
		{
			name: 'Meera Singh',
			email: 'meera@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan'
		},
		{
			name: 'Vikram Joshi',
			email: 'vikram@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan'
		}
	]
}

function createSampleArtisans(artisanUsers) {
	return [
		{
			userId: artisanUsers[0]._id,
			name: 'Rajesh Kumar',
			bio: 'Master potter with 20+ years of experience in traditional blue pottery',
			specialties: ['pottery'],
			location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
			avatar: '/assets/artisan-avatar-1.jpg',
			rating: 4.8,
			totalRatings: 156,
			joinedDate: new Date('2020-01-15'),
			verification: { isVerified: true },
			isActive: true,
			experience: 20
		},
		{
			userId: artisanUsers[1]._id,
			name: 'Meera Singh',
			bio: 'Traditional textile weaver specializing in handloom fabrics',
			specialties: ['textiles'],
			location: { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India' },
			avatar: '/assets/artisan-avatar-2.jpg',
			rating: 4.7,
			totalRatings: 89,
			joinedDate: new Date('2019-06-10'),
			verification: { isVerified: true },
			isActive: true,
			experience: 15
		},
		{
			userId: artisanUsers[2]._id,
			name: 'Vikram Joshi',
			bio: 'Skilled metalwork craftsman creating beautiful brass and copper items',
			specialties: ['metalwork'],
			location: { city: 'Moradabad', state: 'Uttar Pradesh', country: 'India' },
			avatar: '/assets/artisan-avatar-3.jpg',
			rating: 4.6,
			totalRatings: 124,
			joinedDate: new Date('2018-03-22'),
			verification: { isVerified: true },
			isActive: true,
			experience: 18
		}
	]
}

async function seedDatabase() {
	try {
		console.log('🌱 Starting database seed...')
		
		// Connect to MongoDB
		await mongoose.connect(mongoUri)
		console.log('📦 Connected to MongoDB')

		// Clear existing data
		await Promise.all([
			User.deleteMany({}),
			Artisan.deleteMany({}),
			Product.deleteMany({})
		])
		console.log('🗑️  Cleared existing data')

		// Create users
		const sampleUsers = await createSampleUsers()
		const users = await User.insertMany(sampleUsers)
		console.log(`👥 Created ${users.length} users`)

		// Create artisans (link to the last 3 users which are artisans)
		const artisanUsers = users.slice(-3) // Get last 3 users (the artisan users)
		const sampleArtisans = createSampleArtisans(artisanUsers)
		const artisans = await Artisan.insertMany(sampleArtisans)
		console.log(`🎨 Created ${artisans.length} artisans`)

		// Create sample products
		const sampleProducts = [
			{
				name: 'Traditional Blue Pottery Vase',
				description: 'Handcrafted blue pottery vase with intricate floral patterns, perfect for home decoration',
				price: 1250,
				originalPrice: 1500,
				images: ['/assets/blue-pottery-set.jpg'],
				artisanId: artisans[0]._id,
				category: 'pottery',
				subcategory: 'vases',
				materials: ['clay', 'ceramic glaze'],
				dimensions: { length: 15, width: 15, height: 25, unit: 'cm' },
				weight: 800,
				colors: ['blue', 'white'],
				tags: ['handmade', 'traditional', 'home-decor'],
				stock: 5,
				isHandmade: true,
				shippingTime: '3-5 days',
				rating: 4.8,
				reviewCount: 23,
				isFeatured: true
			},
			{
				name: 'Handwoven Cotton Bedsheet Set',
				description: 'Pure cotton bedsheet set with traditional block prints, includes 1 bedsheet and 2 pillowcases',
				price: 899,
				images: ['/assets/cotton-bedsheet.jpg'],
				artisanId: artisans[1]._id,
				category: 'textiles',
				subcategory: 'bedding',
				materials: ['cotton'],
				dimensions: { length: 220, width: 150, height: 1, unit: 'cm' },
				weight: 600,
				colors: ['white', 'blue', 'red'],
				tags: ['cotton', 'bedding', 'block-print'],
				stock: 8,
				isHandmade: true,
				shippingTime: '5-7 days',
				rating: 4.6,
				reviewCount: 18
			},
			{
				name: 'Brass Decorative Bowl',
				description: 'Elegant brass bowl with engraved patterns, perfect for serving or decoration',
				price: 675,
				images: ['/assets/brass-bowl.jpg'],
				artisanId: artisans[2]._id,
				category: 'metalwork',
				subcategory: 'bowls',
				materials: ['brass'],
				dimensions: { length: 20, width: 20, height: 8, unit: 'cm' },
				weight: 450,
				colors: ['gold'],
				tags: ['brass', 'decorative', 'serving'],
				stock: 12,
				isHandmade: true,
				shippingTime: '3-5 days',
				rating: 4.7,
				reviewCount: 31
			}
		]

		const products = await Product.insertMany(sampleProducts)
		console.log(`🛍️  Created ${products.length} products`)

		console.log('✅ Database seeded successfully!')
		
	} catch (error) {
		console.error('❌ Error seeding database:', error)
		process.exit(1)
	} finally {
		await mongoose.disconnect()
		console.log('🔌 Disconnected from MongoDB')
		process.exit(0)
	}
}

seedDatabase()