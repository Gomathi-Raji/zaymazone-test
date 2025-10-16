import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import Order from '../models/Order.js'
import Category from '../models/Category.js'
import BlogPost from '../models/BlogPost.js'
import Comment from '../models/Comment.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Helper function to generate tokens
const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { sub: userId, email }, 
    process.env.JWT_SECRET || 'dev-secret', 
    { expiresIn: '8h' } // Longer session for admin
  )
  
  const refreshToken = crypto.randomBytes(64).toString('hex')
  
  return { accessToken, refreshToken }
}

// Admin Login Schema
const adminLoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(128),
})

// Admin Login Endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const parsed = adminLoginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials' })
    
    const { email, password } = parsed.data
    
    // Find user with admin role
    const user = await User.findOne({ email, role: 'admin', isActive: true })
    
    // If admin user doesn't exist, create default admin users
    if (!user) {
      const defaultAdmins = [
        { email: 'admin@zaymazone.com', password: 'admin123', name: 'Administrator' },
        { email: 'dinesh_admin@zaymazone.com', password: 'dinesh123', name: 'Dinesh Admin' }
      ]
      
      const matchingAdmin = defaultAdmins.find(admin => admin.email === email && admin.password === password)
      
      if (matchingAdmin) {
        // Create the admin user
        const passwordHash = await bcrypt.hash(matchingAdmin.password, 10)
        const newAdmin = await User.create({
          name: matchingAdmin.name,
          email: matchingAdmin.email,
          passwordHash,
          role: 'admin',
          isEmailVerified: true,
          authProvider: 'local'
        })
        
        const { accessToken, refreshToken } = generateTokens(newAdmin._id, email)
        
        // Store refresh token
        const refreshTokenExpiry = new Date()
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30)
        
        newAdmin.refreshTokens.push({
          token: refreshToken,
          expiresAt: refreshTokenExpiry,
          deviceInfo: req.headers['user-agent'] || 'Admin Panel'
        })
        newAdmin.lastLogin = new Date()
        await newAdmin.save()
        
        return res.json({
          success: true,
          accessToken,
          refreshToken,
          user: {
            id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
          }
        })
      }
      
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }
    
    // Verify password
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    
    const { accessToken, refreshToken } = generateTokens(user._id, email)
    
    // Store refresh token
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30)
    
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
      deviceInfo: req.headers['user-agent'] || 'Admin Panel'
    })
    user.lastLogin = new Date()
    await user.save()
    
    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Utility function to log admin actions
const logAdminAction = (user, action, resource, resourceId, details, req) => {
  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    user: user?.email || 'admin@example.com',
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  // In production, this would be saved to a database
  console.log('Admin Action Logged:', logEntry)

  // For now, we'll store in memory (in production, use a database)
  if (!global.auditLogs) {
    global.auditLogs = []
  }
  global.auditLogs.unshift(logEntry)

  // Keep only last 1000 entries
  if (global.auditLogs.length > 1000) {
    global.auditLogs = global.auditLogs.slice(0, 1000)
  }
}

// Admin Statistics Endpoint
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [
      totalProducts,
      activeArtisans,
      todayOrders,
      totalUsers,
      pendingProducts,
      pendingArtisans,
      totalRevenue,
      monthlyStats
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Artisan.countDocuments({ isActive: true }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Artisan.countDocuments({ isActive: false }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
          }
        },
        {
          $group: {
            _id: { month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.month': 1 } }
      ])
    ])

    const revenue = totalRevenue[0]?.total || 0
    const averageOrderValue = todayOrders > 0 ? revenue / todayOrders : 0

    res.json({
      stats: {
        totalProducts,
        activeArtisans,
        todayOrders,
        totalUsers,
        totalRevenue: revenue,
        averageOrderValue: Math.round(averageOrderValue),
        pendingApprovals: {
          products: pendingProducts,
          artisans: pendingArtisans
        }
      },
      monthlyStats: monthlyStats.map(stat => ({
        month: new Date(2024, stat._id.month - 1).toLocaleDateString('en', { month: 'short' }),
        revenue: stat.revenue,
        orders: stat.orders
      }))
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: 'Failed to fetch admin statistics' })
  }
})

// Approval Management Endpoints
router.get('/approvals/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ isActive: false })
      .populate('artisanId', 'name email')
      .sort({ createdAt: -1 })

    res.json({ products: pendingProducts })
  } catch (error) {
    console.error('Get pending products error:', error)
    res.status(500).json({ error: 'Failed to fetch pending products' })
  }
})

