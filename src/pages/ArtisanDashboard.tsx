import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Star, 
  Plus,
  DollarSign,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtisanDashboard = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: 'My Products',
      description: 'Manage your product listings',
      icon: Package,
      href: '/artisan/products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingCart,
      href: '/artisan/orders',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/10'
    },
    {
      title: 'Analytics',
      description: 'Track your sales performance',
      icon: TrendingUp,
      href: '/artisan/analytics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10'
    },
    {
      title: 'Customers',
      description: 'View your customer base',
      icon: Users,
      href: '/artisan/customers',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/10'
    },
    {
      title: 'Reviews',
      description: 'Manage product reviews',
      icon: Star,
      href: '/artisan/reviews',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10'
    },
    {
      title: 'Messages',
      description: 'Customer inquiries and support',
      icon: MessageSquare,
      href: '/artisan/messages',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user?.name || 'Artisan'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your craft business and connect with customers
            </p>
          </div>
          <Link to="/artisan/products/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-green-600">+2 this month</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-green-600">+12 this week</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₹45,678</p>
                  <p className="text-xs text-green-600">+8% this month</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs text-green-600">+15% this week</p>
                </div>
                <Eye className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${item.bgColor}`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #12345</p>
                    <p className="text-sm text-muted-foreground">Terracotta Vase × 2</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹2,598</p>
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      New
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #12344</p>
                    <p className="text-sm text-muted-foreground">Blue Pottery Set</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹2,799</p>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Processing
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #12343</p>
                    <p className="text-sm text-muted-foreground">Handloom Bedsheet</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹1,899</p>
                    <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      Shipped
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/artisan/orders">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Your craft business overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Selling Product</span>
                  <span className="text-sm text-muted-foreground">Terracotta Vase</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Rate</span>
                  <span className="text-sm text-green-600">98%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Products</span>
                  <span className="text-sm text-muted-foreground">22 of 24</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>This Month's Highlights</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 25% increase in profile views</li>
                    <li>• 2 new 5-star reviews</li>
                    <li>• Featured in "Trending Crafts"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
                  <p className="opacity-90 mb-4">
                    Add more products, engage with customers, and boost your sales
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link to="/artisan/products/new">
                    <Button variant="secondary">
                      Add Product
                    </Button>
                  </Link>
                  <Link to="/artisan/analytics">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanDashboard;