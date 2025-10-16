# Manual Testing Guide - Admin & Seller Panel

**Date**: October 16, 2025  
**Status**: READY FOR MANUAL TESTING  

---

## 🎯 MANUAL TESTING CHECKLIST

Complete these tests manually through the browser and database to verify everything works.

---

## PHASE 1: SETUP & PREREQUISITES

### Step 1: Verify MongoDB Connection
- [ ] Open MongoDB Compass or your MongoDB client
- [ ] Connect to: `mongodb+srv://dinesh_zayma:ehODIoXrZP6U00HS@zayma-test.w2omvt0.mongodb.net/`
- [ ] Verify connected successfully
- [ ] Check collections exist:
  - [ ] artisans
  - [ ] products
  - [ ] blogposts
  - [ ] users

### Step 2: Start Backend Server
```bash
cd server
npm run dev
```
Expected output:
```
✅ Connected to MongoDB
✅ GridFS initialized
🚀 API listening on http://localhost:4000
```

### Step 3: Start Frontend Server
```bash
npm run dev
```
Expected output:
```
VITE v4.x.x
➜  Local: http://localhost:5173/
```

### Step 4: Verify Health Endpoints
Open in browser:
- [ ] http://localhost:4000/health - Should return `{"ok":true}`
- [ ] http://localhost:4000/ - Should return API info with endpoints

---

## PHASE 2: ADMIN AUTHENTICATION TESTING

### Test 2.1: Admin Login Page Loads
1. Navigate to: `http://localhost:5173/admin`
2. Verify:
   - [ ] AdminLogin component renders
   - [ ] Email input field appears
   - [ ] Password input field appears
   - [ ] Login button appears
   - [ ] Form is empty initially

### Test 2.2: Admin Login Form Validation
1. Click Login button without entering data
2. Verify:
   - [ ] Error message appears: "Email is required"
   - [ ] Form does not submit

3. Enter invalid email (e.g., "test")
4. Verify:
   - [ ] Error message appears: "Please enter a valid email"

5. Enter email but no password
6. Verify:
   - [ ] Error message appears: "Password is required"

### Test 2.3: Admin Login Success
1. Enter credentials:
   - Email: `admin@zaymazone.com`
   - Password: `admin123`
2. Click Login
3. Verify:
   - [ ] Loading state appears
   - [ ] Redirect to admin dashboard happens
   - [ ] Token stored in localStorage
   - [ ] Admin menu shows in header

### Test 2.4: Check Token Storage
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Verify:
   - [ ] `admin_token` key exists
   - [ ] `admin_refresh_token` key exists
   - [ ] `admin_user` key exists with admin data

---

## PHASE 3: ADMIN ARTISAN APPROVALS

### Test 3.1: Pending Artisans List Loads
1. On Admin Dashboard, click "Artisan Approvals" or "Pending" tab
2. Verify:
   - [ ] AdminArtisanApprovals component loads
   - [ ] List of pending artisans displays
   - [ ] Each artisan shows: name, email, business name, status
   - [ ] Pagination controls appear if > 10 items

### Test 3.2: View Artisan Details
1. Click on an artisan from the list
2. Verify detail dialog shows:
   - [ ] Full name
   - [ ] Email
   - [ ] Business name
   - [ ] Business address (village, district, state, pincode)
   - [ ] Years of experience
   - [ ] GST/Non-GST status
   - [ ] Aadhaar and PAN numbers (masked)
   - [ ] Product categories
   - [ ] Price range
   - [ ] Bank details section
   - [ ] Story/description
   - [ ] Approve button
   - [ ] Reject button with reason field

### Test 3.3: Approve Artisan
1. Click Approve button on an artisan
2. Optionally add approval notes
3. Click confirm
4. Verify:
   - [ ] Success message appears
   - [ ] Artisan moves to "Approved" tab
   - [ ] Database updated (check in MongoDB):
     ```javascript
     db.artisans.findOne({_id: ObjectId("...")})
     // Should show:
     // approvalStatus: "approved"
     // approvedBy: adminUserId
     // approvedAt: new Date()
     ```