router.get('/approvals/artisans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingArtisans = await Artisan.find({ 'verification.isVerified': false })
      .sort({ createdAt: -1 })

    res.json({ artisans: pendingArtisans })
  } catch (error) {
    console.error('Get pending artisans error:', error)
    res.status(500).json({ error: 'Failed to fetch pending artisans' })
  }
})

router.get('/approvals/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      isActive: false,
      role: { $ne: 'admin' }
    }).sort({ createdAt: -1 })

    res.json({ users: pendingUsers })
  } catch (error) {
    console.error('Get pending users error:', error)
    res.status(500).json({ error: 'Failed to fetch pending users' })
  }
})

router.post('/approvals/products/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: true
      },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product approved successfully', product })
  } catch (error) {
    console.error('Approve product error:', error)
    res.status(500).json({ error: 'Failed to approve product' })
  }
})

router.post('/approvals/products/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false
      },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product rejected successfully', product })
  } catch (error) {
    console.error('Reject product error:', error)
    res.status(500).json({ error: 'Failed to reject product' })
  }
})

router.post('/approvals/artisans/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { 
        'verification.isVerified': true,
        'verification.verifiedAt': new Date()
      },
      { new: true }
    )

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' })
    }

    res.json({ message: 'Artisan approved successfully', artisan })
  } catch (error) {
    console.error('Approve artisan error:', error)
    res.status(500).json({ error: 'Failed to approve artisan' })
  }
})

router.post('/approvals/artisans/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { 
        'verification.isVerified': false
      },
      { new: true }
    )

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' })
    }

    res.json({ message: 'Artisan rejected successfully', artisan })
  } catch (error) {
    console.error('Reject artisan error:', error)
    res.status(500).json({ error: 'Failed to reject artisan' })
  }
})

// User Management
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, role } = req.query
    
    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (status) filter.status = status
    if (role) filter.role = role

    const users = await User.find(filter)
      .select('-passwordHash -refreshTokens -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.put('/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-passwordHash -refreshTokens')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User status updated successfully', user })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

router.put('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash -refreshTokens')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User role updated successfully', user })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Orders Management
router.get('/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    
    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ]
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .populate('items.artisan', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(filter)

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.put('/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ message: 'Order status updated successfully', order })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// Analytics
router.get('/analytics/sales', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case '7days':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case '30days':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case '90days':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case '1year':
        dateFilter = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) }
        break
    }

    const [salesData, topProducts, categoryData] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: dateFilter, status: 'completed' } },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: dateFilter, status: 'completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $sort: { sales: -1 } },
        { $limit: 10 }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    res.json({
      salesData: salesData.map(item => ({
        date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
        revenue: item.revenue,
        orders: item.orders
      })),
      topProducts: topProducts.map(item => ({
        name: item.product.name,
        sales: item.sales,
        revenue: item.revenue
      })),
      categoryData: categoryData.map(item => ({
        name: item._id,
        value: item.count
      }))
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
})

