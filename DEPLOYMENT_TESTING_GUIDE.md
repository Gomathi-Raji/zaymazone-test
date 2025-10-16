# Deployment & Testing Guide - Artisan Onboarding System

## Overview

This guide provides step-by-step instructions for testing and deploying the artisan onboarding and approval system.

## Pre-Deployment Checklist

### Backend Requirements
- [ ] Node.js v16+ installed
- [ ] MongoDB connected and accessible
- [ ] Environment variables configured (.env file)
- [ ] JWT secret configured
- [ ] Firebase credentials set up

### Frontend Requirements
- [ ] React 18+ installed
- [ ] All shadcn/ui components installed
- [ ] TypeScript compilation successful
- [ ] Build artifacts generated

### Database Requirements
- [ ] MongoDB collections created
- [ ] Artisan model updated with approval fields
- [ ] Product model updated with approval fields
- [ ] BlogPost model updated with approval fields
- [ ] Indexes created on approvalStatus

---

## Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd server
npm install
```

Expected packages:
- express
- mongoose
- jsonwebtoken
- cors
- dotenv

### 1.2 Configure Environment Variables

Create `.env` file in `server/` directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Server
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email@firebase.gserviceaccount.com

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 1.3 Verify Database Connection

```bash
npm run test:db
```

Expected output:
```
✓ MongoDB connected successfully
✓ Database ready
```

### 1.4 Start Backend Server

```bash
npm run dev
# or
npm start
```

Expected output:
```
✓ Server running on port 4000
✓ Database connected
✓ API ready
```

Test health endpoint:
```bash
curl http://localhost:4000/health
# Response: {"ok": true}
```

---

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd ..
npm install
```

### 2.2 Configure Environment Variables

Create `.env.local` file in root directory:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
```

### 2.3 Verify TypeScript Compilation

```bash
npm run type-check
```

Expected output:
```
✓ No TypeScript errors found
✓ All components compile successfully
```

### 2.4 Start Development Server

```bash
npm run dev
```

Expected output:
```
✓ Vite dev server running at http://localhost:5173
✓ Ready for development
```

---

## Step 3: Component Testing

### 3.1 Test Admin Components

Navigate to admin dashboard and verify:

#### AdminArtisanApprovals
- [ ] Component renders without errors
- [ ] Pending tab shows artisans list
- [ ] Approved tab displays correctly
- [ ] Rejected tab displays correctly
- [ ] Detail dialog opens when clicked
- [ ] Approve button opens confirmation dialog
- [ ] Reject button opens confirmation dialog
- [ ] Actions complete successfully

#### AdminProductApprovals
- [ ] Component renders without errors
- [ ] Pending products display
- [ ] Product details show artisan info
- [ ] Approve/reject functionality works
- [ ] Status updates after action

#### AdminBlogApprovals
- [ ] Component renders without errors
- [ ] Pending blogs display
- [ ] Content preview shows in dialog
- [ ] Approve & publish works
- [ ] Reject with reason works

### 3.2 Test Frontend Pages

#### SellerOnboarding Page
```bash
Navigate to: http://localhost:5173/seller-onboarding
```

Verify:
- [ ] Page loads without errors
- [ ] All 6 form steps display
- [ ] Form validation works
- [ ] File uploads work
- [ ] Submit button functional
- [ ] Success page appears after submit

#### Artisan Status Page (if exists)
```bash
Navigate to: http://localhost:5173/seller-status
```

Verify:
- [ ] Current approval status displays
- [ ] Rejection reason shows if rejected
- [ ] Page updates after approval

---

## Step 4: API Testing

### 4.1 Test Onboarding Endpoint

**Test Artisan Submission:**

```bash
curl -X POST http://localhost:4000/api/onboarding/artisan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessName": "Test Crafts",
    "ownerName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": {
      "village": "Test Village",
      "district": "Test District",
      "state": "Test State",
      "pincode": "123456"
    },
    "yearsOfExperience": "5",
    "sellerType": "non-gst",
    "categories": ["pottery"],
    "productDescription": "Handmade pottery",
    "materials": "Clay",
    "priceRange": {"min": "100", "max": "500"},
    "stockQuantity": "50",
    "story": "Making crafts for 5 years"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Onboarding form submitted successfully",
  "artisan": {
    "_id": "ObjectId",
    "name": "John Doe",
    "businessName": "Test Crafts",
    "approvalStatus": "pending"
  }
}
```

### 4.2 Test Admin Approval Endpoints

**Get Pending Artisans:**

```bash
curl -X GET http://localhost:4000/api/admin-approvals/pending-artisans \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "total": 1,
  "page": 1,
  "pages": 1,
  "artisans": [...]
}
```

**Approve Artisan:**

```bash
curl -X PATCH http://localhost:4000/api/admin-approvals/approve-artisan/ARTISAN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "approvalNotes": "Welcome to our platform"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Artisan John Doe has been approved successfully",
  "artisan": {
    "_id": "ObjectId",
    "approvalStatus": "approved",
    "approvedAt": "2024-10-16T..."
  }
}
```

### 4.3 Test Product Approval

```bash
curl -X PATCH http://localhost:4000/api/admin-approvals/approve-product/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"approvalNotes": "Great product"}'
```

### 4.4 Test Blog Approval

```bash
curl -X PATCH http://localhost:4000/api/admin-approvals/approve-blog/BLOG_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"approvalNotes": "Good content"}'
```

---

## Step 5: Database Verification

### 5.1 Check Artisan Documents

```bash
# Using MongoDB Compass or mongosh
db.artisans.findOne({})

