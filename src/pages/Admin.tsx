import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductManagement } from "@/components/dashboard/ProductManagement";
import { ArtisanManagement } from "@/components/admin/ArtisanManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  UserCheck, 
  FileText, 
  BarChart3,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "Total Products", value: "1,247", icon: Package, trend: "+12%", color: "text-blue-600" },
    { label: "Active Artisans", value: "156", icon: Users, trend: "+8%", color: "text-green-600" },
    { label: "Orders Today", value: "23", icon: ShoppingCart, trend: "+15%", color: "text-purple-600" },
    { label: "Total Users", value: "5,432", icon: UserCheck, trend: "+5%", color: "text-orange-600" },
  ];

  const alerts = [
    { type: "warning", message: "5 products are low in stock", severity: "medium" },
    { type: "info", message: "3 new artisan applications pending", severity: "low" },
    { type: "error", message: "2 payment issues require attention", severity: "high" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your marketplace data and operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="artisans" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Artisans
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500">{stat.trend}</span>
                        </div>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalyticsOverview />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alerts & Notifications
                  </CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{alert.message}</p>
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        } className="mt-1">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="artisans">
            <ArtisanManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}