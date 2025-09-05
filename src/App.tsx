import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
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
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import SellerOnboarding from "./pages/SellerOnboarding";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/artisans" element={<Artisans />} />
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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