# Check approval status
db.artisans.find({ approvalStatus: "pending" })
```

Expected structure:
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "businessInfo": {...},
  "approvalStatus": "pending",
  "approvalNotes": null,
  "rejectionReason": null,
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 5.2 Check Product Approval Fields

```bash
db.products.findOne({})

# Verify approval fields exist
db.products.find({ approvalStatus: { $exists: true } }).count()
```

### 5.3 Check Blog Approval Fields

```bash
db.blogposts.findOne({})

# Verify approval fields
db.blogposts.find({ approvalStatus: { $exists: true } }).count()
```

---

## Step 6: Integration Testing

### 6.1 End-to-End Artisan Workflow

1. **User Registration**
   - [ ] User signs up via Firebase
   - [ ] User navigates to /sign-up-artisan
   - [ ] Redirects to /seller-onboarding
   - [ ] Form displays all 6 steps

2. **Form Submission**
   - [ ] User completes form
   - [ ] Validation passes
   - [ ] Submit button is enabled
   - [ ] API call succeeds
   - [ ] Success page displays

3. **Database Storage**
   - [ ] Artisan document created
   - [ ] Status is 'pending'
   - [ ] All form data stored correctly
   - [ ] Timestamps set correctly

4. **Admin Review**
   - [ ] Admin logs in
   - [ ] Admin navigates to Artisan Approvals
   - [ ] Pending artisan visible in list
   - [ ] Admin can view details

5. **Approval**
   - [ ] Admin clicks Approve
   - [ ] Dialog opens for notes
   - [ ] Admin enters optional notes
   - [ ] Confirms approval
   - [ ] Database updates: status = 'approved', approvedAt set, approvedBy set
   - [ ] Success notification shows

6. **Seller Access**
   - [ ] Artisan's status shows 'approved'
   - [ ] Artisan can now access seller dashboard
   - [ ] Can create products
   - [ ] Can create blogs

### 6.2 End-to-End Product Approval

1. **Product Creation**
   - [ ] Approved seller creates product
   - [ ] Product auto-submits with status 'pending'
   - [ ] Product not visible to customers

2. **Admin Review**
   - [ ] Admin sees product in Product Approvals
   - [ ] Can view product details
   - [ ] Can see seller information

3. **Approval**
   - [ ] Admin approves product
   - [ ] Status changes to 'approved'
   - [ ] isActive becomes true
   - [ ] Product now visible to customers

### 6.3 End-to-End Blog Approval

1. **Blog Creation**
   - [ ] Seller creates blog
   - [ ] Blog auto-submits with status 'pending'
   - [ ] Blog remains in draft

2. **Admin Review**
   - [ ] Admin sees blog in Blog Approvals
   - [ ] Can preview content
   - [ ] Can see author information

3. **Approval**
   - [ ] Admin approves blog
   - [ ] Blog status changes to 'published'
   - [ ] Blog now visible to all users

---

## Step 7: Error Handling Testing

### 7.1 Test Missing Authentication

```bash
curl -X GET http://localhost:4000/api/admin-approvals/pending-artisans

# Expected: 401 Unauthorized
```

### 7.2 Test Non-Admin Access

```bash
curl -X GET http://localhost:4000/api/admin-approvals/pending-artisans \
  -H "Authorization: Bearer USER_TOKEN"

# Expected: 403 Forbidden
```

### 7.3 Test Invalid Input

```bash
curl -X POST http://localhost:4000/api/onboarding/artisan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"businessName": "Test"}' 

# Expected: 400 Bad Request
```

### 7.4 Test Non-Existent Resource

```bash
curl -X GET http://localhost:4000/api/admin-approvals/artisan-details/invalid_id \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 404 Not Found
```

---

## Step 8: Performance Testing

### 8.1 Load Testing - Artisan List

```bash
# Test with pagination
curl -X GET "http://localhost:4000/api/admin-approvals/pending-artisans?page=1&limit=100" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Response time should be < 500ms
```

### 8.2 Load Testing - Approval Action

```bash
# Approve multiple items
for i in {1..10}; do
  curl -X PATCH http://localhost:4000/api/admin-approvals/approve-artisan/ID_$i \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ADMIN_TOKEN" \
    -d '{"approvalNotes": "Approved"}'
done

# Should handle all requests successfully
```

---

## Step 9: Security Testing

### 9.1 Test JWT Expiration

- [ ] Use expired token
- [ ] Should receive 401 error
- [ ] Redirect to login

### 9.2 Test CORS

```bash
curl -X OPTIONS http://localhost:4000/api/onboarding/artisan \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"

# Should return 200 with CORS headers
```

### 9.3 Test Input Sanitization

- [ ] Send HTML/script in input
- [ ] Should be sanitized/rejected
- [ ] No XSS vulnerabilities

### 9.4 Test Rate Limiting

- [ ] Make 150 requests in 60 seconds
- [ ] 31st+ requests should be blocked
- [ ] Should receive 429 Too Many Requests

---

## Step 10: Deployment to Staging

### 10.1 Backend Deployment

```bash
# Build backend
cd server
npm run build

# Deploy to staging (example for Render/Vercel)
# Configure environment variables on hosting platform
# Deploy code

# Verify deployment
curl https://zaymazone-backend-staging.onrender.com/health
```

### 10.2 Frontend Deployment

```bash
# Build frontend
npm run build

# Deploy to staging (example for Vercel/Netlify)
# Configure environment variables
# Deploy code

# Verify deployment
curl https://zaymazone-staging.vercel.app/seller-onboarding
```

### 10.3 Verify Staging Environment

- [ ] Backend API responds on staging URL
- [ ] Frontend loads from staging URL
- [ ] Database connects correctly
- [ ] All endpoints functional
- [ ] Admin components render

---

## Step 11: Create Test Data

### 11.1 Seed Test Artisans

```bash
npm run seed:artisans
```

Creates 10 test artisans with:
- Pending status
- Complete business information
- Verification documents
- Banking details

### 11.2 Seed Test Products

```bash
npm run seed:products
```

Creates test products with:
- Pending approval status
- Artisan association
- Category information
- Images

---

## Step 12: Production Deployment

### 12.1 Final Verification

Before production deployment:

- [ ] All tests pass in staging
- [ ] No console errors
- [ ] No database errors
- [ ] Performance metrics acceptable
- [ ] Security audit completed
- [ ] Documentation reviewed
- [ ] Backup created

### 12.2 Deployment Steps

```bash
# 1. Create backup
# 2. Deploy backend with zero-downtime
# 3. Deploy frontend
# 4. Verify all endpoints
# 5. Monitor logs
# 6. Run smoke tests
```

### 12.3 Post-Deployment

- [ ] Health checks pass
- [ ] API endpoints responding
- [ ] Admin dashboard accessible
- [ ] Artisan onboarding functional
- [ ] Approval workflow operational
- [ ] Database backups confirmed

---

## Monitoring & Maintenance

### Logs to Monitor

```bash
# Backend logs
tail -f server/logs/error.log
tail -f server/logs/access.log

# Frontend console
# Open DevTools and check console tab
```

### Metrics to Track

- Approval processing time
- API response times
- Database query performance
- Error rates
- User conversion rates
- Artisan sign-up rates

### Health Checks

```bash
# Daily health check
curl -s http://localhost:4000/health && echo "Backend OK"

# Check artisan queue
curl -s http://localhost:4000/api/admin-approvals/pending-artisans \
  -H "Authorization: Bearer TOKEN" | jq '.total'
```

---

## Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
lsof -i :4000
kill -9 <PID>
```

**Database Connection Error**
```bash
# Check MongoDB connection string
# Verify IP whitelist in MongoDB Atlas
# Test connection: mongosh "connection_string"
```

**CORS Errors**
```bash
# Update CORS_ORIGIN in .env
# Ensure frontend URL is whitelisted
# Clear browser cache
```

### Frontend Issues

**API Calls Failing**
```bash
# Check VITE_API_BASE_URL in .env.local
# Verify backend is running
# Check network tab in DevTools
```

**Components Not Rendering**
```bash
# Clear node_modules: rm -rf node_modules
# Reinstall: npm install
# Clear Vite cache: rm -rf dist
```

### Database Issues

**Approval Status Not Updating**
```bash
# Verify indexes: db.artisans.getIndexes()
# Check connection: db.adminCommand("ping")
# Review query in backend logs
```

---

## Rollback Plan

If issues occur in production:

1. **Immediate**: Disable new features via feature flags
2. **Short-term**: Revert to previous build
3. **Long-term**: Investigate root cause, fix, redeploy

```bash
# Revert to previous version
git revert <commit_hash>
npm run build
# Redeploy
```

---

## Success Criteria

System is ready for production when:

✅ All tests pass  
✅ No TypeScript errors  
✅ All endpoints respond correctly  
✅ Admin panels fully functional  
✅ Approval workflow operational  
✅ Database queries optimized  
✅ Security checks passed  
✅ Performance metrics acceptable  
✅ Documentation complete  
✅ Team trained on new features  

---

## Support Contacts

- Backend Issues: Backend team
- Frontend Issues: Frontend team
- Database Issues: DevOps team
- Deployment Issues: DevOps team

---

**Last Updated**: October 16, 2024  
**Version**: 1.0  
**Status**: Ready for Deployment