// Activities Endpoint
router.get('/activities', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50

    // Get recent products
    const recentProducts = await Product.find({})
      .populate('artisan', 'name')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .select('name createdAt artisan')

    // Get recent artisans
    const recentArtisans = await Artisan.find({})
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .select('name createdAt')

    // Get recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 3))
      .select('totalAmount status createdAt user')

    const activities = []

    // Add product activities
    recentProducts.forEach(product => {
      activities.push({
        id: `product_${product._id}`,
        type: 'product',
        action: 'Product added',
        details: `${product.name} was added to the marketplace`,
        timestamp: product.createdAt,
        user: product.artisan?.name || 'System',
        icon: 'Package',
        color: 'text-blue-600'
      })
    })

    // Add artisan activities
    recentArtisans.forEach(artisan => {
      activities.push({
        id: `artisan_${artisan._id}`,
        type: 'user',
        action: 'Artisan registered',
        details: `${artisan.name} joined as an artisan`,
        timestamp: artisan.createdAt,
        user: 'System',
        icon: 'User',
        color: 'text-green-600'
      })
    })

    // Add order activities
    recentOrders.forEach(order => {
      activities.push({
        id: `order_${order._id}`,
        type: 'order',
        action: 'Order placed',
        details: `Order #${order._id.toString().slice(-8)} for ₹${order.totalAmount}`,
        timestamp: order.createdAt,
        user: order.user?.name || 'Customer',
        icon: 'CreditCard',
        color: 'text-purple-600'
      })
    })

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    res.json({
      activities: activities.slice(0, limit),
      total: activities.length
    })
  } catch (error) {
    console.error('Activities error:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// Notifications Endpoint
router.get('/notifications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const notifications = []

    // Get pending products
    const pendingProducts = await Product.countDocuments({ status: 'pending' })
    if (pendingProducts > 0) {
      notifications.push({
        id: 'pending_products',
        type: 'warning',
        title: 'Pending Products',
        message: `${pendingProducts} product(s) awaiting approval`,
        timestamp: new Date(),
        action: 'Review Products',
        actionUrl: '/admin/products',
        icon: 'Package',
        color: 'text-yellow-600'
      })
    }

    // Get pending artisans
    const pendingArtisans = await Artisan.countDocuments({ status: 'pending' })
    if (pendingArtisans > 0) {
      notifications.push({
        id: 'pending_artisans',
        type: 'warning',
        title: 'Pending Artisans',
        message: `${pendingArtisans} artisan(s) awaiting approval`,
        timestamp: new Date(),
        action: 'Review Artisans',
        actionUrl: '/admin/artisans',
        icon: 'User',
        color: 'text-yellow-600'
      })
    }

    // Get low stock products
    const lowStockProducts = await Product.find({
      status: 'active',
      stockCount: { $lte: 5, $gt: 0 }
    }).select('name stockCount').limit(5)

    if (lowStockProducts.length > 0) {
      notifications.push({
        id: 'low_stock',
        type: 'info',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} product(s) running low on stock`,
        timestamp: new Date(),
        action: 'Manage Inventory',
        actionUrl: '/admin/products',
        icon: 'AlertTriangle',
        color: 'text-orange-600'
      })
    }

    // Get recent orders
    const recentOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    })

    if (recentOrders > 0) {
      notifications.push({
        id: 'recent_orders',
        type: 'success',
        title: 'New Orders',
        message: `${recentOrders} order(s) placed in the last 24 hours`,
        timestamp: new Date(),
        action: 'View Orders',
        actionUrl: '/admin/orders',
        icon: 'CreditCard',
        color: 'text-green-600'
      })
    }

    res.json({
      notifications,
      total: notifications.length
    })
  } catch (error) {
    console.error('Notifications error:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// Admin Products CRUD Endpoints
router.get('/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || 'all'
    const search = req.query.search || ''

    let query = {}
    if (status !== 'all') {
      query.isActive = status === 'active'
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(query)
      .populate('artisanId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin products fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.post('/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const product = new Product(productData)
    await product.save()

    res.status(201).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    console.error('Admin product creation error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

router.get('/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisanId', 'name')

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ product })
  } catch (error) {
    console.error('Admin product fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

router.put('/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('artisanId', 'name')

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    console.error('Admin product update error:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

router.delete('/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Admin product deletion error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// Admin Artisans CRUD Endpoints
router.get('/artisans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || 'all'
    const search = req.query.search || ''

    let query = {}
    if (status !== 'all') {
      query.status = status
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { speciality: { $regex: search, $options: 'i' } }
      ]
    }

    const artisans = await Artisan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Artisan.countDocuments(query)

    res.json({
      artisans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin artisans fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch artisans' })
  }
})

router.post('/artisans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisanData = {
      ...req.body,
      status: req.body.status || 'active',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      verification: req.body.verification || {
        isVerified: false,
        documents: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const artisan = new Artisan(artisanData)
    await artisan.save()

    res.status(201).json({
      message: 'Artisan created successfully',
      artisan
    })
  } catch (error) {
    console.error('Admin artisan creation error:', error)
    res.status(500).json({ error: 'Failed to create artisan' })
  }
})

router.get('/artisans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id).populate('userId', 'name email')

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' })
    }

    res.json({ artisan })
  } catch (error) {
    console.error('Admin artisan fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch artisan' })
  }
})

router.put('/artisans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' })
    }

    res.json({
      message: 'Artisan updated successfully',
      artisan
    })
  } catch (error) {
    console.error('Admin artisan update error:', error)
    res.status(500).json({ error: 'Failed to update artisan' })
  }
})

router.delete('/artisans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndDelete(req.params.id)

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' })
    }

    res.json({
      message: 'Artisan deleted successfully'
    })
  } catch (error) {
    console.error('Admin artisan deletion error:', error)
    res.status(500).json({ error: 'Failed to delete artisan' })
  }
})

// Page Content Management Endpoints
router.get('/page-content', requireAuth, requireAdmin, async (req, res) => {
  try {
    // For now, return mock data. In production, this would come from a database
    const pageContents = [
      {
        id: "shop",
        page: "Shop",
        title: "Shop Artisan Crafts",
        description: "Discover authentic handcrafted treasures from skilled artisans across India",
        lastUpdated: "2024-01-15",
        updatedBy: "Admin"
      },
      {
        id: "artisans",
        page: "Artisans",
        title: "Meet Our Artisans",
        description: "Discover the talented craftspeople behind our beautiful products. Each artisan brings decades of experience and passion to their craft, preserving ancient traditions while creating contemporary masterpieces.",
        lastUpdated: "2024-01-15",
        updatedBy: "Admin"
      },
      {
        id: "categories",
        page: "Categories",
        title: "Explore Categories",
        description: "Browse our curated collection of handcrafted products organized by traditional craft categories",
        lastUpdated: "2024-01-15",
        updatedBy: "Admin"
      },
      {
        id: "blog",
        page: "Blog",
        title: "Craft Stories & Insights",
        description: "Read about the stories behind the crafts, artisan journeys, and insights into India's rich craft heritage",
        lastUpdated: "2024-01-15",
        updatedBy: "Admin"
      }
    ]

    res.json({ pageContents })
  } catch (error) {
    console.error('Get page content error:', error)
    res.status(500).json({ error: 'Failed to fetch page content' })
  }
})

router.put('/page-content/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required and must be a non-empty string' })
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' })
    }

    if (description.length > 1000) {
      return res.status(400).json({ error: 'Description must be less than 1000 characters' })
    }

    // In production, this would update a database
    // For now, just return success
    const updatedContent = {
      id,
      title: title.trim(),
      description: description.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: req.user?.name || req.user?.email || 'Admin'
    }

    // Log the admin action
    logAdminAction(req.user, 'UPDATE', 'page-content', id, `Updated ${id} page content`, req)

    res.json({
      message: 'Page content updated successfully',
      content: updatedContent
    })
  } catch (error) {
    console.error('Update page content error:', error)
    res.status(500).json({ error: 'Failed to update page content' })
  }
})

// Categories Management Endpoints
router.get('/categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, featured, status = 'active' } = req.query
    
    const query = {}
    if (status === 'active') query.isActive = true
    if (featured !== undefined) query.featured = featured === 'true'
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const categories = await Category.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Category.countDocuments(query)

    // Update counts before sending
    await Category.updateCounts()

    // Transform for frontend compatibility
    const transformedCategories = categories.map(cat => ({
      id: cat.slug,
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      icon: cat.icon,
      subcategories: cat.subcategories,
      featured: cat.featured,
      productCount: cat.productCount,
      artisanCount: cat.artisanCount,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))

    res.json({ 
      categories: transformedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.post('/categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      image, 
      icon, 
      subcategories, 
      featured, 
      displayOrder,
      seoTitle,
      seoDescription
    } = req.body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required and must be a non-empty string' })
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name must be less than 100 characters' })
    }

    if (description.length > 500) {
      return res.status(400).json({ error: 'Description must be less than 500 characters' })
    }

    if (!image || !image.trim()) {
      return res.status(400).json({ error: 'Category image is required' })
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true 
    })
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' })
    }

    // Create new category
    const categoryData = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      icon: icon || 'Gift',
      subcategories: Array.isArray(subcategories) ? subcategories.filter(sub => sub && sub.trim()) : [],
      featured: Boolean(featured),
      displayOrder: displayOrder || 0,
      seoTitle: seoTitle ? seoTitle.trim() : undefined,
      seoDescription: seoDescription ? seoDescription.trim() : undefined
    }

    const newCategory = new Category(categoryData)
    await newCategory.save()

    // Log the admin action
    logAdminAction(req.user, 'CREATE', 'categories', newCategory._id, `Created new category: ${name.trim()}`, req)

    // Transform for frontend compatibility
    const responseCategory = {
      id: newCategory.slug,
      _id: newCategory._id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      image: newCategory.image,
      icon: newCategory.icon,
      subcategories: newCategory.subcategories,
      featured: newCategory.featured,
      productCount: newCategory.productCount,
      artisanCount: newCategory.artisanCount,
      displayOrder: newCategory.displayOrder,
      isActive: newCategory.isActive,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt
    }

    res.status(201).json({
      message: 'Category created successfully',
      category: responseCategory
    })
  } catch (error) {
    console.error('Create category error:', error)
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category with this name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create category' })
    }
  }
})

router.put('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { 
      name, 
      description, 
      image, 
      icon, 
      subcategories, 
      featured, 
      displayOrder,
      seoTitle,
      seoDescription
    } = req.body

    // Find category by MongoDB _id or slug
    const category = await Category.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id }
      ],
      isActive: true
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Validation
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name must be a non-empty string' })
    }

    if (description && (typeof description !== 'string' || description.trim().length === 0)) {
      return res.status(400).json({ error: 'Description must be a non-empty string' })
    }

    if (name && name.length > 100) {
      return res.status(400).json({ error: 'Name must be less than 100 characters' })
    }

    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description must be less than 500 characters' })
    }

    // Check if another category with same name exists (if name is being changed)
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        isActive: true,
        _id: { $ne: category._id }
      })
      
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' })
      }
    }

    // Update fields
    if (name) category.name = name.trim()
    if (description) category.description = description.trim()
    if (image) category.image = image.trim()
    if (icon) category.icon = icon
    if (subcategories !== undefined) {
      category.subcategories = Array.isArray(subcategories) ? subcategories.filter(sub => sub && sub.trim()) : []
    }
    if (featured !== undefined) category.featured = Boolean(featured)
    if (displayOrder !== undefined) category.displayOrder = displayOrder
    if (seoTitle !== undefined) category.seoTitle = seoTitle ? seoTitle.trim() : undefined
    if (seoDescription !== undefined) category.seoDescription = seoDescription ? seoDescription.trim() : undefined

    await category.save()

    // Log the admin action
    logAdminAction(req.user, 'UPDATE', 'categories', category._id, `Updated category: ${category.name}`, req)

    // Transform for frontend compatibility
    const responseCategory = {
      id: category.slug,
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      subcategories: category.subcategories,
      featured: category.featured,
      productCount: category.productCount,
      artisanCount: category.artisanCount,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }

    res.json({
      message: 'Category updated successfully',
      category: responseCategory
    })
  } catch (error) {
    console.error('Update category error:', error)
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category with this name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update category' })
    }
  }
})

router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Find category by MongoDB _id or slug
    const category = await Category.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id }
      ],
      isActive: true
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Check if there are products using this category
    const productsUsingCategory = await Product.countDocuments({ 
      category: { $in: [category.slug, category.name.toLowerCase()] },
      isActive: true 
    })

    if (productsUsingCategory > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${productsUsingCategory} products are using this category.` 
      })
    }

    // Soft delete by setting isActive to false
    category.isActive = false
    await category.save()

    // Log the admin action
    logAdminAction(req.user, 'DELETE', 'categories', category._id, `Deleted category: ${category.name}`, req)

    res.json({
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

// Blog Management Endpoints
router.get('/blog-posts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status, featured, author } = req.query
    
    const query = { isActive: true }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }
    if (category) query.category = category
    if (status) query.status = status
    if (featured !== undefined) query.featured = featured === 'true'
    if (author) query['author.name'] = { $regex: author, $options: 'i' }

    const blogPosts = await BlogPost.find(query)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await BlogPost.countDocuments(query)

    res.json({ 
      posts: blogPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get blog posts error:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

router.post('/blog-posts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      title, 
      excerpt, 
      content, 
      featuredImage, 
      images,
      author, 
      category, 
      tags, 
      status,
      featured, 
      readTime,
      seoTitle,
      seoDescription
    } = req.body

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ error: 'Excerpt is required' })
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }
    if (!featuredImage || !featuredImage.trim()) {
      return res.status(400).json({ error: 'Featured image is required' })
    }
    if (!author || !author.name || !author.name.trim()) {
      return res.status(400).json({ error: 'Author name is required' })
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required' })
    }

    // Check if post with same title already exists
    const existingPost = await BlogPost.findOne({ 
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      isActive: true 
    })
    
    if (existingPost) {
      return res.status(400).json({ error: 'Blog post with this title already exists' })
    }

    // Create new blog post
    const postData = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      featuredImage: featuredImage.trim(),
      images: Array.isArray(images) ? images.filter(img => img && img.trim()) : [],
      author: {
        name: author.name.trim(),
        bio: author.bio ? author.bio.trim() : '',
        avatar: author.avatar ? author.avatar.trim() : '',
        role: author.role ? author.role.trim() : 'Writer'
      },
      category: category.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase()) : [],
      status: status || 'draft',
      featured: Boolean(featured),
      readTime: readTime || '5 min read',
      seoTitle: seoTitle ? seoTitle.trim() : undefined,
      seoDescription: seoDescription ? seoDescription.trim() : undefined,
      authorId: req.user.sub // Link to admin user
    }

    const newPost = new BlogPost(postData)
    await newPost.save()

    // Log the admin action
    logAdminAction(req.user, 'CREATE', 'blog-posts', newPost._id, `Created new blog post: ${title.trim()}`, req)

    res.status(201).json({
      message: 'Blog post created successfully',
      post: newPost
    })
  } catch (error) {
    console.error('Create blog post error:', error)
    if (error.code === 11000) {
      res.status(400).json({ error: 'Blog post with this title already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create blog post' })
    }
  }
})