### Test 3.4: Reject Artisan
1. Click Reject button on another artisan
2. Enter rejection reason (required field)
3. Optionally add notes
4. Click confirm
5. Verify:
   - [ ] Success message appears
   - [ ] Artisan moves to "Rejected" tab
   - [ ] Database updated:
     ```javascript
     db.artisans.findOne({_id: ObjectId("...")})
     // Should show:
     // approvalStatus: "rejected"
     // rejectionReason: "Your entered reason"
     ```

### Test 3.5: Artisan Tabs Navigation
1. Click "Approved" tab
2. Verify:
   - [ ] Only approved artisans show
   - [ ] Pagination resets
   
3. Click "Rejected" tab
4. Verify:
   - [ ] Only rejected artisans show
   
5. Click "Pending" tab
6. Verify:
   - [ ] Only pending artisans show again

---

## PHASE 4: ADMIN PRODUCT APPROVALS

### Test 4.1: Pending Products List
1. Navigate to Product Approvals section
2. Verify:
   - [ ] AdminProductApprovals component loads
   - [ ] List shows pending products
   - [ ] Each product shows: name, seller/artisan, category, price, status

### Test 4.2: View Product Details
1. Click on a product
2. Verify detail dialog shows:
   - [ ] Product name
   - [ ] Description
   - [ ] Images/thumbnails
   - [ ] Price and original price
   - [ ] Category and subcategory
   - [ ] Stock count
   - [ ] Materials
   - [ ] Colors
   - [ ] Seller/Artisan information
   - [ ] Approve button
   - [ ] Reject button

### Test 4.3: Approve Product
1. Click Approve button
2. Verify:
   - [ ] Success message
   - [ ] Product moved to Approved tab
   - [ ] Database check:
     ```javascript
     db.products.findOne({_id: ObjectId("...")})
     // approvalStatus: "approved"
     // isActive: true (product now visible)
     ```

### Test 4.4: Reject Product
1. Click Reject button on a product
2. Enter rejection reason
3. Verify:
   - [ ] Success message
   - [ ] Product moved to Rejected tab
   - [ ] Seller sees rejection reason
   - [ ] Database shows rejection

---

## PHASE 5: ADMIN BLOG APPROVALS

### Test 5.1: Pending Blogs List
1. Navigate to Blog Approvals section
2. Verify:
   - [ ] AdminBlogApprovals component loads
   - [ ] List shows pending blogs
   - [ ] Each blog shows: title, author, category

### Test 5.2: View Blog Details
1. Click on a blog
2. Verify detail dialog shows:
   - [ ] Blog title
   - [ ] Author/Artisan name
   - [ ] Blog content preview
   - [ ] Featured image
   - [ ] Category
   - [ ] Tags
   - [ ] Created date
   - [ ] Approve button
   - [ ] Reject button

### Test 5.3: Approve & Reject Blogs
1. Approve a blog, verify:
   - [ ] Moved to Approved tab
   - [ ] Database: approvalStatus = "approved"
   - [ ] Blog becomes published

2. Reject a blog, verify:
   - [ ] Moved to Rejected tab
   - [ ] Database: approvalStatus = "rejected"
   - [ ] Author sees rejection reason

---

## PHASE 6: SELLER DASHBOARD TESTING

### Test 6.1: Seller Dashboard Access
1. Navigate to: `http://localhost:5173/seller-dashboard`
2. If not authenticated:
   - [ ] Redirected to login
3. If authenticated as seller:
   - [ ] Dashboard loads with stats
   - [ ] Shows: Total Products, Active Products, Orders, Revenue, etc.

### Test 6.2: Seller Stats Display
1. On Seller Dashboard
2. Verify stats cards show:
   - [ ] Total Products: number
   - [ ] Active Products: number
   - [ ] Total Orders: number
   - [ ] Completed Orders: number
   - [ ] Total Revenue: amount
   - [ ] Average Rating: rating
   - [ ] Total Reviews: count

