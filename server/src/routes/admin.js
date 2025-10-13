import { Router } from 'express'
import { z } from 'zod'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import Order from '../models/Order.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

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

export default router