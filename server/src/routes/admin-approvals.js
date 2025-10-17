import express from 'express';
import { authenticateToken } from '../middleware/firebase-auth.js';
import Artisan from '../models/Artisan.js';
import Product from '../models/Product.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify admin role
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify admin role',
      error: error.message
    });
  }
};

// ==================== ARTISAN APPROVAL ====================

// GET - Get all pending artisans awaiting approval
router.get('/pending-artisans', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = status === 'all' ? {} : { approvalStatus: status };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: order === 'desc' ? -1 : 1 };

    const artisans = await Artisan.find(query)
      .select('-documents -verification')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email firebaseUID');

    const total = await Artisan.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      artisans
    });
  } catch (error) {
    console.error('Error fetching pending artisans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending artisans',
      error: error.message
    });
  }
});

// GET - Get detailed artisan profile for review
router.get('/artisan-details/:artisanId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.artisanId)
      .populate('userId', 'email firebaseUID createdAt');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      artisan
    });
  } catch (error) {
    console.error('Error fetching artisan details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan details',
      error: error.message
    });
  }
});

// PATCH - Approve artisan application
router.patch('/approve-artisan/:artisanId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const adminId = req.user._id;

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.artisanId,
      {
        approvalStatus: 'approved',
        approvalNotes: approvalNotes || '',
        approvedBy: adminId,
        approvedAt: new Date(),
        $unset: { rejectionReason: 1 }
      },
      { new: true }
    ).populate('userId', 'email firebaseUID');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      message: `Artisan ${artisan.name} has been approved successfully`,
      artisan: {
        _id: artisan._id,
        name: artisan.name,
        businessName: artisan.businessInfo?.businessName,
        approvalStatus: artisan.approvalStatus,
        approvedAt: artisan.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving artisan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve artisan',
      error: error.message
    });
  }
});

// PATCH - Reject artisan application
router.patch('/reject-artisan/:artisanId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const adminId = req.user._id;

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.artisanId,
      {
        approvalStatus: 'rejected',
        rejectionReason,
        approvedBy: adminId,
        approvedAt: new Date(),
        $unset: { approvalNotes: 1 }
      },
      { new: true }
    ).populate('userId', 'email firebaseUID');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      message: `Artisan ${artisan.name} has been rejected`,
      artisan: {
        _id: artisan._id,
        name: artisan.name,
        businessName: artisan.businessInfo?.businessName,
        approvalStatus: artisan.approvalStatus,
        rejectionReason: artisan.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting artisan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject artisan',
      error: error.message
    });
  }
});

// ==================== PRODUCT APPROVAL ====================

// GET - Get all pending products
router.get('/pending-products', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = status === 'all' ? {} : { approvalStatus: status };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: order === 'desc' ? -1 : 1 };

    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('artisanId', 'name businessInfo avatar')
      .populate('categoryId', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products
    });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending products',
      error: error.message
    });
  }
});

// PATCH - Approve product
router.patch('/approve-product/:productId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const adminId = req.user._id;

    // Validate approval notes length if provided
    if (approvalNotes && approvalNotes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Approval notes cannot exceed 1000 characters'
      });
    }

    // Check product exists first
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        approvalStatus: 'approved',
        approvalNotes: approvalNotes || '',
        approvedBy: adminId,
        approvedAt: new Date(),
        isActive: true,
        $unset: { rejectionReason: 1 }
      },
      { new: true }
    ).populate('artisanId', 'name businessInfo');

    res.json({
      success: true,
      message: `Product "${updatedProduct.name}" has been approved`,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        approvalStatus: updatedProduct.approvalStatus,
        approvedAt: updatedProduct.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve product',
      error: error.message
    });
  }
});

// PATCH - Reject product
router.patch('/reject-product/:productId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const adminId = req.user._id;

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        approvalStatus: 'rejected',
        rejectionReason,
        approvedBy: adminId,
        approvedAt: new Date(),
        isActive: false,
        $unset: { approvalNotes: 1 }
      },
      { new: true }
    ).populate('artisanId', 'name businessInfo');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: `Product "${product.name}" has been rejected`,
      product: {
        _id: product._id,
        name: product.name,
        approvalStatus: product.approvalStatus,
        rejectionReason: product.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject product',
      error: error.message
    });
  }
});

// ==================== BLOG APPROVAL ====================

// GET - Get all pending blogs
router.get('/pending-blogs', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = status === 'all' ? {} : { approvalStatus: status };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: order === 'desc' ? -1 : 1 };

    const blogs = await BlogPost.find(query)
      .select('title slug category approvalStatus createdAt artisanId status approvalNotes rejectionReason')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('artisanId', 'name businessInfo avatar');

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      blogs
    });
  } catch (error) {
    console.error('Error fetching pending blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending blogs',
      error: error.message
    });
  }
});

// PATCH - Approve blog
router.patch('/approve-blog/:blogId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const adminId = req.user._id;

    const blog = await BlogPost.findByIdAndUpdate(
      req.params.blogId,
      {
        approvalStatus: 'approved',
        approvalNotes: approvalNotes || '',
        approvedBy: adminId,
        approvedAt: new Date(),
        status: 'published',
        $unset: { rejectionReason: 1 }
      },
      { new: true }
    ).populate('artisanId', 'name businessInfo');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: `Blog "${blog.title}" has been approved and published`,
      blog: {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        approvalStatus: blog.approvalStatus,
        approvedAt: blog.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve blog',
      error: error.message
    });
  }
});

// PATCH - Reject blog
router.patch('/reject-blog/:blogId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const adminId = req.user._id;

    const blog = await BlogPost.findByIdAndUpdate(
      req.params.blogId,
      {
        approvalStatus: 'rejected',
        rejectionReason,
        approvedBy: adminId,
        approvedAt: new Date(),
        status: 'draft',
        $unset: { approvalNotes: 1 }
      },
      { new: true }
    ).populate('artisanId', 'name businessInfo');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: `Blog "${blog.title}" has been rejected`,
      blog: {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        approvalStatus: blog.approvalStatus,
        rejectionReason: blog.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject blog',
      error: error.message
    });
  }
});

export default router;
