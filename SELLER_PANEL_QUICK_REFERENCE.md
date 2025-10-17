# Seller Panel - Quick Reference Guide

## Quick Start

### Starting the Backend
```bash
cd server
npm install
npm run dev  # Runs on http://localhost:4000
```

### Starting the Frontend
```bash
npm install
npm run dev  # Runs on http://localhost:5173
```

## API Quick Reference

### Authentication
All requests require:
```
Header: Authorization: Bearer {firebase_token}
```

### Common Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/seller/stats` | Dashboard statistics |
| GET | `/api/seller/products` | List products |
| POST | `/api/seller/products` | Create product |
| GET | `/api/seller/orders` | List orders |
| PATCH | `/api/seller/orders/:id/status` | Update order status |
| GET | `/api/seller/analytics/sales` | Sales chart data |
| GET | `/api/seller/analytics/revenue` | Revenue summary |
| GET | `/api/seller/alerts` | Real-time alerts |

## Component Usage

### Using Seller Hooks

```typescript
import { useSellerProducts, useSellerStats, useSellerOrders } from '@/hooks/useSeller';

function SellerDashboard() {
  // Auto-refresh every 30 seconds
  const { stats, loading, error, refetch } = useSellerStats(30000);
  
  // With pagination
  const { products, pagination } = useSellerProducts(1, 10);
  
  // With auto-refresh
  const { orders, refetch: refreshOrders } = useSellerOrders(1, 10);

  return (
    <div>
      {loading && <Spinner />}
      {error && <Error message={error} />}
      {stats && <StatsDisplay data={stats} />}
    </div>
  );
}
```

### Using Seller Service

```typescript
import { sellerService } from '@/services/sellerService';

// Create product
await sellerService.createProduct({
  name: 'Product Name',
  price: 1500,
  stockCount: 10,
  category: 'Handicrafts'
});

// Update order status
await sellerService.updateOrderStatus(orderId, 'shipped');

// Get analytics
const analytics = await sellerService.getSalesAnalytics('30days');
```

## Component Structure

```
/src/components/seller/
├── SellerProductManagement.tsx    # Product CRUD
├── SellerOrderManagement.tsx      # Order tracking
├── SellerAnalytics.tsx            # Charts & metrics
├── SellerProfile.tsx              # Profile settings
└── SellerDashboard.tsx           # Main dashboard

/src/hooks/
└── useSeller.ts                   # All data hooks

/src/services/
└── sellerService.ts               # API client
```

## Data Refresh Intervals

| Feature | Interval | Purpose |
|---------|----------|---------|
| Stats | 30s | Dashboard metrics |
| Orders | 30s | Order updates |
| Alerts | 30s | New notifications |
| Analytics | 60s | Chart updates |
| Products | On demand | Product list |

## Common Tasks

### Fetch Products with Search
```typescript
const { products } = useSellerProducts(1, 10, 'search query');
```

### Update Product
```typescript
await sellerService.updateProduct(productId, {
  name: 'Updated Name',
  price: 2000,
  stockCount: 15
});
```

### Change Order Status
```typescript
await sellerService.updateOrderStatus(orderId, 'delivered');
```

### Get Sales Data for Charts
```typescript
const { salesData } = useSalesAnalytics('30days');
// salesData = [{ _id: '2024-01-15', sales: 5, revenue: 15000 }, ...]
```

### Refresh Data Manually
```typescript
const { refetch } = useSellerStats();
// Call later to refresh
await refetch();
```

## Error Handling

```typescript
try {
  const data = await sellerService.getProducts();
} catch (error) {
  if (error.message.includes('401')) {
    // Re-authenticate
  } else if (error.message.includes('404')) {
    // Data not found
  } else {
    // Generic error
  }
}
```

## Query Parameters

### Product List
```
GET /api/seller/products?page=1&limit=10&search=query&status=active
```

### Order List
```
GET /api/seller/orders?page=1&limit=10&status=delivered
```

### Analytics
```
GET /api/seller/analytics/sales?period=30days
GET /api/seller/analytics/sales?period=7days|90days|all
```

## Order Status Flow

```
pending → processing → shipped → delivered
  ↓          ↓          ↓
cancelled (anytime)
```

## Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Resource created |
| 400 | Bad request | Check input data |
| 401 | Unauthorized | Re-authenticate |
| 404 | Not found | Check IDs/routes |
| 500 | Server error | Check logs |

## File Organization

**Backend:**
- Routes: `/server/src/routes/seller.js`
- Models: `/server/src/models/`
- Middleware: `/server/src/middleware/auth.js`

**Frontend:**
- Components: `/src/components/seller/`
- Hooks: `/src/hooks/useSeller.ts`
- Services: `/src/services/sellerService.ts`

## Performance Tips

1. Use pagination (limit=10)
2. Search only when needed (debounce)
3. Auto-refresh intervals: 30-60 seconds
4. Cache frequently accessed data
5. Load images lazily

## Debugging

### Check Token
```typescript
console.log(localStorage.getItem('firebase_id_token'));
```

### Monitor API Calls
```typescript
// Network tab in DevTools shows all API calls
// Check Authorization headers
```

### View Component Hooks
```typescript
// React DevTools shows hook state
// Check loading, error, data states
```

## Important Notes

- ✅ All data is filtered by artisanId (seller isolation)
- ✅ Token required for all endpoints
- ✅ Pagination required for large datasets
- ✅ Auto-refresh prevents stale data
- ✅ Error handling in components
- ✅ Database indexes optimized for queries

## Need Help?

1. Check SELLER_PANEL_IMPLEMENTATION.md for detailed docs
2. Review example components
3. Check browser console for errors
4. Verify API is running: `curl http://localhost:4000/health`
5. Check MongoDB connection

---

**Tip**: Use React DevTools to inspect component state and hooks!
