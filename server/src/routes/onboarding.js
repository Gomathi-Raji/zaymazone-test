import express from 'express';
import { authenticateToken } from '../middleware/firebase-auth.js';
import Artisan from '../models/Artisan.js';
import User from '../models/User.js';

const router = express.Router();

// POST - Submit artisan onboarding form
// Creates or updates artisan profile with pending approval status
router.post('/artisan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      businessName,
      ownerName,
      email,
      phone,
      address,
      yearsOfExperience,
      sellerType,
      gstNumber,
      aadhaarNumber,
      panNumber,
      categories,
      productDescription,
      materials,
      priceRange,
      stockQuantity,
      pickupAddress,
      dispatchTime,
      packagingType,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      paymentFrequency,
      story,
      profilePhoto,
      productPhotos,
      gstCertificate,
      aadhaarProof,
      craftVideo
    } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: businessName, ownerName, email, phone, address'
      });
    }

    // Check if artisan profile already exists
    let artisan = await Artisan.findOne({ userId });

    if (artisan) {
      // Update existing artisan profile
      artisan.name = ownerName;
      artisan.businessInfo = {
        businessName,
        sellerType: sellerType || 'non-gst',
        gstNumber: gstNumber || '',
        panNumber: panNumber || '',
        contact: {
          email,
          phone,
          address
        }
      };
      artisan.specialties = categories || [];
      artisan.experience = yearsOfExperience ? parseInt(yearsOfExperience) : 0;
      artisan.bio = story || '';
      artisan.avatar = profilePhoto || '';
      artisan.productInfo = {
        description: productDescription,
        materials: materials,
        priceRange: {
          min: priceRange?.min ? parseFloat(priceRange.min) : 0,
          max: priceRange?.max ? parseFloat(priceRange.max) : 0
        },
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        photos: productPhotos || []
      };
      artisan.logistics = {
        pickupAddress: {
          sameAsMain: pickupAddress?.sameAsMain ?? true,
          address: pickupAddress?.address || ''
        },
        dispatchTime: dispatchTime || '',
        packagingType: packagingType || ''
      };
      artisan.payment = {
        upiId: upiId || '',
        paymentFrequency: paymentFrequency || ''
      };
      artisan.documents = {
        gstCertificate: gstCertificate || '',
        aadhaarProof: aadhaarProof || '',
        craftVideo: craftVideo || ''
      };
      artisan.verification = {
        ...artisan.verification,
        documentNumber: aadhaarNumber || panNumber || '',
        bankDetails: {
          accountNumber: accountNumber || '',
          ifscCode: ifscCode || '',
          bankName: bankName || ''
        }
      };
      artisan.approvalStatus = 'pending';
      artisan.rejectionReason = null;
    } else {
      // Create new artisan profile
      artisan = new Artisan({
        userId,
        name: ownerName,
        businessInfo: {
          businessName,
          sellerType: sellerType || 'non-gst',
          gstNumber: gstNumber || '',
          panNumber: panNumber || '',
          contact: {
            email,
            phone,
            address
          }
        },
        location: {
          city: address.district || '',
          state: address.state || 'Unknown',
          country: 'India'
        },
        specialties: categories || [],
        experience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
        bio: story || '',
        avatar: profilePhoto || '',
        productInfo: {
          description: productDescription,
          materials: materials,
          priceRange: {
            min: priceRange?.min ? parseFloat(priceRange.min) : 0,
            max: priceRange?.max ? parseFloat(priceRange.max) : 0
          },
          stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
          photos: productPhotos || []
        },
        logistics: {
          pickupAddress: {
            sameAsMain: pickupAddress?.sameAsMain ?? true,
            address: pickupAddress?.address || ''
          },
          dispatchTime: dispatchTime || '',
          packagingType: packagingType || ''
        },
        payment: {
          upiId: upiId || '',
          paymentFrequency: paymentFrequency || ''
        },
        documents: {
          gstCertificate: gstCertificate || '',
          aadhaarProof: aadhaarProof || '',
          craftVideo: craftVideo || ''
        },
        verification: {
          isVerified: false,
          documentNumber: aadhaarNumber || panNumber || '',
          bankDetails: {
            accountNumber: accountNumber || '',
            ifscCode: ifscCode || '',
            bankName: bankName || ''
          }
        },
        approvalStatus: 'pending'
      });
    }

    await artisan.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding form submitted successfully. Your application is pending admin approval.',
      artisan: {
        _id: artisan._id,
        name: artisan.name,
        businessName: artisan.businessInfo?.businessName,
        approvalStatus: artisan.approvalStatus
      }
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit onboarding form',
      error: error.message
    });
  }
});

// GET - Get current user's artisan profile status
router.get('/artisan/status', authenticateToken, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user._id });

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.json({
      success: true,
      artisan: {
        _id: artisan._id,
        name: artisan.name,
        businessName: artisan.businessInfo?.businessName,
        approvalStatus: artisan.approvalStatus,
        approvedAt: artisan.approvedAt,
        rejectionReason: artisan.rejectionReason,
        avatar: artisan.avatar
      }
    });
  } catch (error) {
    console.error('Error fetching artisan status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan status',
      error: error.message
    });
  }
});

export default router;