router.get('/blog-posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const post = await BlogPost.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id }
      ],
      isActive: true
    })

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    res.json({ post })
  } catch (error) {
    console.error('Get blog post error:', error)
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

router.put('/blog-posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { 
      title, 
      excerpt, 
      content, 
      featuredImage, 
      images,
      author, 
      category, 
      tags, 
      status,
      featured, 
      readTime,
      seoTitle,
      seoDescription
    } = req.body

    // Find blog post by MongoDB _id or slug
    const post = await BlogPost.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id }
      ],
      isActive: true
    })

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    // Check if another post with same title exists (if title is being changed)
    if (title && title.trim() !== post.title) {
      const existingPost = await BlogPost.findOne({ 
        title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
        isActive: true,
        _id: { $ne: post._id }
      })
      
      if (existingPost) {
        return res.status(400).json({ error: 'Blog post with this title already exists' })
      }
    }

    // Update fields
    if (title) post.title = title.trim()
    if (excerpt) post.excerpt = excerpt.trim()
    if (content) post.content = content.trim()
    if (featuredImage) post.featuredImage = featuredImage.trim()
    if (images !== undefined) {
      post.images = Array.isArray(images) ? images.filter(img => img && img.trim()) : []
    }
    if (author) {
      if (author.name) post.author.name = author.name.trim()
      if (author.bio !== undefined) post.author.bio = author.bio ? author.bio.trim() : ''
      if (author.avatar !== undefined) post.author.avatar = author.avatar ? author.avatar.trim() : ''
      if (author.role !== undefined) post.author.role = author.role ? author.role.trim() : 'Writer'
    }
    if (category) post.category = category.trim()
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase()) : []
    }
    if (status) post.status = status
    if (featured !== undefined) post.featured = Boolean(featured)
    if (readTime) post.readTime = readTime.trim()
    if (seoTitle !== undefined) post.seoTitle = seoTitle ? seoTitle.trim() : undefined
    if (seoDescription !== undefined) post.seoDescription = seoDescription ? seoDescription.trim() : undefined

    await post.save()

    // Log the admin action
    logAdminAction(req.user, 'UPDATE', 'blog-posts', post._id, `Updated blog post: ${post.title}`, req)

    res.json({
      message: 'Blog post updated successfully',
      post
    })
  } catch (error) {
    console.error('Update blog post error:', error)
    if (error.code === 11000) {
      res.status(400).json({ error: 'Blog post with this title already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update blog post' })
    }
  }
})

