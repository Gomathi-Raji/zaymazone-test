import { Link, useLocation } from "react-router-dom";
import { Home, Store, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToTop } from "@/lib/scrollUtils";

const MobileBottomNav = () => {
  const location = useLocation();

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
      icon: User,
      label: "Profile",
      path: "/profile"
    }
  ];

  // Only show on mobile devices
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;