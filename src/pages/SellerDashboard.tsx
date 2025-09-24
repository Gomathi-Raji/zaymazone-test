import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProductManagement } from "@/components/dashboard/ProductManagement";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { ProfileManagement } from "@/components/dashboard/ProfileManagement";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  MessageSquare
} from "lucide-react";

export default function SellerDashboard() {
  const stats = [
    { title: "Total Sales", value: "$2,847", change: "+12%", icon: DollarSign },
    { title: "Products Listed", value: "24", change: "+3", icon: Package },
    { title: "Page Views", value: "1,249", change: "+8%", icon: TrendingUp },
    { title: "Customer Reviews", value: "4.8", change: "+0.2", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, Renu! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your craft business today.
            </p>
          </div>

          <DashboardStats stats={stats} />

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <RecentOrders />
                <QuickActions />
              </div>
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="orders">
              <RecentOrders />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsCharts />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}