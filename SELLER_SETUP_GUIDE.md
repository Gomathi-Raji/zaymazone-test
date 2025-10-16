# Seller Dashboard - Setup & Installation Guide

## Quick Start

The Seller Dashboard is **fully implemented and ready to use**. No additional setup required beyond the existing infrastructure.

## Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB running and connected
- Express server running on port 4000
- React app running on port 5173 (Vite)
- Firebase authentication configured

## Accessing the Seller Dashboard

### URL
```
http://localhost:5173/seller
```

### Authentication
The dashboard requires user login with one of:
- Firebase account (Google, Email)
- Admin credentials
- JWT token in localStorage

### First Time Use

1. **Log in** as an artisan/seller user
2. Dashboard redirects to `/seller` route
3. Stats load automatically
4. Navigate tabs to manage products, orders, etc.

## Backend Setup

### Verify API Endpoints

Make sure these endpoints exist in your backend:

```bash
# Check seller stats endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/seller/stats

# Check seller products endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/seller/products

# Check seller orders endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/seller/orders
```

### Database Collections

Ensure these collections exist in MongoDB:

```
artisans
products
orders
users
categories
```

With proper indexes:
```javascript
// In MongoDB shell or through Atlas
db.products.createIndex({ artisanId: 1, isActive: 1 });
db.products.createIndex({ isActive: 1 });
db.artisans.createIndex({ userId: 1 });
db.artisans.createIndex({ isActive: 1 });
db.orders.createIndex({ createdAt: -1 });
```

## Frontend Integration

### Route Configuration

The SellerDashboard route should be protected:

```typescript
// In your router configuration (App.tsx or equivalent)
import SellerDashboard from '@/pages/SellerDashboard';

<Route 
  path="/seller" 
  element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} 
/>
```

### Required UI Components

Ensure these shadcn/ui components are installed:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
```

### Required Dependencies

All required packages should already be installed:
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react
- @radix-ui components (via shadcn)

## File Structure Checklist

```
✅ src/pages/SellerDashboard.tsx
✅ src/components/seller/SellerProductManagement.tsx
✅ src/components/seller/SellerOrderManagement.tsx
✅ src/components/seller/SellerAnalytics.tsx
✅ src/components/seller/SellerProfile.tsx
✅ src/services/sellerService.ts
✅ server/src/routes/seller.js (from previous session)
✅ src/components/ImageUpload.tsx (reused)
```

## Environment Variables

No additional environment variables needed. Uses existing:
- `VITE_API_URL` (if configured)
- Firebase config (existing)
- MongoDB connection string (existing)

## Testing the Features

### 1. Test Product Management
```bash
# 1. Navigate to /seller
# 2. Click "Products" tab
# 3. Click "Add Product"
# 4. Fill in form with:
#    - Name: "Test Product"
#    - Price: 500
#    - Stock: 10
# 5. Click upload image or use URL
# 6. Click "Create Product"
# 7. Verify product appears in table
```

### 2. Test Order Management
```bash
# 1. Navigate to Orders tab
# 2. View list of seller's orders
# 3. Click "View" on any order
# 4. See order details in modal
# 5. Change status from dropdown
# 6. Status updates in real-time
```

### 3. Test Analytics
```bash
# 1. Navigate to Analytics tab
# 2. See 30-day revenue summary
# 3. See sales trend chart
# 4. See top products table
# 5. Change period (7, 30, 90 days)
# 6. Data updates accordingly
```

### 4. Test Profile
```bash
# 1. Navigate to Profile tab
# 2. Edit business name
# 3. Upload avatar image
# 4. Click "Save Changes"
# 5. Profile updates successfully
# 6. Image preview displays
```

## Troubleshooting

### Issue: "Failed to load stats" Error

**Solution:**
1. Check browser console for details
2. Verify authentication token is valid
3. Ensure backend `/api/seller/stats` endpoint exists
4. Check backend logs for errors
5. Verify user has artisan record in database

### Issue: Products Not Loading

**Solution:**
1. Verify products exist in database with `artisanId`
2. Check that `isActive: true` for products you want to see
3. Verify authentication token is valid
4. Check backend logs for query errors

### Issue: Image Upload Fails

**Solution:**
1. Verify `/api/images/upload` endpoint exists
2. Check file size (should be < 5MB)
3. Verify file format is image (jpg, png, gif, webp)
4. Check server disk space
5. Verify GridFS is configured

### Issue: 401 Unauthorized Errors

**Solution:**
1. Clear localStorage and re-login
2. Check token expiration
3. Verify Firebase config is correct
4. Check backend auth middleware

### Issue: Blank Page or 404

**Solution:**
1. Verify route `/seller` is configured
2. Check that all components are imported
3. Check browser console for errors
4. Verify all dependencies are installed

## Performance Tuning

### For Large Product Lists

Add pagination to backend:
```javascript
// server/src/routes/seller.js
router.get('/products', authenticateToken, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ artisanId })
    .skip(skip)
    .limit(limit);
});
```

### For Large Order Lists

Similar pagination:
```javascript
router.get('/orders', authenticateToken, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  // ... pagination logic
});
```

### Database Indexes

Ensure these indexes exist for optimal performance:
```javascript
// Products
db.products.createIndex({ artisanId: 1 });
db.products.createIndex({ isActive: 1 });

// Orders
db.orders.createIndex({ createdAt: -1 });

// Artisans
db.artisans.createIndex({ userId: 1 });
```

## Monitoring

### Logs to Check

**Frontend Console:**
- Network requests to `/api/seller/*`
- Component render times
- Form validation errors
- Image upload progress

**Backend Logs:**
- Route handler execution
- Database query times
- Authentication middleware
- File upload processing

### Metrics to Track

- Dashboard load time: < 2 seconds
- Product creation: < 1 second
- Image upload: < 5 seconds
- Order list load: < 500ms

## Security Considerations

### Already Implemented ✅
- JWT authentication on all endpoints
- Data filtering by artisan ID
- File type validation
- File size limits
- Input sanitization (via middleware)

### Recommended for Production
- Rate limiting on uploads
- CORS configuration
- HTTPS enforcement
- Regular security audits
- Database backup strategy
- Log monitoring

## Support & Documentation

For more detailed information, see:
- `SELLER_DASHBOARD_GUIDE.md` - Complete API documentation
- `SELLER_DASHBOARD_IMPLEMENTATION.md` - Technical implementation details
- Backend API documentation in `server/src/routes/seller.js`

## Version History

### v1.0 - Initial Release
- ✅ Product management (CRUD)
- ✅ Order management (view & status update)
- ✅ Analytics (sales & product performance)
- ✅ Profile management
- ✅ Image uploads
- ✅ Real-time stats
- ✅ Responsive design

### Future Versions
- Real-time notifications
- Bulk operations
- Advanced analytics
- Invoice generation
- Payment integration

---

**Deployment Status**: Ready for Production

**Last Tested**: Current Session

**Support Contact**: Your development team