router.delete('/blog-posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Find blog post by MongoDB _id or slug
    const post = await BlogPost.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id }
      ],
      isActive: true
    })

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    // Soft delete by setting isActive to false
    post.isActive = false
    await post.save()

    // Log the admin action
    logAdminAction(req.user, 'DELETE', 'blog-posts', post._id, `Deleted blog post: ${post.title}`, req)

    res.json({
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Delete blog post error:', error)
    res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

// Audit Logs Endpoint
router.get('/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Return stored audit logs (in production, this would fetch from a database)
    const logs = global.auditLogs || [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        user: req.user?.email || "admin@example.com",
        action: "CREATE",
        resource: "categories",
        resourceId: "cat_001",
        details: "Created new category: Pottery & Ceramics",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: req.user?.email || "admin@example.com",
        action: "UPDATE",
        resource: "page-content",
        resourceId: "shop",
        details: "Updated shop page title and description",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: req.user?.email || "admin@example.com",
        action: "DELETE",
        resource: "categories",
        resourceId: "cat_002",
        details: "Deleted category: Textiles & Fabrics",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    ]

    res.json({ logs })
  } catch (error) {
    console.error('Get audit logs error:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// ==========================================
// COMMENT MANAGEMENT ROUTES
// ==========================================

// Comment Schemas
const commentModerationSchema = z.object({
  status: z.enum(['approved', 'rejected', 'spam']),
  reason: z.string().optional()
})

// Get all comments for moderation
router.get('/comments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      status = 'pending',
      postId,
      limit = 50,
      skip = 0,
      search = ''
    } = req.query

    // Build query
    const query = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (postId) {
      query.postId = postId
    }
    
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } },
        { 'author.email': { $regex: search, $options: 'i' } }
      ]
    }

    const comments = await Comment.find(query)
      .populate('postId', 'title slug category featured')
      .populate('parentId', 'content author.name')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))

    const totalCount = await Comment.countDocuments(query)
    
    // Get status counts
    const statusCounts = await Comment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      spam: 0
    }
    
    statusCounts.forEach(item => {
      counts[item._id] = item.count
    })

    res.json({
      comments,
      totalCount,
      counts,
      hasMore: totalCount > parseInt(skip) + comments.length
    })

  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Get single comment details
