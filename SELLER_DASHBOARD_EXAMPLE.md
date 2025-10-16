# Complete Seller Dashboard Example

## Full Working Example

### Step 1: Set up the Dashboard Component

Create a main seller dashboard that uses all the hooks:

```typescript
// src/pages/SellerDashboard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  useSellerStats,
  useSellerProducts,
  useSellerOrders,
  useSalesAnalytics,
  useRevenueAnalytics,
  useSellerAlerts,
} from "@/hooks/useSeller";
import {
  SellerProductManagement,
  SellerOrderManagement,
  SellerAnalytics,
} from "@/components/seller";
import { AlertCircle, RefreshCw } from "lucide-react";

export function SellerDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useSellerStats(30000);
  const { orders, loading: ordersLoading } = useSellerOrders(1, 5, undefined, 30000);
  const { revenue, loading: revenueLoading } = useRevenueAnalytics(30000);
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useSellerAlerts(30000);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchAlerts()]);
    setRefreshing(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your business</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Alerts Banner */}
      {alerts?.hasAlerts && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-semibold">⚠️ You have alerts</p>
                {alerts.lowStockProducts?.length > 0 && (
                  <p className="text-sm">{alerts.lowStockProducts.length} products low on stock</p>
                )}
                {alerts.pendingOrdersCount > 0 && (
                  <p className="text-sm">{alerts.pendingOrdersCount} pending orders</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedOrders} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(stats.totalRevenue / 100000).toFixed(1)}L
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ⭐ {stats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Card */}
      {revenue && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ₹{(revenue.totalRevenue / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                ₹{(revenue.monthlyRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                ₹{(revenue.pendingRevenue / 1000).toFixed(0)}K
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <SellerProductManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <SellerOrderManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SellerAnalytics />
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      {orders && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.user?.name} • {order.items?.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.totalAmount.toLocaleString()}</p>
                    <p
                      className={`text-sm ${
                        order.status === "delivered"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Step 2: Use the Dashboard

Add to your router:

```typescript
// src/App.tsx
import { SellerDashboard } from "@/pages/SellerDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seller" element={<SellerDashboard />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 3: Real-time Data Updates

The dashboard automatically updates:
- **Every 30 seconds**: Stats, Orders, Alerts
- **Every 60 seconds**: Analytics, Products

No additional code needed!

## API Response Examples

### Stats Response
```json
{
  "stats": {
    "totalProducts": 24,
    "activeProducts": 22,
    "totalOrders": 156,
    "completedOrders": 142,
    "totalRevenue": 5850000,
    "averageRating": 4.7,
    "totalReviews": 89,
    "artisanId": "507f1f77bcf86cd799439011"
  }
}
```

### Products Response
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Handmade Ceramic Bowl",
      "description": "Beautiful blue ceramic bowl",
      "price": 1500,
      "originalPrice": 2000,
      "stockCount": 15,
      "category": "Pottery",
      "images": ["https://example.com/bowl.jpg"],
      "isActive": true,
      "rating": 4.8,
      "reviewCount": 12,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

### Orders Response
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "orderNumber": "ORD-2024-001",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439012",
          "quantity": 2,
          "price": 1500
        }
      ],
      "totalAmount": 3000,
      "status": "delivered",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-10T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16
  }
}
```

### Analytics Response
```json
{
  "data": [
    {
      "_id": "2024-01-15",
      "sales": 5,
      "revenue": 15000,
      "orders": 3
    },
    {
      "_id": "2024-01-16",
      "sales": 8,
      "revenue": 24000,
      "orders": 5
    }
  ],
  "period": "30days",
  "dateRange": "2023-12-16T10:30:00.000Z"
}
```

## Best Practices

### 1. Use the hooks properly
```typescript
// ✅ Good: Use custom hooks
const { products, loading, error } = useSellerProducts(1);

// ❌ Bad: Direct API calls
const [products, setProducts] = useState([]);
useEffect(() => {
  fetch('/api/seller/products')
    .then(r => r.json())
    .then(d => setProducts(d.products));
}, []);
```

### 2. Handle errors
```typescript
// ✅ Good: Show errors to user
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

// ❌ Bad: Ignore errors
const { products } = useSellerProducts();
```

### 3. Use pagination
```typescript
// ✅ Good: Paginate large datasets
const { products, pagination } = useSellerProducts(page, 10);

// ❌ Bad: Load all data at once
const { products } = useSellerProducts(1, 10000);
```

### 4. Manage refresh intervals
```typescript
// ✅ Good: Set appropriate intervals
useSellerStats(30000); // 30 seconds

// ❌ Bad: Too frequent
useSellerStats(1000);  // 1 second - wastes resources
```

## Troubleshooting

### Products not loading
```
1. Check token: localStorage.getItem('firebase_id_token')
2. Verify API: curl http://localhost:4000/health
3. Check console for errors
4. Verify seller has been onboarded
```

### Stale data
```
1. Click refresh button
2. Increase auto-refresh interval
3. Manually call refetch()
```

### Performance issues
```
1. Reduce pagination limit if needed
2. Increase refresh intervals
3. Check network tab for slow requests
4. Verify database indexes exist
```

## Summary

This complete example shows:
- ✅ Setting up the dashboard
- ✅ Using all data hooks
- ✅ Displaying real-time stats
- ✅ Managing products and orders
- ✅ Showing analytics
- ✅ Handling errors
- ✅ Proper pagination
- ✅ Best practices

The dashboard will automatically update every 30-60 seconds with fresh data from the database!
