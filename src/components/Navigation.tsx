import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Menu, 
  User, 
  Heart, 
  Palette, 
  ShoppingBag, 
  Star,
  Sparkles,
  ChevronDown,
  Gift,
  Crown
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { CartDrawer } from "./CartDrawer";
import { SearchDialog } from "./SearchDialog";
import { WishlistDrawer } from "./WishlistDrawer";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToTop } from "@/lib/scrollUtils";
import { getImageUrl } from "@/lib/api";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navigationItems = [
    { 
      to: "/", 
      label: "Home", 
      icon: <Sparkles className="h-4 w-4" />,
      onClick: scrollToTop 
    },
    { 
      to: "/shop", 
      label: "Shop", 
      icon: <ShoppingBag className="h-4 w-4" />
    },
    { 
      to: "/categories", 
      label: "Categories", 
      icon: <Gift className="h-4 w-4" /> 
    },
    { 
      to: "/artisans", 
      label: "Artisans", 
      icon: <Crown className="h-4 w-4" />
    },
    { 
      to: "/blog", 
      label: "Blog", 
      icon: <Star className="h-4 w-4" /> 
    },
    { 
      to: "/about", 
      label: "About", 
      icon: <Heart className="h-4 w-4" /> 
    },
    { 
      to: "/contact", 
      label: "Contact", 
      icon: <User className="h-4 w-4" /> 
    },
  ];

  const NavLinks = () => (
    <>
      {navigationItems.map((item) => (
        <motion.div
          key={item.to}
          className="relative"
          onHoverStart={() => setHoveredItem(item.to)}
          onHoverEnd={() => setHoveredItem(null)}
        >
          <Link
            to={item.to}
            className="group relative flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/80 hover:text-primary font-medium transition-all duration-300 hover:bg-primary/5"
            onClick={item.onClick}
          >
            <span className="group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </span>
            <span className="relative">
              {item.label}
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow"
                initial={{ width: 0 }}
                animate={{ width: hoveredItem === item.to ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </span>
          </Link>
        </motion.div>
      ))}
    </>
  );

  return (
    <>
      {/* Top promotional bar */}
      <motion.div 
        className="bg-gradient-to-r from-primary via-primary-glow to-primary text-white text-center py-2 text-sm font-medium"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Free shipping on orders over ₹999 • Handcrafted with love</span>
          <Sparkles className="h-4 w-4" />
        </div>
      </motion.div>

      <motion.nav
        className="bg-background/98 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-lg shadow-primary/5"
        animate={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(16px)",
          borderColor: isScrolled ? "hsl(var(--border))" : "rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/"
                className="flex items-center group relative"
                onClick={scrollToTop}
              >
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="ZAYMAZONE Logo"
                    className="h-16 w-auto object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-xl filter group-hover:brightness-110"
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg blur-xl"
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8] 
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                </div>
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    ZAYMAZONE
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">
                    Crafting Culture
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLinks />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SearchDialog />
              </motion.div>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <WishlistDrawer />
              </motion.div>

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <CartDrawer />
              </motion.div>

              {/* User Authentication */}
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <UserMenu />
                </motion.div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="relative bg-gradient-to-r from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 border border-primary/20 hover:border-primary/30 transition-all duration-300"
                      >
                        <User className="h-5 w-5 text-primary" />
                        <ChevronDown className="h-3 w-3 ml-1 text-primary" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 bg-background/98 backdrop-blur-xl border-primary/20 shadow-xl z-[100]" align="end" sideOffset={8}>
                    <DropdownMenuLabel className="text-primary font-semibold">Welcome to Zaymazone</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/20" />
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in" className="cursor-pointer flex items-center py-3 px-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <User className="mr-3 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">Sign in as Customer</p>
                          <p className="text-xs text-muted-foreground">Access your orders & wishlist</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in-artisan" className="cursor-pointer flex items-center py-3 px-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <Palette className="mr-3 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">Sign in as Artisan</p>
                          <p className="text-xs text-muted-foreground">Manage your craft business</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/20" />
                    <DropdownMenuItem asChild>
                      <Link to="/sign-up" className="cursor-pointer flex items-center py-2 px-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-glow/10 transition-all">
                        <span className="font-medium text-primary">Create New Account</span>
                        <Sparkles className="ml-auto h-4 w-4 text-primary" />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden bg-gradient-to-r from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 border border-primary/20 hover:border-primary/30"
                    >
                      <Menu className="h-5 w-5 text-primary" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/98 backdrop-blur-xl border-primary/20">
                  <motion.div
                    className="flex flex-col space-y-6 mt-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.2,
                        },
                      },
                    }}
                  >
                    {navigationItems.concat([
                      { to: "/help", label: "Help & Support", icon: <Heart className="h-4 w-4" /> },
                      { to: "/sustainability", label: "Sustainability", icon: <Sparkles className="h-4 w-4" /> },
                      { to: "/start-selling", label: "Start Selling", icon: <Crown className="h-4 w-4" /> },
                      ...(isAuthenticated ? [
                        { to: "/profile", label: "My Profile", icon: <User className="h-4 w-4" /> },
                        { to: "/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
                        { to: "/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
                      ] : []),
                    ]).map((item, index) => (
                      <motion.div
                        key={item.to}
                        variants={{
                          hidden: { x: 50, opacity: 0 },
                          visible: {
                            x: 0,
                            opacity: 1,
                            transition: {
                              duration: 0.4,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            },
                          },
                        }}
                      >
                        <Link
                          to={item.to}
                          className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 font-medium transition-all duration-300 group"
                          onClick={() => {
                            if (item.onClick) item.onClick();
                            setIsOpen(false);
                          }}
                        >
                          <span className="group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};