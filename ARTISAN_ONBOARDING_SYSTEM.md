# Artisan Onboarding & Approval System - Implementation Guide

## Overview

This document describes the complete artisan onboarding and approval workflow system implemented for Zaymazone. The system allows artisans to submit comprehensive onboarding applications, which are then reviewed and approved by admins before granting access to seller features.

## Architecture

### 1. Frontend Flow

```
User → /sign-up-artisan (redirected to SellerOnboarding) 
  → Complete 6-step form
  → Submit application via POST /api/onboarding/artisan
  → Application stored with status: 'pending'
  → User sees confirmation page → Can check status at /seller-status
```

### 2. Admin Approval Flow

```
Admin Panel → AdminArtisanApprovals component
  → View pending artisans
  → Review details (business info, docs, etc.)
  → Approve (status → 'approved', artisan can now add products/blogs)
  → Or Reject (status → 'rejected', artisan receives reason)
```

### 3. Product/Blog Approval Flow

```
Seller creates product/blog → Auto-submitted with status: 'pending'
  ↓
Admin reviews via AdminProductApprovals/AdminBlogApprovals
  ↓
Approve → status: 'approved', product becomes active/blog gets published
Reject → status: 'rejected', seller receives feedback and can resubmit
```

## Database Schema Updates

### Artisan Model
```javascript
{
  // ... existing fields ...
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvalNotes: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}
```

### Product Model
```javascript
{
  // ... existing fields ...
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvalNotes: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}
```

### BlogPost Model
```javascript
{
  // ... existing fields ...
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvalNotes: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}
```

## Backend API Endpoints

### Onboarding Routes (`/api/onboarding`)

#### POST `/api/onboarding/artisan`
Submit artisan onboarding form
- **Auth**: Required (Bearer token)
- **Body**: 
  - businessName, ownerName, email, phone, address
  - yearsOfExperience, sellerType, gstNumber, aadhaarNumber, panNumber
  - categories, productDescription, materials, priceRange, stockQuantity
  - pickupAddress, dispatchTime, packagingType
  - bankName, accountNumber, ifscCode, upiId, paymentFrequency
  - story
  - profilePhoto, productPhotos, gstCertificate, aadhaarProof, craftVideo (base64 encoded)
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Onboarding form submitted successfully",
    "artisan": {
      "_id": "...",
      "name": "...",
      "businessName": "...",
      "approvalStatus": "pending"
    }
  }
  ```

#### GET `/api/onboarding/artisan/status`
Get current user's artisan profile and approval status
- **Auth**: Required (Bearer token)
- **Response**: Artisan profile with approvalStatus

### Admin Approval Routes (`/api/admin-approvals`)

#### GET `/api/admin-approvals/pending-artisans`
List pending artisan applications
- **Auth**: Required (Admin only)
- **Query Params**: 
  - status: 'pending' | 'approved' | 'rejected' | 'all' (default: pending)
  - page: number (default: 1)
  - limit: number (default: 10)
  - sortBy: field name (default: createdAt)
  - order: 'asc' | 'desc' (default: desc)
- **Response**:
  ```json
  {
    "success": true,
    "total": 25,
    "page": 1,
    "pages": 3,
    "artisans": [...]
  }
  ```

#### GET `/api/admin-approvals/artisan-details/:artisanId`
Get detailed artisan profile for review
- **Auth**: Required (Admin only)
- **Response**: Complete artisan document with all details

#### PATCH `/api/admin-approvals/approve-artisan/:artisanId`
Approve artisan application
- **Auth**: Required (Admin only)
- **Body**: `{ approvalNotes?: string }`
- **Response**: Updated artisan with approvalStatus: 'approved'

#### PATCH `/api/admin-approvals/reject-artisan/:artisanId`
Reject artisan application
- **Auth**: Required (Admin only)
- **Body**: `{ rejectionReason: string }` (required)
- **Response**: Updated artisan with approvalStatus: 'rejected'

#### GET `/api/admin-approvals/pending-products`
List pending products
- **Auth**: Required (Admin only)
- **Query Params**: status, page, limit, sortBy, order (same as artisans)
- **Response**: Array of products awaiting approval

#### PATCH `/api/admin-approvals/approve-product/:productId`
Approve product
- **Auth**: Required (Admin only)
- **Body**: `{ approvalNotes?: string }`
- **Response**: Updated product with approvalStatus: 'approved', isActive: true

#### PATCH `/api/admin-approvals/reject-product/:productId`
Reject product
- **Auth**: Required (Admin only)
- **Body**: `{ rejectionReason: string }` (required)
- **Response**: Updated product with approvalStatus: 'rejected', isActive: false

#### GET `/api/admin-approvals/pending-blogs`
List pending blog posts
- **Auth**: Required (Admin only)
- **Query Params**: status, page, limit, sortBy, order

#### PATCH `/api/admin-approvals/approve-blog/:blogId`
Approve and publish blog
- **Auth**: Required (Admin only)
- **Body**: `{ approvalNotes?: string }`
- **Response**: Updated blog with approvalStatus: 'approved', status: 'published'

#### PATCH `/api/admin-approvals/reject-blog/:blogId`
Reject blog
- **Auth**: Required (Admin only)
- **Body**: `{ rejectionReason: string }` (required)
- **Response**: Updated blog with approvalStatus: 'rejected', status: 'draft'

## Frontend Components

### AdminArtisanApprovals
Location: `src/components/AdminArtisanApprovals.tsx`
- Displays pending, approved, and rejected artisan applications
- Features:
  - Tabbed interface for different approval statuses
  - View detailed artisan information
  - Approve with optional notes
  - Reject with mandatory reason
  - Pagination support
  - Real-time status updates

### AdminProductApprovals
Location: `src/components/AdminProductApprovals.tsx`
- Manages product approval workflow
- Features:
  - View pending products awaiting approval
  - Product details dialog
  - Approve/reject functionality
  - Tracks artisan information
  - Price and category information

### AdminBlogApprovals
Location: `src/components/AdminBlogApprovals.tsx`
- Manages blog post approval workflow
- Features:
  - View pending blog posts
  - Content preview in dialog
  - Approve & publish functionality
  - Reject with feedback
  - Tracks artisan/author information

### SellerOnboarding
Location: `src/pages/SellerOnboarding.tsx`
- 6-step comprehensive form:
  1. Basic Info (business name, owner, contact)
  2. Seller Type & Verification (GST, Aadhaar, PAN)
  3. Product Details (categories, materials, pricing)
  4. Shipping & Delivery (pickup, dispatch time, packaging)
  5. Bank Details (UPI, bank account)
  6. Seller Story (bio, craft video)
- Submits to `/api/onboarding/artisan`
- Shows approval confirmation page

## Integration Points

### 1. Route Redirection
**File**: `src/App.tsx`
```typescript
// Before: /sign-up-artisan → <SignUpArtisan />
// After: /sign-up-artisan → <SellerOnboarding />
```

### 2. API Service Methods
**File**: `src/services/api.ts`
```typescript
export const sellerApi = {
  async completeOnboarding(formData: SellerFormData) {
    // Submits to POST /api/onboarding/artisan
  }
}
```

### 3. Admin Panel Integration
Add these components to admin dashboard:
```typescript
import { AdminArtisanApprovals } from '@/components/AdminArtisanApprovals';
import { AdminProductApprovals } from '@/components/AdminProductApprovals';
import { AdminBlogApprovals } from '@/components/AdminBlogApprovals';