router.get('/comments/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('postId', 'title slug category')
      .populate('parentId', 'content author.name createdAt')
      .populate('replies', null, null, { sort: { createdAt: 1 } })
      .populate('moderatedBy', 'name email')

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    res.json({ comment })
  } catch (error) {
    console.error('Get comment error:', error)
    res.status(500).json({ error: 'Failed to fetch comment' })
  }
})

// Moderate comment (approve, reject, spam)
router.patch('/comments/:id/moderate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = commentModerationSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsed.error.errors 
      })
    }

    const { status, reason = '' } = parsed.data
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Update comment status
    comment.status = status
    comment.moderatedBy = req.user._id
    comment.moderatedAt = new Date()
    comment.moderationReason = reason

    await comment.save()

    // Update blog post comment count
    if (status === 'approved' && comment.status !== 'approved') {
      await BlogPost.findByIdAndUpdate(
        comment.postId,
        { $inc: { comments: 1 } }
      )
    } else if (status !== 'approved' && comment.status === 'approved') {
      await BlogPost.findByIdAndUpdate(
        comment.postId,
        { $inc: { comments: -1 } }
      )
    }

    const updatedComment = await Comment.findById(comment._id)
      .populate('postId', 'title slug')
      .populate('moderatedBy', 'name email')

    res.json({ 
      message: `Comment ${status} successfully`,
      comment: updatedComment
    })

  } catch (error) {
    console.error('Moderate comment error:', error)
    res.status(500).json({ error: 'Failed to moderate comment' })
  }
})

