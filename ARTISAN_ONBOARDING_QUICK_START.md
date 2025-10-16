# Artisan Onboarding System - Quick Setup & Usage Guide

## Files Created/Modified

### Backend Files Created
1. **`server/src/routes/onboarding.js`** (NEW)
   - Handles artisan onboarding form submission
   - Stores all form data with approval status: 'pending'
   - Endpoints:
     - POST `/api/onboarding/artisan` - Submit onboarding
     - GET `/api/onboarding/artisan/status` - Check approval status

2. **`server/src/routes/admin-approvals.js`** (NEW)
   - Manages admin approval workflows
   - Endpoints for approving/rejecting artisans, products, blogs
   - Admin-only endpoints protected by role verification

### Backend Files Modified
1. **`server/src/index.js`**
   - Added imports for new routes
   - Registered routes at `/api/onboarding` and `/api/admin-approvals`

2. **`server/src/models/Artisan.js`**
   - Added approval workflow fields:
     - `approvalStatus` (enum: pending, approved, rejected)
     - `approvalNotes` (optional feedback)
     - `rejectionReason` (required for rejection)
     - `approvedBy` (reference to admin user)
     - `approvedAt` (timestamp)

3. **`server/src/models/Product.js`**
   - Added same 5 approval workflow fields

4. **`server/src/models/BlogPost.js`**
   - Added same 5 approval workflow fields

### Frontend Files Created
1. **`src/components/AdminArtisanApprovals.tsx`** (NEW)
   - Admin panel component for reviewing artisan applications
   - Features: View pending, approve, reject with notes/reasons
   - Tabbed interface for different statuses

2. **`src/components/AdminProductApprovals.tsx`** (NEW)
   - Admin panel component for product approval
   - Same features as artisan approvals

3. **`src/components/AdminBlogApprovals.tsx`** (NEW)
   - Admin panel component for blog approval
   - Approving blogs also publishes them

### Frontend Files Modified
1. **`src/App.tsx`**
   - Updated route `/sign-up-artisan` to redirect to `<SellerOnboarding />`

2. **`src/services/api.ts`**
   - Updated `sellerApi.completeOnboarding()` to use new `/api/onboarding/artisan` endpoint
   - Added `fileToBase64()` helper for file encoding

### Documentation Created
1. **`ARTISAN_ONBOARDING_SYSTEM.md`** (NEW)
   - Complete implementation guide
   - Architecture and data flow diagrams
   - All API endpoints documented
   - Integration instructions

## How to Use

### For End Users (Artisans)

1. **Sign Up Flow**
   ```
   Visit /sign-up-artisan 
   → (redirects to /seller-onboarding)
   → Complete 6-step form
   → Submit application
   → View confirmation page
   ```

2. **Form Steps**
   - Step 1: Basic Info (business name, owner, contact)
   - Step 2: Seller Type (GST/Non-GST, verification docs)
   - Step 3: Product Details (categories, materials, pricing)
   - Step 4: Shipping & Delivery (pickup, dispatch, packaging)
   - Step 5: Bank Details (UPI/Bank account)
   - Step 6: Story (bio, craft video)

3. **Check Application Status**
   - Navigate to `/seller-status` or seller dashboard
   - Shows: Pending / Approved / Rejected
   - If rejected: Shows rejection reason

4. **After Approval**
   - Can access full seller dashboard
   - Can add products (auto-submitted for approval)
   - Can write blogs (auto-submitted for approval)

### For Admins

#### In Admin Panel

1. **Access Artisan Applications**
   ```
   Admin Dashboard → Approvals → Artisan Applications
   ```

2. **Review Pending Artisans**
   - View list of pending applications
   - Click "View Details" to see full information:
     - Basic info (name, email, phone, address)
     - Business information
     - Experience and specialties
     - Bio and story
     - All documents and verification info

3. **Approve Artisan**
   - Click "Approve" button
   - Optionally add approval notes
   - Click "Approve" → Artisan gains seller access

4. **Reject Artisan**
   - Click "Reject" button
   - MUST provide rejection reason (required)
   - Click "Reject" → Artisan receives feedback

5. **Monitor Product Submissions**
   ```
   Admin Dashboard → Approvals → Product Approvals
   ```
   - View pending products from approved sellers
   - Check product details (name, price, artisan)
   - Approve → Product becomes visible to customers
   - Reject → Seller receives feedback, can resubmit

6. **Monitor Blog Submissions**
   ```
   Admin Dashboard → Approvals → Blog Approvals
   ```
   - View pending blogs
   - Preview blog content
   - Approve & Publish → Blog goes live
   - Reject → Seller receives feedback

### Integration with Admin Dashboard

Add these components to your admin dashboard routes:

```typescript
import { AdminArtisanApprovals } from '@/components/AdminArtisanApprovals';
import { AdminProductApprovals } from '@/components/AdminProductApprovals';
import { AdminBlogApprovals } from '@/components/AdminBlogApprovals';

// Example integration in admin layout
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="artisan-approvals">
      Artisan Applications
    </TabsTrigger>
    <TabsTrigger value="product-approvals">
      Product Approvals
    </TabsTrigger>
    <TabsTrigger value="blog-approvals">
      Blog Approvals
    </TabsTrigger>
  </TabsList>

  <TabsContent value="artisan-approvals">
    <AdminArtisanApprovals />
  </TabsContent>
  
  <TabsContent value="product-approvals">
    <AdminProductApprovals />
  </TabsContent>
  
  <TabsContent value="blog-approvals">
    <AdminBlogApprovals />
  </TabsContent>
</Tabs>
```

## API Endpoints Summary

### User Endpoints
- `POST /api/onboarding/artisan` - Submit onboarding form
- `GET /api/onboarding/artisan/status` - Check approval status

### Admin Endpoints
- `GET /api/admin-approvals/pending-artisans` - List pending artisans
- `GET /api/admin-approvals/artisan-details/:id` - View artisan details
- `PATCH /api/admin-approvals/approve-artisan/:id` - Approve artisan
- `PATCH /api/admin-approvals/reject-artisan/:id` - Reject artisan
- `GET /api/admin-approvals/pending-products` - List pending products
- `PATCH /api/admin-approvals/approve-product/:id` - Approve product
- `PATCH /api/admin-approvals/reject-product/:id` - Reject product
- `GET /api/admin-approvals/pending-blogs` - List pending blogs
- `PATCH /api/admin-approvals/approve-blog/:id` - Approve & publish blog
- `PATCH /api/admin-approvals/reject-blog/:id` - Reject blog

## Status Workflow

### Artisan Status
```
pending → approve → approved (seller access granted)
        → reject   → rejected (can reapply)
```

### Product Status
```
pending → approve → approved (visible to customers)
        → reject   → rejected (seller can resubmit)
```

### Blog Status
```
pending → approve → approved (published, visible to all)
        → reject   → rejected (remains in draft, seller can resubmit)
```

## Database Queries

### Find Pending Approvals
```javascript
// Pending artisans
Artisan.find({ approvalStatus: 'pending' })

// Approved artisans
Artisan.find({ approvalStatus: 'approved' })

// Rejected artisans with reason
Artisan.find({ approvalStatus: 'rejected' }).select('+rejectionReason')
```

### Find Products by Status
```javascript
// Pending products needing approval
Product.find({ approvalStatus: 'pending' }).populate('artisanId')

// Active (approved) products
Product.find({ approvalStatus: 'approved', isActive: true })
```

### Find Blogs by Status
```javascript
// Pending blogs
BlogPost.find({ approvalStatus: 'pending' })

// Published blogs
BlogPost.find({ approvalStatus: 'approved', status: 'published' })
```

## Email Notifications (Optional Enhancement)

Consider adding email notifications for:

1. **Artisan Approved**
   - Subject: "Your Zaymazone Seller Application Has Been Approved!"
   - Content: Welcome message + link to seller dashboard

2. **Artisan Rejected**
   - Subject: "Your Zaymazone Application Review"
   - Content: Rejection reason + reapplication instructions

3. **Product Approved**
   - Subject: "Your Product Has Been Approved"
   - Content: Product name + link to manage inventory

4. **Product Rejected**
   - Subject: "Your Product Needs Review"
   - Content: Rejection reason + edit link

5. **Blog Published**
   - Subject: "Your Blog Post is Now Live"
   - Content: Blog title + public link

## Testing Checklist

- [ ] Artisan can complete onboarding form
- [ ] Form data saved to database with status: 'pending'
- [ ] Admin sees pending artisan in approval list
- [ ] Admin can view full artisan details
- [ ] Admin can approve artisan (status → 'approved')
- [ ] Artisan gains access to seller dashboard after approval
- [ ] Admin can reject with reason
- [ ] Seller can create product (auto-pending)
- [ ] Admin can approve/reject products
- [ ] Seller can create blog (auto-pending)
- [ ] Admin can approve/reject blogs
- [ ] Approved blogs show as published
- [ ] All approval timestamps are recorded

## Troubleshooting

### Issue: Artisan page shows 403 error
**Solution**: Check that user is logged in and has valid JWT token

### Issue: Admin approval endpoints return 403
**Solution**: Verify admin user has `role: 'admin'` in User model

### Issue: Approval status not updating
**Solution**: 
1. Check database connection
2. Verify MongoDB update was successful
3. Refresh page to see latest status

### Issue: Files not storing properly
**Solution**: 
1. Ensure files are converted to base64 before sending
2. Check file size limits
3. Verify file upload middleware is configured

## Related Documentation

- Main guide: `ARTISAN_ONBOARDING_SYSTEM.md`
- Admin panel docs: `ADMIN_CREDENTIALS_UPDATE.md`
- Frontend summary: `FRONTEND_SUMMARY.md`
- Testing guide: `TESTING_GUIDE.md`

## Support

For issues or questions:
1. Check database model schemas match documentation
2. Verify all routes are registered in `server/src/index.js`
3. Review API endpoint responses for error messages
4. Check console logs in both frontend and backend
5. Verify JWT tokens are being passed correctly
