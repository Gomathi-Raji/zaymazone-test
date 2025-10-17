# Seller Panel - Complete Implementation Guide

## Overview
This document outlines the complete implementation of the seller panel with real-time data from the database and proper API endpoints.

## Architecture

### Backend (Node.js + Express + MongoDB)
- **Framework**: Express.js with authentication middleware
- **Database**: MongoDB with Mongoose models
- **Real-time**: Socket.io ready (can be added)
- **API**: RESTful endpoints with proper error handling

### Frontend (React + TypeScript + Vite)
- **UI Framework**: shadcn/ui components
- **State Management**: React hooks with custom data hooks
- **Data Fetching**: Centralized service layer with auto-refresh
- **Authentication**: Firebase/JWT token-based

## Backend Implementation

### Server Routes: `/server/src/routes/seller.js`

#### 1. **Dashboard Stats Endpoint**
```
GET /api/seller/stats
Headers: Authorization: Bearer {token}
Response:
{
  stats: {
    totalProducts: number,
    activeProducts: number,
    totalOrders: number,
    completedOrders: number,
    totalRevenue: number,
    averageRating: number,
    totalReviews: number,
    artisanId: string
  }
}
```

#### 2. **Product Management**
- `GET /api/seller/products` - List all products (paginated, searchable)
- `POST /api/seller/products` - Create new product
- `GET /api/seller/products/:id` - Get product details
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Deactivate product

**Pagination & Search:**
- Query params: `page=1&limit=10&search="query"&status="active|inactive|all"`
- Returns: Products array + pagination metadata

#### 3. **Order Management**
- `GET /api/seller/orders` - List seller's orders (paginated)
- `GET /api/seller/orders/:id` - Get order details with customer info
- `PATCH /api/seller/orders/:id/status` - Update order status

**Order Statuses:** pending → processing → shipped → delivered

#### 4. **Analytics Endpoints**

**Sales Analytics:**
```
GET /api/seller/analytics/sales?period=30days|7days|90days|all
Returns: {
  data: [
    { _id: "2024-01-15", sales: 5, revenue: 15000, orders: 3 },
    ...
  ],
  period: string,
  dateRange: ISO string
}
```

**Revenue Summary:**
```
GET /api/seller/analytics/revenue
Returns: {
  totalRevenue: number,
  monthlyRevenue: number,
  pendingRevenue: number
}
```

**Order Status Breakdown:**
```
GET /api/seller/analytics/orders-status
Returns: {
  statusBreakdown: [
    { _id: "delivered", count: 25, totalAmount: 50000 },
    ...
  ]
}
```

**Customer Analytics:**
```
GET /api/seller/analytics/customers
Returns: {
  totalCustomers: number,
  repeatCustomers: number,
  topCustomers: [
    { _id: userId, totalSpent: number, orders: number, userInfo: [] },
    ...
  ]
}
```

**Product Performance:**
```
GET /api/seller/analytics/products
Returns: {
  products: [
    { _id, name, price, rating, reviewCount, viewCount, salesCount },
    ...
  ]
}
```

**Category Performance:**
```
GET /api/seller/analytics/categories
Returns: {
  categories: [
    { _id: category, productCount: number, avgRating: number, totalReviews: number },
    ...
  ]
}
```

#### 5. **Real-time Alerts**
```
GET /api/seller/alerts
Returns: {
  alerts: {
    lowStockProducts: [ { name, stockCount }, ... ],
    pendingOrdersCount: number,
    recentReviewCount: number,
    hasAlerts: boolean
  }
}
```

#### 6. **Profile Management**
- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/profile` - Update seller profile

### Database Models

**Used Models:**
- `Product` - Product details with artisanId reference
- `Order` - Orders with items and order history
- `Artisan` - Seller profile and stats
- `User` - Customer information

**Key Fields:**
- Product: name, description, price, originalPrice, stockCount, artisanId, category, rating, reviewCount, images
- Order: userId, items, totalAmount, status, createdAt
- Artisan: userId, name, bio, avatar, totalProducts, totalSales, rating

## Frontend Implementation

### 1. **Custom Hooks**: `/src/hooks/useSeller.ts`

Auto-refresh hooks for real-time data:

```typescript
// Stats hook with 30-second auto-refresh
const { stats, loading, error, refetch } = useSellerStats(refreshInterval);

// Products with pagination and search
const { products, pagination, loading, error } = useSellerProducts(page, limit, search);

// Orders with auto-refresh
const { orders, pagination, loading, error, refetch } = useSellerOrders(page, limit, status);

// Analytics
const { salesData, loading, error, refetch } = useSalesAnalytics(period);
const { products, loading, error } = useProductAnalytics();
const { revenue, loading, error } = useRevenueAnalytics();
const { customers, loading, error } = useCustomerAnalytics();