// Bulk moderate comments
router.patch('/comments/bulk-moderate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { commentIds, status, reason = '' } = req.body

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ error: 'Comment IDs are required' })
    }

    if (!['approved', 'rejected', 'spam'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const result = await Comment.updateMany(
      { _id: { $in: commentIds } },
      {
        status,
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        moderationReason: reason
      }
    )

    // Update blog post comment counts
    const comments = await Comment.find({ _id: { $in: commentIds } })
    const postUpdates = {}
    
    comments.forEach(comment => {
      const postId = comment.postId.toString()
      if (!postUpdates[postId]) postUpdates[postId] = 0
      
      if (status === 'approved' && comment.status !== 'approved') {
        postUpdates[postId]++
      } else if (status !== 'approved' && comment.status === 'approved') {
        postUpdates[postId]--
      }
    })

    // Apply the updates
    for (const [postId, increment] of Object.entries(postUpdates)) {
      if (increment !== 0) {
        await BlogPost.findByIdAndUpdate(postId, { $inc: { comments: increment } })
      }
    }

    res.json({ 
      message: `${result.modifiedCount} comments ${status} successfully`,
      modifiedCount: result.modifiedCount
    })

  } catch (error) {
    console.error('Bulk moderate comments error:', error)
    res.status(500).json({ error: 'Failed to moderate comments' })
  }
})

// Delete comment
router.delete('/comments/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Delete all replies first
    await Comment.deleteMany({ parentId: comment._id })

    // Update blog post comment count if comment was approved
    if (comment.status === 'approved') {
      await BlogPost.findByIdAndUpdate(
        comment.postId,
        { $inc: { comments: -1 } }
      )
    }

    await Comment.findByIdAndDelete(req.params.id)

    res.json({ message: 'Comment deleted successfully' })

  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

// Get comment statistics
router.get('/comments/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalStats, recentStats, topPosts] = await Promise.all([
      // Total statistics
      Comment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent statistics (last 30 days)
      Comment.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              status: '$status',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': -1 } }
      ]),
      
      // Most commented posts
      Comment.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$postId',
            commentCount: { $sum: 1 }
          }
        },
        { $sort: { commentCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'blogposts',
            localField: '_id',
            foreignField: '_id',
            as: 'post'
          }
        },
        { $unwind: '$post' },
        {
          $project: {
            _id: 1,
            commentCount: 1,
            title: '$post.title',
            slug: '$post.slug',
            category: '$post.category'
          }
        }
      ])
    ])

    const stats = {
      total: { pending: 0, approved: 0, rejected: 0, spam: 0 },
      recent: [],
      topPosts
    }

    totalStats.forEach(item => {
      stats.total[item._id] = item.count
    })

    stats.recent = recentStats

    res.json({ stats })

  } catch (error) {
    console.error('Get comment stats error:', error)
    res.status(500).json({ error: 'Failed to fetch comment statistics' })
  }
})

