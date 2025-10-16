# Seller/Artisan Dashboard Implementation Guide

## Overview

A complete seller/artisan panel has been implemented with full CRUD operations, database persistence, and real-time data synchronization. The dashboard mirrors the admin panel capabilities while being scoped to individual artisans.

## Architecture

### Backend Stack
- **Framework**: Express.js on Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase JWT + Custom middleware
- **File Storage**: GridFS for image uploads
- **API Pattern**: RESTful endpoints

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components
- **State Management**: React hooks with React Query support
- **Styling**: Tailwind CSS
- **Icons**: lucide-react

## File Structure

### Backend
```
server/src/routes/
├── seller.js          # Main seller API endpoints
├── products.js        # Product endpoints (public)
├── artisans.js        # Artisan endpoints (public)
└── admin.js           # Admin endpoints (fixed)

server/src/models/
├── Product.js
├── Artisan.js
├── Order.js
├── User.js
└── Category.js
```

### Frontend
```
src/
├── pages/
│   └── SellerDashboard.tsx          # Main dashboard container
├── components/seller/
│   ├── SellerProductManagement.tsx  # Product CRUD UI
│   ├── SellerOrderManagement.tsx    # Order management UI
│   ├── SellerAnalytics.tsx          # Sales analytics UI
│   └── SellerProfile.tsx            # Profile management UI
├── services/
│   └── sellerService.ts             # API client methods
└── components/
    └── ImageUpload.tsx              # Reusable image upload component
```

## API Endpoints

All endpoints are protected with `authenticateToken` middleware and scoped to the authenticated user's artisan ID.

### Base URL: `/api/seller`

#### Statistics
```
GET /stats
Response: {
  stats: {
    totalProducts: number,
    activeProducts: number,
    totalOrders: number,
    completedOrders: number,
    totalRevenue: number,
    averageRating: number,
    totalReviews: number
  }
}
```

#### Products Management
```
GET /products                    # List seller's products (paginated)
POST /products                   # Create new product
GET /products/:id               # Get single product (verify ownership)
PUT /products/:id               # Update product
DELETE /products/:id            # Deactivate product (soft delete)
```

Example Product Data:
```json
{
  "name": "Handmade Pottery Vase",
  "description": "Beautiful handcrafted pottery",
  "price": 1500,
  "costPrice": 800,
  "stockCount": 25,
  "category": "Home Decor",
  "images": ["url1", "url2"],
  "isActive": true
}
```

#### Orders Management
```
GET /orders                      # List seller's orders (paginated)
GET /orders/:id                 # Get single order with customer details
PATCH /orders/:id/status        # Update order status

Status values: pending, processing, shipped, delivered, cancelled
```

#### Profile Management
```
GET /profile                    # Get artisan profile
PUT /profile                    # Update profile (businessName, description, avatar, bannerImage)
```

#### Analytics
```
GET /analytics/sales?period=30days    # Sales data for charts
  Parameters: period = 7days|30days|90days
  Returns: [{ date, sales, orders }, ...]

GET /analytics/products              # Top 10 products by sales
  Returns: [{ name, quantity, revenue }, ...]
```

## Frontend Components

### SellerDashboard (Main Container)
- Tabs: Overview, Products, Orders, Analytics, Profile
- Real-time stats loading from `/api/seller/stats`
- Responsive grid layout with stats cards
- Error handling and loading states

### SellerProductManagement
**Features:**
- Display all seller's products in a table
- Create new products via modal dialog
- Edit existing products
- Delete/deactivate products
- Image upload integration (up to 5 images per product)
- Form validation
- Real-time feedback with toast notifications

**Key Methods:**
- `loadProducts()`: Fetch products from `/api/seller/products`
- `handleSubmit()`: Create/update product
- `handleDelete()`: Delete product
- `handleEdit()`: Load product for editing

### SellerOrderManagement
**Features:**
- Display all seller's orders in a table
- View order details in modal
- Customer information display
- Update order status with dropdown
- Order items listing
- Status badges with color coding

**Key Methods:**
- `loadOrders()`: Fetch orders from `/api/seller/orders`
- `handleStatusUpdate()`: Update order status via `/api/seller/orders/:id/status`

