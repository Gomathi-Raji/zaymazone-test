import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../src/models/User.js'
import Artisan from '../src/models/Artisan.js'
import Product from '../src/models/Product.js'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'

// Enhanced Users Data
async function createSampleUsers() {
	return [
		// Regular Users
		{
			name: 'John Doe',
			email: 'john@example.com',
			passwordHash: await bcrypt.hash('password123', 10),
			role: 'user',
			avatar: '/assets/user-avatar.jpg',
			phone: '+91-9876543210',
			address: {
				street: '123 Main Street',
				city: 'New Delhi',
				state: 'Delhi',
				zipCode: '110001',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Admin User',
			email: 'admin@zaymazone.com',
			passwordHash: await bcrypt.hash('admin123', 10),
			role: 'admin',
			avatar: '/assets/team-1.jpg',
			isEmailVerified: true
		},
		
		// Artisan Users (matching frontend data)
		{
			name: 'Rajesh Kumar',
			email: 'rajesh@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-1.jpg',
			phone: '+91-9876543211',
			address: {
				city: 'Khurja',
				state: 'Uttar Pradesh',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Fatima Sheikh',
			email: 'fatima@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-2.jpg',
			phone: '+91-9876543212',
			address: {
				city: 'Srinagar',
				state: 'Kashmir',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Ravi Patel',
			email: 'ravi@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-3.jpg',
			phone: '+91-9876543213',
			address: {
				city: 'Channapatna',
				state: 'Karnataka',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Anita Sharma',
			email: 'anita@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-4.jpg',
			phone: '+91-9876543214',
			address: {
				city: 'Mysore',
				state: 'Karnataka',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Vikram Singh',
			email: 'vikram@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-5.jpg',
			phone: '+91-9876543215',
			address: {
				city: 'Jaipur',
				state: 'Rajasthan',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Kavya Nair',
			email: 'kavya@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-6.jpg',
			phone: '+91-9876543216',
			address: {
				city: 'Kochi',
				state: 'Kerala',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Suresh Chand',
			email: 'suresh@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-7.jpg',
			phone: '+91-9876543217',
			address: {
				city: 'Jodhpur',
				state: 'Rajasthan',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Priya Patel',
			email: 'priya@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-8.jpg',
			phone: '+91-9876543218',
			address: {
				city: 'Kutch',
				state: 'Gujarat',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Malati Sen',
			email: 'malati@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-9.jpg',
			phone: '+91-9876543219',
			address: {
				city: 'Shantiniketan',
				state: 'West Bengal',
				country: 'India'
			},
			isEmailVerified: true
		},
		{
			name: 'Padma Mohapatra',
			email: 'padma@artisan.com',
			passwordHash: await bcrypt.hash('artisan123', 10),
			role: 'artisan',
			avatar: '/assets/artisan-avatar-10.jpg',
			phone: '+91-9876543220',
			address: {
				city: 'Sambalpur',
				state: 'Odisha',
				country: 'India'
			},
			isEmailVerified: true
		}
	]
}

// Enhanced Artisans Data (matching frontend mock data)
function createSampleArtisans(artisanUsers) {
	return [
		{
			userId: artisanUsers[0]._id,
			name: 'Rajesh Kumar',
			bio: 'Master potter with over 22 years of experience in traditional pottery. Specializes in terracotta and ceramic work using techniques passed down through generations.',
			specialties: ['pottery', 'terracotta', 'ceramic'],
			location: { city: 'Khurja', state: 'Uttar Pradesh', country: 'India' },
			avatar: '/assets/artisan-avatar-1.jpg',
			coverImage: '/assets/artisan-1.jpg',
			rating: 4.8,
			totalRatings: 156,
			totalProducts: 24,
			totalSales: 89,
			joinedDate: new Date('2020-01-15'),
			verification: { 
				isVerified: true,
				documentType: 'aadhar',
				verifiedAt: new Date('2020-02-01')
			},
			isActive: true,
			experience: 22,
			socials: {
				instagram: 'https://instagram.com/rajesh_pottery',
				facebook: 'https://facebook.com/rajeshkumarpottery'
			}
		},
		{
			userId: artisanUsers[1]._id,
			name: 'Fatima Sheikh',
			bio: 'Third-generation pashmina weaver specializing in traditional Kashmiri patterns. Expert in handloom weaving and natural dyeing techniques.',
			specialties: ['textiles', 'pashmina', 'weaving'],
			location: { city: 'Srinagar', state: 'Kashmir', country: 'India' },
			avatar: '/assets/artisan-avatar-2.jpg',
			coverImage: '/assets/artisan-2.jpg',
			rating: 4.9,
			totalRatings: 203,
			totalProducts: 15,
			totalSales: 124,
			joinedDate: new Date('2019-06-10'),
			verification: { 
				isVerified: true,
				documentType: 'pan',
				verifiedAt: new Date('2019-07-01')
			},
			isActive: true,
			experience: 18,
			socials: {
				instagram: 'https://instagram.com/fatima_kashmiri_crafts',
				website: 'https://kashmiricrafts.com'
			}
		},
		{
			userId: artisanUsers[2]._id,
			name: 'Ravi Patel',
			bio: 'Traditional wooden toy maker from Channapatna, known as the toy town of India. Creates beautiful, safe, and eco-friendly toys using natural lacquer.',
			specialties: ['woodwork', 'toys', 'crafts'],
			location: { city: 'Channapatna', state: 'Karnataka', country: 'India' },
			avatar: '/assets/artisan-avatar-3.jpg',
			coverImage: '/assets/artisan-3.jpg',
			rating: 4.7,
			totalRatings: 89,
			totalProducts: 32,
			totalSales: 156,
			joinedDate: new Date('2018-03-22'),
			verification: { 
				isVerified: true,
				documentType: 'aadhar',
				verifiedAt: new Date('2018-04-15')
			},
			isActive: true,
			experience: 15,
			socials: {
				instagram: 'https://instagram.com/channapatna_toys_ravi'
			}
		},
		{
			userId: artisanUsers[3]._id,
			name: 'Anita Sharma',
			bio: 'Skilled in Mysore silk painting and traditional incense making. Creates beautiful spiritual and decorative items with natural materials.',
			specialties: ['paintings', 'crafts', 'spiritual'],
			location: { city: 'Mysore', state: 'Karnataka', country: 'India' },
			avatar: '/assets/artisan-avatar-4.jpg',
			rating: 4.6,
			totalRatings: 67,
			totalProducts: 18,
			totalSales: 45,
			joinedDate: new Date('2020-08-10'),
			verification: { 
				isVerified: true,
				documentType: 'pan',
				verifiedAt: new Date('2020-09-01')
			},
			isActive: true,
			experience: 12
		},
		{
			userId: artisanUsers[4]._id,
			name: 'Vikram Singh',
			bio: 'Master craftsman specializing in blue pottery and traditional Rajasthani ceramic work. Known for intricate patterns and vibrant colors.',
			specialties: ['pottery', 'ceramic', 'blue pottery'],
			location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
			avatar: '/assets/artisan-avatar-5.jpg',
			rating: 4.8,
			totalRatings: 134,
			totalProducts: 28,
			totalSales: 98,
			joinedDate: new Date('2019-01-20'),
			verification: { 
				isVerified: true,
				documentType: 'aadhar',
				verifiedAt: new Date('2019-02-15')
			},
			isActive: true,
			experience: 20
		},
		{
			userId: artisanUsers[5]._id,
			name: 'Kavya Nair',
			bio: 'Traditional Kerala metalwork artist specializing in brass and bronze items. Expert in creating lamps, vessels, and decorative pieces.',
			specialties: ['metalwork', 'brass', 'bronze'],
			location: { city: 'Kochi', state: 'Kerala', country: 'India' },
			avatar: '/assets/artisan-avatar-6.jpg',
			rating: 4.5,
			totalRatings: 78,
			totalProducts: 21,
			totalSales: 62,
			joinedDate: new Date('2020-05-15'),
			verification: { 
				isVerified: true,
				documentType: 'pan',
				verifiedAt: new Date('2020-06-01')
			},
			isActive: true,
			experience: 14
		},
		{
			userId: artisanUsers[6]._id,
			name: 'Suresh Chand',
			bio: 'Leather craftsman from Jodhpur specializing in traditional juttis, bags, and accessories. Uses age-old techniques with modern designs.',
			specialties: ['leather', 'bags', 'footwear'],
			location: { city: 'Jodhpur', state: 'Rajasthan', country: 'India' },
			avatar: '/assets/artisan-avatar-7.jpg',
			rating: 4.4,
			totalRatings: 56,
			totalProducts: 19,
			totalSales: 34,
			joinedDate: new Date('2021-02-10'),
			verification: { 
				isVerified: true,
				documentType: 'aadhar',
				verifiedAt: new Date('2021-03-01')
			},
			isActive: true,
			experience: 16
		},
		{
			userId: artisanUsers[7]._id,
			name: 'Priya Patel',
			bio: 'Ceramic artist from Kutch specializing in spiritual and decorative items. Creates beautiful pottery with traditional Gujarati motifs.',
			specialties: ['pottery', 'ceramic', 'spiritual'],
			location: { city: 'Kutch', state: 'Gujarat', country: 'India' },
			avatar: '/assets/artisan-avatar-8.jpg',
			rating: 4.4,
			totalRatings: 43,
			totalProducts: 15,
			totalSales: 28,
			joinedDate: new Date('2020-11-05'),
			verification: { 
				isVerified: true,
				documentType: 'pan',
				verifiedAt: new Date('2020-12-01')
			},
			isActive: true,
			experience: 10
		},
		{
			userId: artisanUsers[8]._id,
			name: 'Malati Sen',
			bio: 'Expert in Kantha embroidery continuing the rich tradition of Bengali needlework. Creates beautiful textiles with intricate stitching.',
			specialties: ['textiles', 'embroidery', 'kantha'],
			location: { city: 'Shantiniketan', state: 'West Bengal', country: 'India' },
			avatar: '/assets/artisan-avatar-9.jpg',
			rating: 4.7,
			totalRatings: 89,
			totalProducts: 23,
			totalSales: 67,
			joinedDate: new Date('2019-09-12'),
			verification: { 
				isVerified: true,
				documentType: 'aadhar',
				verifiedAt: new Date('2019-10-01')
			},
			isActive: true,
			experience: 19
		},
		{
			userId: artisanUsers[9]._id,
			name: 'Padma Mohapatra',
			bio: 'Master weaver specializing in traditional Ikat technique with 25+ years experience. Known for creating the finest silk sarees with intricate geometric patterns.',
			specialties: ['textiles', 'ikat', 'silk weaving'],
			location: { city: 'Sambalpur', state: 'Odisha', country: 'India' },
			avatar: '/assets/artisan-avatar-10.jpg',
			rating: 4.9,
			totalRatings: 167,
			totalProducts: 11,
			totalSales: 89,
			joinedDate: new Date('2018-07-20'),
			verification: { 
				isVerified: true,
				documentType: 'pan',
				verifiedAt: new Date('2018-08-15')
			},
			isActive: true,
			experience: 25
		}
	]
}

// Comprehensive Products Data (matching frontend mock data)
function createSampleProducts(artisans) {
	return [
		// Pottery Products
		{
			name: 'Handcrafted Terracotta Vase',
			description: 'Beautiful traditional terracotta vase with intricate patterns, perfect for home decoration. Made using ancient pottery techniques passed down through generations.',
			price: 1299,
			originalPrice: 1599,
			images: ['/assets/terracotta-vase.jpg'],
			artisanId: artisans[0]._id, // Rajesh Kumar
			category: 'pottery',
			subcategory: 'vases',
			materials: ['Terracotta', 'Natural Clay'],
			dimensions: { length: 15, width: 15, height: 20, unit: 'cm' },
			weight: 800,
			colors: ['Terracotta', 'Brown'],
			tags: ['handmade', 'traditional', 'home-decor'],
			stock: 12,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.6,
			reviewCount: 28,
			isFeatured: true,
			isActive: true
		},
		{
			name: 'Blue Pottery Tea Set',
			description: 'Exquisite blue pottery tea set with traditional Jaipur craftsmanship. Includes 4 cups, saucers, teapot, and serving tray.',
			price: 2499,
			originalPrice: 2999,
			images: ['/assets/blue-pottery-set.jpg'],
			artisanId: artisans[4]._id, // Vikram Singh
			category: 'pottery',
			subcategory: 'tea sets',
			materials: ['Ceramic', 'Blue Glaze'],
			dimensions: { length: 30, width: 25, height: 15, unit: 'cm' },
			weight: 1200,
			colors: ['Blue', 'White'],
			tags: ['blue pottery', 'tea set', 'jaipur'],
			stock: 8,
			isHandmade: true,
			shippingTime: '5-7 days',
			rating: 4.8,
			reviewCount: 45,
			isFeatured: true,
			isActive: true
		},

		// Textile Products
		{
			name: 'Handwoven Kashmiri Shawl',
			description: 'Exquisite handwoven Kashmiri shawl made with traditional techniques passed down through generations. Pure pashmina wool with intricate embroidery.',
			price: 4500,
			originalPrice: 5200,
			images: ['/assets/kashmiri-shawl.jpg'],
			artisanId: artisans[1]._id, // Fatima Sheikh
			category: 'textiles',
			subcategory: 'shawls',
			materials: ['Pashmina Wool', 'Natural Dyes'],
			dimensions: { length: 200, width: 70, height: 1, unit: 'cm' },
			weight: 200,
			colors: ['Beige', 'Brown', 'Gold'],
			tags: ['handmade', 'kashmiri', 'shawl', 'pashmina'],
			stock: 5,
			isHandmade: true,
			shippingTime: '7-10 days',
			rating: 4.9,
			reviewCount: 67,
			isFeatured: true,
			isActive: true
		},
		{
			name: 'Pure Pashmina Stole',
			description: 'Luxurious pure Pashmina stole with intricate hand embroidery and fine craftsmanship. Perfect for special occasions.',
			price: 6200,
			originalPrice: 7000,
			images: ['/assets/silk-scarf.jpg'],
			artisanId: artisans[1]._id, // Fatima Sheikh
			category: 'textiles',
			subcategory: 'stoles',
			materials: ['Pure Pashmina', 'Silk Thread'],
			dimensions: { length: 180, width: 60, height: 1, unit: 'cm' },
			weight: 150,
			colors: ['Cream', 'Gold', 'Rose'],
			tags: ['luxury', 'handwoven', 'kashmiri'],
			stock: 3,
			isHandmade: true,
			shippingTime: '10-14 days',
			rating: 4.8,
			reviewCount: 32,
			isFeatured: true,
			isActive: true
		},
		{
			name: 'Handwoven Cotton Bedsheet Set',
			description: 'Pure cotton bedsheet set with traditional block prints. Includes 1 bedsheet and 2 pillowcases. Comfortable and breathable.',
			price: 899,
			images: ['/assets/cotton-bedsheet.jpg'],
			artisanId: artisans[8]._id, // Malati Sen
			category: 'textiles',
			subcategory: 'bedding',
			materials: ['Cotton'],
			dimensions: { length: 220, width: 150, height: 1, unit: 'cm' },
			weight: 600,
			colors: ['White', 'Blue', 'Red'],
			tags: ['cotton', 'bedding', 'block-print'],
			stock: 15,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.5,
			reviewCount: 23,
			isActive: true
		},
		{
			name: 'Kantha Embroidered Stole',
			description: 'Beautiful Kantha embroidered stole showcasing traditional Bengali needlework with vibrant colors and intricate patterns.',
			price: 1899,
			images: ['/assets/kantha-stole.jpg'],
			artisanId: artisans[8]._id, // Malati Sen
			category: 'textiles',
			subcategory: 'stoles',
			materials: ['Cotton', 'Silk Thread'],
			dimensions: { length: 170, width: 50, height: 1, unit: 'cm' },
			weight: 120,
			colors: ['Multicolor', 'Red', 'Yellow'],
			tags: ['kantha', 'embroidery', 'bengali'],
			stock: 12,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.5,
			reviewCount: 14,
			isActive: true
		},
		{
			name: 'Ikat Silk Saree',
			description: 'Stunning Ikat silk saree with traditional geometric patterns. Hand-woven using the ancient tie-dye technique with premium silk.',
			price: 8500,
			originalPrice: 9500,
			images: ['/assets/ikat-saree.jpg'],
			artisanId: artisans[9]._id, // Padma Mohapatra
			category: 'textiles',
			subcategory: 'sarees',
			materials: ['Silk', 'Natural Dyes'],
			dimensions: { length: 550, width: 110, height: 1, unit: 'cm' },
			weight: 400,
			colors: ['Deep Blue', 'Silver'],
			tags: ['ikat', 'silk', 'saree'],
			stock: 4,
			isHandmade: true,
			shippingTime: '7-10 days',
			rating: 4.8,
			reviewCount: 13,
			isFeatured: true,
			isActive: true
		},
		{
			name: 'Jute Shopping Bag',
			description: 'Eco-friendly jute shopping bag with colorful geometric patterns. Durable and sustainable alternative to plastic bags.',
			price: 399,
			images: ['/assets/jute-bag.jpg'],
			artisanId: artisans[8]._id, // Malati Sen
			category: 'textiles',
			subcategory: 'bags',
			materials: ['Jute', 'Cotton Handles'],
			dimensions: { length: 35, width: 10, height: 40, unit: 'cm' },
			weight: 200,
			colors: ['Natural', 'Multicolor'],
			tags: ['eco-friendly', 'jute', 'sustainable'],
			stock: 25,
			isHandmade: true,
			shippingTime: '2-4 days',
			rating: 4.3,
			reviewCount: 18,
			isActive: true
		},
		{
			name: 'Bandhani Dupatta',
			description: 'Traditional Bandhani tie-dye dupatta from Gujarat with vibrant colors and mirror work. Perfect for ethnic wear.',
			price: 1299,
			images: ['/assets/bandhani-dupatta.jpg'],
			artisanId: artisans[7]._id, // Priya Patel
			category: 'textiles',
			subcategory: 'dupatta',
			materials: ['Cotton', 'Mirror Work'],
			dimensions: { length: 220, width: 90, height: 1, unit: 'cm' },
			weight: 150,
			colors: ['Red', 'Yellow', 'Green'],
			tags: ['bandhani', 'tie-dye', 'gujarati'],
			stock: 18,
			isHandmade: true,
			shippingTime: '4-6 days',
			rating: 4.4,
			reviewCount: 22,
			isActive: true
		},

		// Craft Products
		{
			name: 'Wooden Educational Toy Set',
			description: 'Set of 12 handcrafted wooden toys designed to enhance children\'s learning and creativity. Made from sustainable wood with natural lacquer.',
			price: 899,
			images: ['/assets/wooden-toys.jpg'],
			artisanId: artisans[2]._id, // Ravi Patel
			category: 'crafts',
			subcategory: 'toys',
			materials: ['Sustainable Wood', 'Natural Lacquer'],
			dimensions: { length: 25, width: 20, height: 15, unit: 'cm' },
			weight: 600,
			colors: ['Natural Wood', 'Multicolor'],
			tags: ['educational', 'wooden toys', 'children'],
			stock: 20,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.7,
			reviewCount: 34,
			isActive: true
		},
		{
			name: 'Copper Water Bottle',
			description: 'Pure copper water bottle with traditional engravings. Known for its health benefits and antimicrobial properties.',
			price: 799,
			originalPrice: 999,
			images: ['/assets/copper-bottle.jpg'],
			artisanId: artisans[5]._id, // Kavya Nair
			category: 'crafts',
			subcategory: 'bottles',
			materials: ['Pure Copper'],
			dimensions: { length: 7, width: 7, height: 25, unit: 'cm' },
			weight: 250,
			colors: ['Copper'],
			tags: ['copper', 'health', 'ayurvedic'],
			stock: 30,
			isHandmade: true,
			shippingTime: '2-4 days',
			rating: 4.6,
			reviewCount: 52,
			isActive: true
		},
		{
			name: 'Brass Decorative Bowl',
			description: 'Elegant brass bowl with engraved patterns, perfect for serving or decoration. Traditional craftsmanship with modern appeal.',
			price: 675,
			images: ['/assets/brass-bowl.jpg'],
			artisanId: artisans[5]._id, // Kavya Nair
			category: 'crafts',
			subcategory: 'bowls',
			materials: ['Brass'],
			dimensions: { length: 20, width: 20, height: 8, unit: 'cm' },
			weight: 450,
			colors: ['Gold'],
			tags: ['brass', 'decorative', 'serving'],
			stock: 12,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.7,
			reviewCount: 31,
			isActive: true
		},
		{
			name: 'Metal Craft Lamp',
			description: 'Handcrafted metal lamp with intricate cut-work design. Creates beautiful shadow patterns when lit, perfect for ambient lighting.',
			price: 2299,
			images: ['/assets/metal-lamp.jpg'],
			artisanId: artisans[5]._id, // Kavya Nair
			category: 'crafts',
			subcategory: 'lighting',
			materials: ['Brass', 'Iron'],
			dimensions: { length: 15, width: 15, height: 30, unit: 'cm' },
			weight: 800,
			colors: ['Bronze', 'Gold'],
			tags: ['lighting', 'decorative', 'metal craft'],
			stock: 8,
			isHandmade: true,
			shippingTime: '5-7 days',
			rating: 4.5,
			reviewCount: 19,
			isActive: true
		},
		{
			name: 'Madhubani Painting',
			description: 'Authentic Madhubani painting on handmade paper depicting traditional motifs and stories. Vibrant natural colors and intricate details.',
			price: 1899,
			images: ['/assets/madhubani-painting.jpg'],
			artisanId: artisans[3]._id, // Anita Sharma
			category: 'crafts',
			subcategory: 'paintings',
			materials: ['Handmade Paper', 'Natural Colors'],
			dimensions: { length: 30, width: 1, height: 40, unit: 'cm' },
			weight: 100,
			colors: ['Multicolor'],
			tags: ['madhubani', 'painting', 'traditional art'],
			stock: 6,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.8,
			reviewCount: 15,
			isActive: true
		},
		{
			name: 'Ceramic Incense Holder',
			description: 'Beautifully crafted ceramic incense holder with spiritual motifs. Perfect for meditation and aromatherapy sessions.',
			price: 449,
			images: ['/assets/incense-holder.jpg'],
			artisanId: artisans[7]._id, // Priya Patel
			category: 'crafts',
			subcategory: 'spiritual',
			materials: ['Ceramic', 'Natural Glaze'],
			dimensions: { length: 12, width: 8, height: 6, unit: 'cm' },
			weight: 200,
			colors: ['Blue', 'White'],
			tags: ['spiritual', 'ceramic', 'meditation'],
			stock: 30,
			isHandmade: true,
			shippingTime: '2-4 days',
			rating: 4.3,
			reviewCount: 19,
			isActive: true
		},
		{
			name: 'Dhokra Elephant',
			description: 'Traditional Dhokra metal casting art elephant figurine. Ancient lost-wax technique with tribal motifs and patterns.',
			price: 1599,
			images: ['/assets/dhokra-elephant.jpg'],
			artisanId: artisans[5]._id, // Kavya Nair
			category: 'crafts',
			subcategory: 'figurines',
			materials: ['Brass', 'Bronze'],
			dimensions: { length: 15, width: 8, height: 12, unit: 'cm' },
			weight: 400,
			colors: ['Bronze', 'Gold'],
			tags: ['dhokra', 'tribal art', 'elephant'],
			stock: 10,
			isHandmade: true,
			shippingTime: '4-6 days',
			rating: 4.6,
			reviewCount: 24,
			isActive: true
		},
		{
			name: 'Stone Carved Coasters',
			description: 'Set of 4 intricately carved stone coasters with traditional patterns. Heat-resistant and perfect for serving tea or coffee.',
			price: 699,
			images: ['/assets/stone-coasters.jpg'],
			artisanId: artisans[3]._id, // Anita Sharma
			category: 'crafts',
			subcategory: 'home accessories',
			materials: ['Natural Stone'],
			dimensions: { length: 10, width: 10, height: 1, unit: 'cm' },
			weight: 300,
			colors: ['Grey', 'Beige'],
			tags: ['stone craft', 'coasters', 'home decor'],
			stock: 22,
			isHandmade: true,
			shippingTime: '3-5 days',
			rating: 4.4,
			reviewCount: 17,
			isActive: true
		},
		{
			name: 'Wooden Jewelry Box',
			description: 'Handcrafted wooden jewelry box with multiple compartments and traditional carvings. Perfect for organizing jewelry and accessories.',
			price: 1299,
			images: ['/assets/jewelry-box.jpg'],
			artisanId: artisans[2]._id, // Ravi Patel
			category: 'crafts',
			subcategory: 'storage',
			materials: ['Sheesham Wood', 'Brass Fittings'],
			dimensions: { length: 20, width: 15, height: 8, unit: 'cm' },
			weight: 500,
			colors: ['Brown', 'Natural Wood'],
			tags: ['wooden', 'jewelry box', 'storage'],
			stock: 14,
			isHandmade: true,
			shippingTime: '4-6 days',
			rating: 4.5,
			reviewCount: 26,
			isActive: true
		},
		{
			name: 'Kalamkari Wall Hanging',
			description: 'Traditional Kalamkari wall hanging with hand-painted mythological scenes. Natural dyes and cotton fabric with intricate details.',
			price: 2199,
			images: ['/assets/kalamkari-wall.jpg'],
			artisanId: artisans[3]._id, // Anita Sharma
			category: 'crafts',
			subcategory: 'wall art',
			materials: ['Cotton Fabric', 'Natural Dyes'],
			dimensions: { length: 60, width: 1, height: 90, unit: 'cm' },
			weight: 300,
			colors: ['Multicolor', 'Earth Tones'],
			tags: ['kalamkari', 'wall hanging', 'traditional art'],
			stock: 8,
			isHandmade: true,
			shippingTime: '5-7 days',
			rating: 4.7,
			reviewCount: 21,
			isActive: true
		}
	]
}

async function seedDatabase() {
	try {
		console.log('🌱 Starting comprehensive database seed...')
		
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

		// Create artisans (link to artisan users)
		const artisanUsers = users.filter(user => user.role === 'artisan')
		const sampleArtisans = createSampleArtisans(artisanUsers)
		const artisans = await Artisan.insertMany(sampleArtisans)
		console.log(`🎨 Created ${artisans.length} artisans`)

		// Create products
		const sampleProducts = createSampleProducts(artisans)
		const products = await Product.insertMany(sampleProducts)
		console.log(`🛍️  Created ${products.length} products`)

		// Update artisan product counts
		for (const artisan of artisans) {
			const productCount = products.filter(p => p.artisanId.equals(artisan._id)).length
			await Artisan.findByIdAndUpdate(artisan._id, { totalProducts: productCount })
		}
		console.log('📊 Updated artisan product counts')

		console.log('✅ Comprehensive database seeded successfully!')
		console.log(`
📈 Summary:
- Users: ${users.length}
- Artisans: ${artisans.length}  
- Products: ${products.length}
- Categories: pottery, textiles, crafts
- Features: Reviews, ratings, inventory tracking
		`)
		
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