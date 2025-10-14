import { Router } from 'express'
import { z } from 'zod'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import Order from '../models/Order.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

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
      Product.countDocuments({ status: 'active' }),
      Artisan.countDocuments({ status: 'active' }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      User.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'pending' }),
      Artisan.countDocuments({ status: 'pending' }),
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
    const pendingProducts = await Product.find({ status: 'pending' })
      .populate('artisan', 'name email')
      .sort({ createdAt: -1 })

    res.json({ products: pendingProducts })
  } catch (error) {
    console.error('Get pending products error:', error)
    res.status(500).json({ error: 'Failed to fetch pending products' })
  }
})

router.get('/approvals/artisans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingArtisans = await Artisan.find({ status: 'pending' })
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
      status: 'pending',
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
        status: 'active',
        approvedBy: req.user.sub,
        approvedAt: new Date()
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
        status: 'rejected',
        rejectedBy: req.user.sub,
        rejectedAt: new Date(),
        rejectionReason: reason
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
        status: 'active',
        approvedBy: req.user.sub,
        approvedAt: new Date()
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
        status: 'rejected',
        rejectedBy: req.user.sub,
        rejectedAt: new Date(),
        rejectionReason: reason
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
      query.status = status
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
      status: req.body.status || 'active',
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
    // For now, return mock data. In production, this would come from a database
    const categories = [
      {
        id: "pottery",
        name: "Pottery & Ceramics",
        description: "Hand-thrown pottery, decorative ceramics, and traditional clay items crafted by master potters.",
        image: "pottery-category.jpg",
        icon: "Gift",
        productCount: 48,
        subcategories: ["Vases", "Dinnerware", "Tea Sets", "Decorative Items"],
        featured: true,
        artisanCount: 25
      },
      {
        id: "textiles",
        name: "Handwoven Textiles",
        description: "Traditional fabrics, sarees, scarves, and clothing created using ancient weaving techniques.",
        image: "textiles-category.jpg",
        icon: "ShirtIcon",
        productCount: 85,
        subcategories: ["Sarees", "Shawls", "Scarves", "Bedding", "Bags"],
        featured: true,
        artisanCount: 42
      },
      {
        id: "crafts",
        name: "Traditional Crafts",
        description: "Handmade decorative items, toys, and functional objects representing India's rich craft heritage.",
        image: "crafts-category.jpg",
        icon: "Palette",
        productCount: 67,
        subcategories: ["Wood Carving", "Metal Work", "Stone Inlay", "Paintings"],
        featured: true,
        artisanCount: 38
      },
      {
        id: "paintings",
        name: "Folk Paintings",
        description: "Traditional Indian paintings including Madhubani, Kalamkari, and other regional art forms.",
        image: "crafts-category.jpg",
        icon: "Palette",
        productCount: 29,
        subcategories: ["Madhubani", "Kalamkari", "Warli", "Miniature"],
        featured: false,
        artisanCount: 18
      }
    ]

    res.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.post('/categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, image, icon, productCount, subcategories, featured, artisanCount } = req.body

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

    if (productCount !== undefined && (typeof productCount !== 'number' || productCount < 0)) {
      return res.status(400).json({ error: 'Product count must be a non-negative number' })
    }

    if (artisanCount !== undefined && (typeof artisanCount !== 'number' || artisanCount < 0)) {
      return res.status(400).json({ error: 'Artisan count must be a non-negative number' })
    }

    // In production, this would save to a database
    const newCategory = {
      id: `category-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      image: image || "",
      icon: icon || "Palette",
      productCount: productCount || 0,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      featured: Boolean(featured),
      artisanCount: artisanCount || 0
    }

    // Log the admin action
    logAdminAction(req.user, 'CREATE', 'categories', newCategory.id, `Created new category: ${name.trim()}`, req)

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

router.put('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, image, icon, productCount, subcategories, featured, artisanCount } = req.body

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

    if (productCount !== undefined && (typeof productCount !== 'number' || productCount < 0)) {
      return res.status(400).json({ error: 'Product count must be a non-negative number' })
    }

    if (artisanCount !== undefined && (typeof artisanCount !== 'number' || artisanCount < 0)) {
      return res.status(400).json({ error: 'Artisan count must be a non-negative number' })
    }

    // In production, this would update a database
    const updatedCategory = {
      id,
      name: name.trim(),
      description: description.trim(),
      image: image || "",
      icon: icon || "Palette",
      productCount: productCount || 0,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      featured: Boolean(featured),
      artisanCount: artisanCount || 0
    }

    // Log the admin action
    logAdminAction(req.user, 'UPDATE', 'categories', id, `Updated category: ${name.trim()}`, req)

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Log the admin action
    logAdminAction(req.user, 'DELETE', 'categories', id, `Deleted category with ID: ${id}`, req)

    // In production, this would delete from a database
    res.json({
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Failed to delete category' })
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

export default router