// Real-time alerts
const { alerts, loading, error, refetch } = useSellerAlerts();
```

### 2. **API Service**: `/src/services/sellerService.ts`

Centralized API calls with error handling:

```typescript
sellerService.getStats()
sellerService.getProducts(params)
sellerService.createProduct(data)
sellerService.updateProduct(id, data)
sellerService.deleteProduct(id)
sellerService.getOrders(params)
sellerService.updateOrderStatus(id, status)
sellerService.getSalesAnalytics(period)
sellerService.getRevenueAnalytics()
sellerService.getOrderStatusAnalytics()
sellerService.getCustomerAnalytics()
sellerService.getCategoryAnalytics()
sellerService.getAlerts()
```

### 3. **Components**

#### SellerProductManagement.tsx
- Search and filter products
- Pagination support
- Create/Edit/Delete products
- Real-time stock tracking
- Rating and review display

#### SellerOrderManagement.tsx
- Order listing with status filters
- Order details modal
- Status update functionality
- Customer information display

#### SellerAnalytics.tsx
- Sales charts (daily, weekly, monthly)
- Product performance metrics
- Revenue tracking
- Customer analytics
- Category breakdown

## Real-time Data Flow

### Current Implementation (Polling)
1. Component mounts → Hook calls API
2. Auto-refresh interval triggers → Hook refetches data
3. Data updates → Component re-renders

**Intervals:**
- Stats: 30 seconds
- Orders: 30 seconds
- Analytics: 60 seconds
- Alerts: 30 seconds

### Future Enhancement (WebSocket)
```javascript
// Socket.io implementation ready
// Namespace: /seller
// Events: order:update, product:update, alert:new
```

## Authentication Flow

1. User logs in with Firebase/JWT
2. Token stored in localStorage
3. Token included in all API requests
4. Middleware validates token: `authenticateToken`
5. Artisan profile loaded from userId
6. All queries filtered by artisanId

## Error Handling

```typescript
try {
  const data = await sellerService.getProducts();
} catch (error) {
  toast({ title: "Error", description: error.message });
  // Retry logic: exponential backoff
  // Offline support: cache fallback
}
```

## Testing Endpoints

### 1. Check Server Health
```bash
curl http://localhost:4000/health
```

### 2. Test Stats Endpoint
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/seller/stats
```

### 3. List Products
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:4000/api/seller/products?page=1&limit=10"
```

### 4. Create Product
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Handicraft Item","price":1500,"stockCount":10}' \
  http://localhost:4000/api/seller/products
```

### 5. Get Analytics
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:4000/api/seller/analytics/sales?period=30days"
```

## Performance Optimization

1. **Pagination**: 10 items per page by default
2. **Lean Queries**: MongoDB .lean() for read-only data
3. **Caching**: Client-side caching in hooks
4. **Lazy Loading**: Components load on demand
5. **Debouncing**: Search input debounced

## Security Measures

1. **Authentication**: Token validation on every request
2. **Authorization**: Artisan can only see their own data (artisanId check)
3. **Validation**: Input validation with Zod
4. **Rate Limiting**: Express rate limiter (120 req/min)
5. **CORS**: Configured allowed origins
6. **Helmet**: Security headers enabled

## Database Indexes

Recommended indexes for performance:
```javascript
// Product indexes
db.products.createIndex({ artisanId: 1 })
db.products.createIndex({ artisanId: 1, createdAt: -1 })
db.products.createIndex({ artisanId: 1, isActive: 1 })

// Order indexes
db.orders.createIndex({ "items.productArtisan": 1 })
db.orders.createIndex({ "items.productArtisan": 1, createdAt: -1 })
db.orders.createIndex({ "items.productArtisan": 1, status: 1 })
```

## Future Enhancements

1. **WebSocket Real-time Updates**
   - Order notifications
   - New messages
   - Stock alerts

2. **Advanced Analytics**
   - Predictive analytics
   - Customer segmentation
   - Seasonal trends

3. **Inventory Management**
   - Stock forecasting
   - Bulk uploads
   - SKU management

4. **Marketing Tools**
   - Promotional campaigns
   - Email notifications
   - Customer retention

5. **Payment Integration**
   - Payout management
   - Revenue tracking
   - Invoice generation

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection string valid
- [ ] Firebase credentials loaded
- [ ] CORS origins updated
- [ ] Rate limits adjusted for production
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] SSL certificates configured
- [ ] CDN for images configured
- [ ] Monitoring/alerting setup

## Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check token in localStorage, ensure token is valid

### Issue: 404 Artisan not found
**Solution**: User must complete artisan onboarding first

### Issue: Products not loading
**Solution**: Check MongoDB connection, verify indexes exist

### Issue: Slow performance
**Solution**: Enable caching, adjust pagination, optimize queries

## Support & Maintenance

- Monitor error logs regularly
- Update dependencies monthly
- Backup database daily
- Test disaster recovery
- Performance monitoring
- User feedback collection

---

**Last Updated**: October 2024
**Version**: 1.0.0
**Status**: Production Ready
