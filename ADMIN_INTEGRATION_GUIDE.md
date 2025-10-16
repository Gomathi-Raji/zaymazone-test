# Admin Dashboard Integration Guide

## Overview

This guide walks you through integrating the new approval management components into your existing admin dashboard.

## Step 1: Import Components

Add these imports to your admin dashboard file:

```typescript
import { AdminArtisanApprovals } from '@/components/AdminArtisanApprovals';
import { AdminProductApprovals } from '@/components/AdminProductApprovals';
import { AdminBlogApprovals } from '@/components/AdminBlogApprovals';
```

## Step 2: Create Approvals Section

Add a new section or tab to your admin dashboard:

### Option A: Using Tabs (Recommended)

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="artisan-approvals">
            Artisan Approvals
          </TabsTrigger>
          <TabsTrigger value="product-approvals">
            Product Approvals
          </TabsTrigger>
          <TabsTrigger value="blog-approvals">
            Blog Approvals
          </TabsTrigger>
        </TabsList>

        {/* Existing tabs */}
        <TabsContent value="overview">
          {/* Your overview content */}
        </TabsContent>

        <TabsContent value="users">
          {/* Your users content */}
        </TabsContent>

        {/* New approval tabs */}
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
    </div>
  );
}
```

### Option B: Using Navigation Links

```typescript
import { useLocation } from 'react-router-dom';

export function AdminDashboard() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-48 border-r">
        <nav className="space-y-2 p-4">
          <Button
            variant={activeSection === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('overview')}
            className="w-full justify-start"
          >
            Overview
          </Button>
          <Button
            variant={activeSection === 'artisan-approvals' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('artisan-approvals')}
            className="w-full justify-start"
          >
            Artisan Approvals
          </Button>
          <Button
            variant={activeSection === 'product-approvals' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('product-approvals')}
            className="w-full justify-start"
          >
            Product Approvals
          </Button>
          <Button
            variant={activeSection === 'blog-approvals' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('blog-approvals')}
            className="w-full justify-start"
          >
            Blog Approvals
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'artisan-approvals' && <AdminArtisanApprovals />}
        {activeSection === 'product-approvals' && <AdminProductApprovals />}
        {activeSection === 'blog-approvals' && <AdminBlogApprovals />}
      </main>
    </div>
  );
}
```

## Step 3: Add Route Protection

Ensure the admin dashboard route is protected:

```typescript
import { AdminRoute } from '@/components/AdminRoute';

<Route
  path="/admin/*"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

If you don't have AdminRoute, create one:

```typescript
// src/components/AdminRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user?.role || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## Step 4: Update Navigation

Add links to the new approval sections in your main navigation:

```typescript
// In Navigation component
{user?.role === 'admin' && (
  <>
    <Link to="/admin/dashboard">Admin Dashboard</Link>
    <Link to="/admin/artisan-approvals">Approvals</Link>
  </>
)}
```

## Step 5: Add Notification Badge (Optional)

Show pending counts in navigation:

```typescript
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export function AdminNavigation() {
  const [pendingCounts, setPendingCounts] = useState({
    artisans: 0,
    products: 0,
    blogs: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [artisans, products, blogs] = await Promise.all([
          apiRequest('/admin-approvals/pending-artisans?limit=1') as Promise<any>,
          apiRequest('/admin-approvals/pending-products?limit=1') as Promise<any>,
          apiRequest('/admin-approvals/pending-blogs?limit=1') as Promise<any>
        ]);

        setPendingCounts({
          artisans: artisans?.total || 0,
          products: products?.total || 0,
          blogs: blogs?.total || 0
        });
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };

    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4">
      {pendingCounts.artisans > 0 && (
        <Badge variant="destructive">
          {pendingCounts.artisans} Artisans
        </Badge>
      )}
      {pendingCounts.products > 0 && (
        <Badge variant="destructive">
          {pendingCounts.products} Products
        </Badge>
      )}
      {pendingCounts.blogs > 0 && (
        <Badge variant="destructive">
          {pendingCounts.blogs} Blogs
        </Badge>
      )}
    </div>
  );
}
```

## Step 6: Style Integration

The components use shadcn/ui components. Ensure you have these installed:

```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
```

## Step 7: Add to Admin Routes

Update your admin routes file:

```typescript
// src/routes/admin.routes.ts
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminRoute } from '@/components/AdminRoute';

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'artisan-approvals',
        element: <AdminDashboard initialTab="artisan-approvals" />
      },
      {
        path: 'product-approvals',
        element: <AdminDashboard initialTab="product-approvals" />
      },
      {
        path: 'blog-approvals',
        element: <AdminDashboard initialTab="blog-approvals" />
      }
    ]
  }
];
```

## Example: Complete Admin Dashboard Component

```typescript
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminArtisanApprovals } from '@/components/AdminArtisanApprovals';
import { AdminProductApprovals } from '@/components/AdminProductApprovals';
import { AdminBlogApprovals } from '@/components/AdminBlogApprovals';
import { AdminRoute } from '@/components/AdminRoute';

export function AdminDashboard({ initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <AdminRoute>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your platform, review applications, and approve content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              Users
            </TabsTrigger>
            <TabsTrigger value="artisan-approvals">
              Artisans
            </TabsTrigger>
            <TabsTrigger value="product-approvals">
              Products
            </TabsTrigger>
            <TabsTrigger value="blog-approvals">
              Blogs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DashboardCard title="Pending Artisans" value="0" />
              <DashboardCard title="Pending Products" value="0" />
              <DashboardCard title="Pending Blogs" value="0" />
              <DashboardCard title="Active Sellers" value="0" />
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {/* Your existing users management */}
            <p>User management content here</p>
          </TabsContent>

          {/* Artisan Approvals Tab */}
          <TabsContent value="artisan-approvals" className="space-y-4">
            <AdminArtisanApprovals />
          </TabsContent>

          {/* Product Approvals Tab */}
          <TabsContent value="product-approvals" className="space-y-4">
            <AdminProductApprovals />
          </TabsContent>

          {/* Blog Approvals Tab */}
          <TabsContent value="blog-approvals" className="space-y-4">
            <AdminBlogApprovals />
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
}

// Helper component
function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
```

## Verification Checklist

After integration:

- [ ] Import statements are correct
- [ ] Components render without errors
- [ ] Admin route protection is in place
- [ ] Navigation shows new approval sections
- [ ] Tabs switch between sections
- [ ] API calls are successful
- [ ] Admin can approve/reject items
- [ ] Notifications appear on success/error
- [ ] Pagination works correctly
- [ ] Status filters work

## Troubleshooting

### Components not rendering
- Check all imports are correct
- Verify shadcn/ui components are installed
- Check console for JavaScript errors

### API calls failing
- Verify backend routes are registered
- Check JWT token is being passed
- Verify admin role is set correctly

### Styling issues
- Ensure Tailwind CSS is configured
- Check shadcn/ui components are installed
- Verify dark mode settings if applicable

### Performance issues
- Reduce page size limit in components
- Add debouncing for filters
- Consider virtualizing long lists

## Next Steps

1. Test with real data in staging
2. Configure email notifications
3. Set up analytics/monitoring
4. Train admin team on usage
5. Document approval criteria
6. Create SLA guidelines

## Support

For issues:
1. Check browser console for errors
2. Verify all files are imported correctly
3. Review network tab in DevTools
4. Check backend logs for API errors
5. Verify database connection

---

**Last Updated**: 2024  
**Compatibility**: React 18+, TypeScript 5+, shadcn/ui, Express.js