### SellerAnalytics
**Features:**
- 30-day sales summary cards
- Sales trend visualization (bar chart style)
- Top 10 products by revenue
- Period selector (7, 30, 90 days)
- Real-time revenue and units metrics

**Key Methods:**
- `loadAnalytics()`: Fetch sales and product data
- Automatic period filtering

### SellerProfile
**Features:**
- Display artisan profile info
- Edit business name and description
- Avatar upload (single image)
- Banner image upload (single image)
- Profile status indicator
- Total products and sales display
- Image preview section

**Key Methods:**
- `loadProfile()`: Fetch profile from `/api/seller/profile`
- `handleSave()`: Update profile via PUT request

## Authentication Flow

1. User logs in via Firebase or admin login
2. Auth token stored in localStorage
3. Token retrieved by service methods
4. Included in Authorization header: `Bearer {token}`
5. Backend middleware verifies token and extracts user ID
6. User's artisan record retrieved and used for data filtering

**Token Storage Keys:**
- `firebase_id_token` (Firebase)
- `admin_token` (Admin)
- `auth_token` (Fallback)

## Data Filtering

All endpoints automatically filter data by artisan ID:
- Products filtered by `artisanId`
- Orders filtered to items created by that artisan
- Profile scoped to user's artisan record

This ensures data isolation and security.

## Image Upload Flow

1. User selects file in ImageUpload component
2. File sent to `/api/images/upload` endpoint
3. Backend saves to GridFS (MongoDB file storage)
4. URL returned to component
5. URL included in product/profile data
6. Displayed via `<img>` tags

**Supported Formats:** JPEG, PNG, GIF, WebP
**Max Size:** 5MB per file
**Max Files:** 5 per product (configurable)

## Error Handling

All components include:
- Try-catch blocks for API calls
- Toast notifications for success/error
- Loading states during API calls
- Fallback UI for empty states
- Validation before submission
- User-friendly error messages

## Usage Example

### Creating a Product
```typescript
const handleAddProduct = async () => {
  try {
    const response = await sellerService.createProduct({
      name: "My Product",
      description: "Product description",
      price: 999,
      costPrice: 500,
      stockCount: 50,
      category: "Handicrafts",
      images: ["https://..."]
    });
    
    // Product created successfully
    toast({ title: "Success", description: "Product created" });
    loadProducts();
  } catch (error) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }
};
```

### Fetching Orders
```typescript
const loadOrders = async () => {
  try {
    const data = await sellerService.getOrders({ page: 1, limit: 10 });
    setOrders(data.orders);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Database Models

### Key Fields Consistency

All models use `isActive: Boolean` for status:
- Products: `isActive`, `inStock`, `stockCount`, `featured`, `artisanId`
- Artisans: `isActive`, `verification.isVerified`, `userId`
- Orders: Referenced by artisan items
- Categories: `isActive` for filtering

**Important:** Use `isActive` NOT `status` for filtering

## Integration with Admin Panel

The seller dashboard does NOT conflict with the admin panel:
- Admin sees ALL data across all artisans
- Sellers see only their own data
- Same API patterns for consistency
- Different authentication scopes

## Testing Endpoints

### Quick Test Commands
```bash
# Get seller stats
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/seller/stats

# Get seller products
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/seller/products

# Create product
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":100}' \
  http://localhost:4000/api/seller/products
```

## Performance Considerations

1. **Pagination**: Implement for large product/order lists
2. **Caching**: Consider React Query for automatic caching
3. **Lazy Loading**: Analytics loaded on tab click
4. **Image Optimization**: GridFS handles efficient storage
5. **Database Indexes**: Ensure indexes on `artisanId` and `isActive`

## Future Enhancements

1. **Notifications**: Real-time order notifications
2. **Export**: PDF invoice/report generation
3. **Advanced Analytics**: Graphs, forecasting
4. **Bulk Operations**: Bulk product updates
5. **Integration**: Payment gateway integration
6. **Mobile App**: React Native implementation

## Support

For issues or questions:
1. Check browser console for errors
2. Verify authentication token validity
3. Ensure database connectivity
4. Check backend logs for API errors
5. Verify file permissions for image uploads

## Security Notes

- All endpoints require authentication
- Data scoped by artisan ID
- File uploads validated by type and size
- Passwords never exposed in frontend
- CORS should be configured on backend
- Rate limiting recommended for production
