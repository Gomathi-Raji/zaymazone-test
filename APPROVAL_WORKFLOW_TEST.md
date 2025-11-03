# Artisan Product Approval Workflow - Complete Test Guide

## ✅ Current Implementation Status

### Frontend (Artisan Form)
✅ **Form sends ALL fields:**
- name, description, price, originalPrice, stock
- category, subcategory
- materials, colors, tags (comma-separated, auto-split)
- dimensions, weight, shippingTime
- isHandmade (checkbox)
- images (array)

### Backend (Seller Routes)
✅ **Product Creation:**
- Endpoint: `POST /api/seller/products`
- Sets `approvalStatus: 'pending'`
- Sets `isActive: false`
- Assigns `artisanId` automatically from logged-in user
- Saves all form fields to database

### Admin Approval
✅ **Admin Endpoints:**
- `GET /api/admin/approvals/products` - Lists pending products
- `POST /api/admin/approvals/products/:id/approve` - Approves product
- `POST /api/admin/approvals/products/:id/reject` - Rejects product

## 🧪 Complete Test Flow

### Step 1: Artisan Creates Product

1. **Login as Artisan**
   - Navigate to: `http://localhost:8080/artisan/products`

2. **Click "Add Product" Button**

3. **Fill Complete Form:**

   **Basic Information:**
   ```
   Name: Handcrafted Clay Pot
   Category: pottery
   Description: Beautiful handmade clay pot with traditional designs
   ```

   **Product Details:**
   ```
   Subcategory: Vases
   Materials: Clay, Natural Glaze, Terracotta
   Colors: Red, Brown, Terracotta
   Tags: handmade, traditional, eco-friendly, pottery
   ```

   **Pricing & Inventory:**
   ```
   Price: 1500
   Original Price: 2000
   Stock: 10
   ```

   **Physical Properties:**
   ```
   Dimensions: 15cm x 15cm x 20cm
   Weight: 800g
   Shipping Time: 3-5 business days
   ```

   **Settings:**
   ```
   ☑ Handmade
   ```

   **Product Images:**
   - Upload 1-5 product images

4. **Click "Create" Button**

5. **Expected Result:**
   - ✅ Toast notification: "Product created and sent for approval"
   - ✅ Modal closes
   - ✅ Product appears in table with status badge: "pending"

### Step 2: Verify Backend Data

**Database Check:**
```javascript
// Product should be saved with:
{
  name: "Handcrafted Clay Pot",
  description: "Beautiful handmade clay pot with traditional designs",
  price: 1500,
  originalPrice: 2000,
  stock: 10,
  category: "pottery",
  subcategory: "Vases",
  materials: ["Clay", "Natural Glaze", "Terracotta"],
  colors: ["Red", "Brown", "Terracotta"],
  tags: ["handmade", "traditional", "eco-friendly", "pottery"],
  dimensions: "15cm x 15cm x 20cm",
  weight: "800g",
  shippingTime: "3-5 business days",
  isHandmade: true,
  images: [...],
  artisanId: ObjectId("..."),
  approvalStatus: "pending",  // ← KEY FIELD
  isActive: false,            // ← KEY FIELD
  createdAt: Date,
  updatedAt: Date
}
```

### Step 3: Admin Reviews Product

1. **Login as Admin**
   - Navigate to: `http://localhost:8080/admin`

2. **Go to "Approval Management"**
   - Click on "Approval Management" in sidebar
   - OR navigate to: `http://localhost:8080/admin/approvals`

3. **View Pending Products Tab**
   - Should see the newly created product:
     ```
     Product: Handcrafted Clay Pot
     Artisan: [Artisan Name]
     Category: pottery
     Price: ₹1500
     Submitted: [Date]
     Status: Pending
     ```

4. **Click "View Details" (Eye Icon)**
   - Should display ALL product information:
     - Basic info
     - Product details (subcategory, materials, colors, tags)
     - Pricing
     - Physical properties
     - Images

### Step 4: Admin Approves Product

1. **Click "Approve" Button (Green)**

2. **Expected Backend Call:**
   ```
   POST /api/admin/approvals/products/:id/approve
   ```

3. **Expected Database Update:**
   ```javascript
   {
     approvalStatus: "approved",  // Changed from "pending"
     isActive: true,              // Changed from false
     approvedAt: Date.now(),
     approvedBy: adminUserId
   }
   ```

4. **Expected Result:**
   - ✅ Toast notification: "Product approved successfully"
   - ✅ Product removed from "Pending" tab
   - ✅ Product now visible to customers on marketplace
   - ✅ Product appears in "All Products" with "Approved" badge

### Step 5: Verify Product is Live

1. **Navigate to Marketplace**
   - Go to: `http://localhost:8080/products`
   - OR category page: `http://localhost:8080/products?category=pottery`

2. **Expected Result:**
   - ✅ Product "Handcrafted Clay Pot" is visible
   - ✅ All details are displayed correctly
   - ✅ Customers can add to cart and purchase

### Step 6: Artisan Views Approved Product

1. **Login as Artisan**
   - Navigate to: `http://localhost:8080/artisan/products`

2. **Expected Result:**
   - ✅ Product shows status badge: "approved" (green)
   - ✅ Artisan can edit the product
   - ✅ Artisan can delete the product

## 🔄 Alternative Flow: Admin Rejects Product

### Rejection Process

1. **Admin clicks "Reject" Button (Red)**

2. **Admin enters rejection reason:**
   ```
   Reason: Images are not clear enough. Please upload higher quality photos.
   ```

3. **Expected Backend Call:**
   ```
   POST /api/admin/approvals/products/:id/reject
   Body: { reason: "Images are not clear enough..." }
   ```

4. **Expected Database Update:**
   ```javascript
   {
     approvalStatus: "rejected",
     isActive: false,
     rejectionReason: "Images are not clear enough...",
     rejectedAt: Date.now(),
     rejectedBy: adminUserId
   }
   ```

5. **Artisan sees rejection:**
   - Status badge: "rejected" (red)
   - Can view rejection reason
   - Can edit and resubmit product

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Artisan Form   │
│  (All Fields)   │
└────────┬────────┘
         │
         │ POST /api/seller/products
         │ {name, description, price, ...}
         ▼
┌─────────────────────────┐
│  Backend (seller.js)    │
│  - Validates data       │
│  - Sets approvalStatus: │
│    'pending'            │
│  - Sets isActive: false │
│  - Assigns artisanId    │
└────────┬────────────────┘
         │
         │ Save to MongoDB
         ▼
┌─────────────────────────┐
│  Product Collection     │
│  {                      │
│    ...all fields,       │
│    approvalStatus:      │
│      'pending',         │
│    isActive: false      │
│  }                      │
└────────┬────────────────┘
         │
         │ GET /api/admin/approvals/products
         ▼
┌─────────────────────────┐
│  Admin Dashboard        │
│  Approval Management    │
│  - View pending         │
│  - Approve/Reject       │
└────────┬────────────────┘
         │
         │ Approve: POST .../approve
         │ Reject:  POST .../reject
         ▼
┌─────────────────────────┐
│  Update Product         │
│  Approved:              │
│    approvalStatus:      │
│      'approved'         │
│    isActive: true       │
│                         │
│  Rejected:              │
│    approvalStatus:      │
│      'rejected'         │
│    isActive: false      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Marketplace            │
│  (if approved)          │
│  - Product visible      │
│  - Customers can buy    │
└─────────────────────────┘
```

## ✅ Verification Checklist

### Artisan Side:
- [ ] Form has all fields (matching admin form)
- [ ] All fields are sent to backend
- [ ] Success message after creation
- [ ] Product appears with "pending" status
- [ ] Can view product details
- [ ] Can edit pending products
- [ ] Can delete products

### Backend Side:
- [ ] Product saved with all fields
- [ ] `approvalStatus` set to "pending"
- [ ] `isActive` set to false
- [ ] `artisanId` correctly assigned
- [ ] Product appears in pending list

### Admin Side:
- [ ] Product appears in Approval Management
- [ ] All product details visible
- [ ] Can approve product
- [ ] Can reject product with reason
- [ ] Approved products become active
- [ ] Rejected products stay inactive

### Customer Side:
- [ ] Approved products visible in marketplace
- [ ] All product details displayed
- [ ] Can add to cart
- [ ] Can purchase

## 🐛 Troubleshooting

### Product not appearing in admin approval list?
- Check `approvalStatus` is "pending" in database
- Verify admin is logged in with correct permissions
- Check browser console for errors

### Product not visible after approval?
- Verify `isActive` changed to true
- Check `approvalStatus` changed to "approved"
- Clear browser cache
- Check marketplace filters

### Form data not saving?
- Check browser console for errors
- Verify authentication token is valid
- Check network tab for API response
- Verify all required fields are filled

## 🎉 Success Criteria

✅ Artisan can create product with ALL fields
✅ Product sent to admin with `approvalStatus: 'pending'`
✅ Admin can see product in Approval Management
✅ Admin can approve product
✅ Approved product becomes visible to customers
✅ All product details are preserved throughout workflow