### Test 6.3: Seller Profile Tab
1. Click "Profile" tab
2. Verify:
   - [ ] SellerProfile component loads
   - [ ] Shows business information
   - [ ] Shows contact details
   - [ ] Can edit profile
   - [ ] Save button works

### Test 6.4: Product Management Tab
1. Click "Products" tab
2. Verify:
   - [ ] SellerProductManagement loads
   - [ ] List of seller's products shows
   - [ ] Each product shows approval status (pending/approved/rejected)
   - [ ] Create Product button available
   - [ ] Edit button available
   - [ ] Delete button available

### Test 6.5: Create Product
1. Click "Create Product" button
2. Fill in product form:
   - [ ] Product name
   - [ ] Description
   - [ ] Price
   - [ ] Category
   - [ ] Images
   - [ ] Materials
   - [ ] Stock quantity
3. Click Submit
4. Verify:
   - [ ] Product created successfully
   - [ ] Product appears in list with approvalStatus = "pending"
   - [ ] Database check:
     ```javascript
     db.products.findOne({name: "Your Product"})
     // approvalStatus: "pending"
     // artisanId: sellerId
     ```

### Test 6.6: Edit Product
1. Click Edit on a product
2. Modify a field (e.g., price)
3. Click Save
4. Verify:
   - [ ] Product updated
   - [ ] Change reflected in database

### Test 6.7: Delete Product
1. Click Delete on a product
2. Confirm deletion
3. Verify:
   - [ ] Product removed from list
   - [ ] Database entry deleted

### Test 6.8: Blog Management Tab
1. Click "Blogs" tab
2. Verify:
   - [ ] SellerBlogManagement loads
   - [ ] List of seller's blogs shows
   - [ ] Each blog shows approval status
   - [ ] Create Blog button available

### Test 6.9: Create Blog
1. Click "Create Blog" button
2. Fill in blog form:
   - [ ] Title
   - [ ] Content
   - [ ] Featured image
   - [ ] Category
   - [ ] Tags
3. Click Submit
4. Verify:
   - [ ] Blog created successfully
   - [ ] Blog appears in list with approvalStatus = "pending"
   - [ ] Database: approvalStatus = "pending"

### Test 6.10: Orders Tab
1. Click "Orders" tab
2. Verify:
   - [ ] SellerOrderManagement loads
   - [ ] List of orders for seller's products shows
   - [ ] Each order shows: order ID, customer, product, amount, status
   - [ ] Can click to view order details

---

## PHASE 7: DATABASE VERIFICATION

### Test 7.1: Check Approval Fields Exist
Open MongoDB client and run:

```javascript
// Check Artisan schema
db.artisans.findOne({});
// Should have: approvalStatus, approvalNotes, rejectionReason, approvedBy, approvedAt

// Check Product schema  
db.products.findOne({});
// Should have: approvalStatus, approvalNotes, rejectionReason, approvedBy, approvedAt

// Check BlogPost schema
db.blogposts.findOne({});
// Should have: approvalStatus, approvalNotes, rejectionReason, approvedBy, approvedAt
```

### Test 7.2: Verify Approval Data Integrity
```javascript
// Find pending items
db.artisans.find({approvalStatus: "pending"}).count()
db.products.find({approvalStatus: "pending"}).count()
db.blogposts.find({approvalStatus: "pending"}).count()

// Find approved items
db.artisans.find({approvalStatus: "approved"}).count()
db.products.find({approvalStatus: "approved"}).count()
db.blogposts.find({approvalStatus: "approved"}).count()

// Find rejected items
db.artisans.find({approvalStatus: "rejected"}).count()
db.products.find({approvalStatus: "rejected"}).count()
db.blogposts.find({approvalStatus: "rejected"}).count()
```