// ============= SELLER APPROVAL ENDPOINTS =============

// Get all pending seller applications
router.get('/sellers/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const pendingArtisans = await Artisan.find({ approvalStatus: 'pending' })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Artisan.countDocuments({ approvalStatus: 'pending' })

    res.json({
      applications: pendingArtisans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get pending sellers error:', error)
    res.status(500).json({ error: 'Failed to fetch pending applications' })
  }
})

// Get all seller applications (all statuses)
router.get('/sellers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status // pending, approved, rejected
    const skip = (page - 1) * limit

    const filter = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.approvalStatus = status
    }

    const artisans = await Artisan.find(filter)
      .populate('userId', 'name email createdAt')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Artisan.countDocuments(filter)

    res.json({
      sellers: artisans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get sellers error:', error)
    res.status(500).json({ error: 'Failed to fetch sellers' })
  }
})

// Get single seller application details
router.get('/sellers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('userId', 'name email phone createdAt')
      .populate('approvedBy', 'name email')
      .lean()

    if (!artisan) {
      return res.status(404).json({ error: 'Seller application not found' })
    }

    res.json({ seller: artisan })
  } catch (error) {
    console.error('Get seller details error:', error)
    res.status(500).json({ error: 'Failed to fetch seller details' })
  }
})

// Approve seller application
router.post('/sellers/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { approvalNotes } = req.body
    const adminId = req.user._id

    const artisan = await Artisan.findById(req.params.id)
    if (!artisan) {
      return res.status(404).json({ error: 'Seller application not found' })
    }

    if (artisan.approvalStatus !== 'pending') {
      return res.status(400).json({ error: 'Application already processed' })
    }

    // Update artisan status
    artisan.approvalStatus = 'approved'
    artisan.approvedBy = adminId
    artisan.approvedAt = new Date()
    artisan.approvalNotes = approvalNotes || ''
    artisan.isActive = true
    artisan.rejectionReason = undefined

    await artisan.save()

    // TODO: Send approval notification email/SMS to seller

    res.json({
      message: 'Seller application approved successfully',
      seller: {
        _id: artisan._id,
        name: artisan.name,
        approvalStatus: artisan.approvalStatus,
        approvedAt: artisan.approvedAt
      }
    })
  } catch (error) {
    console.error('Approve seller error:', error)
    res.status(500).json({ error: 'Failed to approve seller' })
  }
})

// Reject seller application
router.post('/sellers/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rejectionReason, approvalNotes } = req.body
    const adminId = req.user._id

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    const artisan = await Artisan.findById(req.params.id)
    if (!artisan) {
      return res.status(404).json({ error: 'Seller application not found' })
    }

    if (artisan.approvalStatus !== 'pending') {
      return res.status(400).json({ error: 'Application already processed' })
    }

    // Update artisan status
    artisan.approvalStatus = 'rejected'
    artisan.approvedBy = adminId
    artisan.approvedAt = new Date()
    artisan.rejectionReason = rejectionReason
    artisan.approvalNotes = approvalNotes || ''
    artisan.isActive = false

    await artisan.save()

    // TODO: Send rejection notification email/SMS to seller

    res.json({
      message: 'Seller application rejected',
      seller: {
        _id: artisan._id,
        name: artisan.name,
        approvalStatus: artisan.approvalStatus,
        rejectionReason: artisan.rejectionReason
      }
    })
  } catch (error) {
    console.error('Reject seller error:', error)
    res.status(500).json({ error: 'Failed to reject seller' })
  }
})

// Get seller approval statistics
router.get('/sellers/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      totalCount,
      recentApplications
    ] = await Promise.all([
      Artisan.countDocuments({ approvalStatus: 'pending' }),
      Artisan.countDocuments({ approvalStatus: 'approved' }),
      Artisan.countDocuments({ approvalStatus: 'rejected' }),
      Artisan.countDocuments(),
      Artisan.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .select('name approvalStatus createdAt')
        .lean()
    ])

    res.json({
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount,
        recentApplications
      }
    })
  } catch (error) {
    console.error('Get seller stats error:', error)
    res.status(500).json({ error: 'Failed to fetch seller statistics' })
  }
})

export default router