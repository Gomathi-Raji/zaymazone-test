import { Link, useLocation } from "react-router-dom";
import { Home, Store, Compass, User, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToTop } from "@/lib/scrollUtils";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { getTotalItems: getCartItems } = useCart();
  const { getTotalItems: getWishlistItems } = useWishlist();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const cartItems = getCartItems();
  const wishlistItems = getWishlistItems();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      onClick: scrollToTop
    },
    {
      icon: Store,
      label: "Shop",
      path: "/shop"
    },
    {
      icon: Compass,
      label: "Discover",
      path: "/categories"
    },
    {
      icon: Heart,
      label: "Wishlist",
      path: "/wishlist",
      badge: wishlistItems > 0 ? wishlistItems : undefined
    },
    {
      icon: ShoppingCart,
      label: "Cart",
      path: "/cart",
      badge: cartItems > 0 ? cartItems : undefined
    }
  ];

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Add swipe feedback or navigation logic here if needed
    if (isLeftSwipe || isRightSwipe) {
      // Could implement swipe between tabs or show feedback
      console.log(isLeftSwipe ? 'Swiped left' : 'Swiped right');
    }
  };

  // Haptic feedback for active states
  const handleNavClick = (item: typeof navItems[0]) => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Light haptic feedback
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  // Only show on mobile devices
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 safe-area-inset-bottom"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleNavClick(item)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ease-spring",
                "min-h-[44px] min-w-[44px]", // iOS touch target size
                isActive
                  ? "text-primary bg-primary/10 shadow-glow scale-105"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-95"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 mb-1 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "opacity-100 scale-105" : "opacity-75"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;