import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ShopWithBackend from "./pages/ShopWithBackend";
import Artisans from "./pages/Artisans";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Help from "./pages/Help";
import Sustainability from "./pages/Sustainability";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ProductDetail from "./pages/ProductDetail";
import StartSelling from "./pages/StartSelling";
import SellerDashboard from "./pages/SellerDashboard";
import SellerSuccess from "./pages/SellerSuccess";
import UserDashboard from "./pages/UserDashboard";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import SellerOnboarding from "./pages/SellerOnboarding";
import ArtisanDetail from "./pages/ArtisanDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import APITestPage from "./pages/APITestPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SignInArtisan from "./pages/SignInArtisan";
import SignUpArtisan from "./pages/SignUpArtisan";
import Dashboard from "./pages/Dashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <MobileBottomNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<ShopWithBackend />} />
            <Route path="/shop-mock" element={<Shop />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/artisans" element={<Artisans />} />
            <Route path="/artisan/:id" element={<ArtisanDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/start-selling" element={<StartSelling />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller-success" element={<SellerSuccess />} />
            <Route path="/seller-onboarding" element={<SellerOnboarding />} />
            <Route path="/account" element={<UserDashboard />} />
            <Route path="/account/orders" element={<UserDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/api-test" element={<APITestPage />} />
            
            {/* Authentication Routes */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in-artisan" element={<SignInArtisan />} />
            <Route path="/sign-up-artisan" element={<SignUpArtisan />} />
            <Route path="/sign-up-artisan" element={<SignUpArtisan />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