### Test 7.3: Verify Audit Trail
```javascript
// Check approvedBy references valid admin
db.artisans.findOne({approvalStatus: "approved"}, {approvedBy: 1}).approvedBy
// Should be valid ObjectId of admin user

// Check timestamps
db.artisans.findOne({approvalStatus: "approved"}, {approvedAt: 1}).approvedAt
// Should be valid Date
```

---

## PHASE 8: API ENDPOINT TESTING (Using Postman or cURL)

### Test 8.1: Admin Login Endpoint
```bash
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zaymazone.com",
    "password": "admin123"
  }'
```
Expected: Returns accessToken and user data

### Test 8.2: Get Pending Artisans
```bash
curl -X GET "http://localhost:4000/api/admin-approvals/pending-artisans?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
Expected: Returns artisans array with pagination

### Test 8.3: Approve Artisan
```bash
curl -X PATCH "http://localhost:4000/api/admin-approvals/approve-artisan/ARTISAN_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "Looks good!"
  }'
```
Expected: Returns success and updated artisan

### Test 8.4: Get Seller Stats
```bash
curl -X GET "http://localhost:4000/api/seller/stats" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```
Expected: Returns seller statistics

### Test 8.5: Create Product
```bash
curl -X POST "http://localhost:4000/api/seller/products" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 999,
    "category": "textiles",
    "description": "Test description"
  }'
```
Expected: Product created with approvalStatus = "pending"

---

## PHASE 9: ERROR SCENARIOS

### Test 9.1: Invalid Credentials
1. Try login with wrong password
2. Verify: Error message appears
3. Try login with non-existent email
4. Verify: Error message appears

### Test 9.2: Unauthorized Access
1. Try accessing admin endpoints without token
2. Verify: 401 Unauthorized error
3. Try accessing seller endpoints without token
4. Verify: 401 Unauthorized error

### Test 9.3: Approval Conflicts
1. Try approving already approved item
2. Verify: Appropriate error or skips
3. Try rejecting already rejected item
4. Verify: Appropriate error or skips

### Test 9.4: Invalid Data
1. Try creating product with missing required field
2. Verify: Validation error
3. Try creating product with invalid price
4. Verify: Validation error

---

## PHASE 10: PERFORMANCE TESTING

### Test 10.1: List Load Time
1. Get Pending Artisans with limit 50
2. Measure response time
3. Verify: < 1 second

### Test 10.2: Approval Action Speed
1. Approve an artisan
2. Measure time from click to database update
3. Verify: < 2 seconds

### Test 10.3: Page Rendering
1. Load Admin Dashboard
2. Measure time to interactive
3. Verify: < 3 seconds

### Test 10.4: Database Query Performance
1. Count pending items across all collections
2. Verify: < 500ms
3. Get artisan details
4. Verify: < 200ms

---

## 📋 TEST SUMMARY TEMPLATE

Use this to document your test results:

```
TEST DATE: [DATE]
TESTER: [NAME]
VERSION: 1.0.0

PHASE 1: SETUP - [PASS/FAIL]
PHASE 2: ADMIN AUTH - [PASS/FAIL]
PHASE 3: ARTISAN APPROVALS - [PASS/FAIL]
PHASE 4: PRODUCT APPROVALS - [PASS/FAIL]
PHASE 5: BLOG APPROVALS - [PASS/FAIL]
PHASE 6: SELLER DASHBOARD - [PASS/FAIL]
PHASE 7: DATABASE - [PASS/FAIL]
PHASE 8: API - [PASS/FAIL]
PHASE 9: ERROR SCENARIOS - [PASS/FAIL]
PHASE 10: PERFORMANCE - [PASS/FAIL]

TOTAL: [X] PASSED, [Y] FAILED

ISSUES FOUND:
1. ...
2. ...

NOTES:
...
```

---

## 🎉 TESTING COMPLETE!

After passing all tests:
1. Merge to main branch
2. Deploy to staging
3. Run integration tests
4. Deploy to production