// In admin routes/dashboard
<Tabs>
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

## User Experience Flow

### For New Artisans
1. Visit `/sign-up-artisan` (redirects to `/seller-onboarding`)
2. Complete 6-step form with comprehensive business information
3. Submit application → status becomes 'pending'
4. Receive confirmation with application ID
5. Can check status via `/seller-status` or dashboard
6. Wait for admin approval (email notification recommended)
7. Once approved: Can access seller dashboard, add products, write blogs
8. All products/blogs auto-submitted with status 'pending' for approval

### For Admins
1. Access admin panel → Approvals section
2. View "Artisan Applications" tab (pending, approved, rejected)
3. Click on artisan to view full details
4. Approve: Add notes (optional) → Artisan gains seller access
5. Reject: Add reason (required) → Artisan receives feedback
6. Monitor products and blogs submitted by sellers
7. Approve products → they become visible to customers
8. Approve blogs → they get published
9. Reject with feedback → seller can resubmit

## Security Features

1. **Authentication**: All endpoints require JWT bearer token
2. **Admin-Only**: Approval endpoints protected by admin role verification
3. **Audit Trail**: Track who approved/rejected and when via `approvedBy` and `approvedAt`
4. **Rejection Reasons**: Mandatory feedback for rejections
5. **File Validation**: Base64 encoded files validated on submission

## Database Indexing

Added indexes on approval status for efficient queries:
```javascript
approvalStatus: { ..., index: true }
```

This enables fast filtering by status (pending, approved, rejected).

## Next Steps / Future Enhancements

1. **Email Notifications**:
   - Notify artisans when application approved/rejected
   - Notify sellers when product/blog approved/rejected

2. **Appeal System**:
   - Allow artisans to appeal rejections with new information

3. **Batch Operations**:
   - Approve/reject multiple items at once

4. **Analytics Dashboard**:
   - Track approval rates, pending times
   - Performance metrics by category

5. **Auto-Approval Rules**:
   - Define rules for auto-approving based on categories or previous performance

6. **Comments/Feedback**:
   - Admins can request clarifications before approval

## Troubleshooting

### Artisan doesn't see pending status
- Check that approvalStatus was set to 'pending' in database
- Verify JWT token is valid and contains correct userId

### Products not showing approval status
- Ensure Product model was updated with approval fields
- Check that products created after update have approval fields

### Admin can't approve artisans
- Verify user has 'admin' role in database
- Check middleware is correctly verifying admin status
- Ensure JWT token is valid

## Testing

### Manual Testing Checklist
- [ ] Submit artisan onboarding form with all fields
- [ ] Verify application appears in admin pending list
- [ ] View artisan details in admin interface
- [ ] Approve artisan with notes
- [ ] Verify artisan gains seller access
- [ ] Reject artisan with reason
- [ ] Verify artisan receives notification/reason
- [ ] Create product as seller (should have pending approval)
- [ ] Approve product in admin panel
- [ ] Verify product becomes visible to customers
- [ ] Create blog as seller
- [ ] Approve/reject blog in admin panel
- [ ] Verify blog publishing works correctly

## Related Files

- Backend Routes: `server/src/routes/onboarding.js`
- Backend Routes: `server/src/routes/admin-approvals.js`
- Frontend Components: `src/components/AdminArtisanApprovals.tsx`
- Frontend Components: `src/components/AdminProductApprovals.tsx`
- Frontend Components: `src/components/AdminBlogApprovals.tsx`
- Frontend Page: `src/pages/SellerOnboarding.tsx`
- API Service: `src/services/api.ts`
- Main Server: `server/src/index.js`
- Database Models: `server/src/models/Artisan.js`
- Database Models: `server/src/models/Product.js`
- Database Models: `server/src/models/BlogPost.js`
