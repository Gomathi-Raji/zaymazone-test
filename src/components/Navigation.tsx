import { useState } from "react";
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
import { Search, Menu, User, Heart, Palette } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { SearchDialog } from "./SearchDialog";
import { WishlistDrawer } from "./WishlistDrawer";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
// Using the uploaded logo directly

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const NavLinks = () => (
    <>
      <Link to="/" className="link-underline text-foreground hover:text-primary font-medium">
        Home
      </Link>
      <Link to="/shop" className="link-underline text-foreground hover:text-primary font-medium">
        Shop
      </Link>
      <Link to="/categories" className="link-underline text-foreground hover:text-primary font-medium">
        Categories
      </Link>
      <Link to="/artisans" className="link-underline text-foreground hover:text-primary font-medium">
        Artisans
      </Link>
      <Link to="/blog" className="link-underline text-foreground hover:text-primary font-medium">
        Blog
      </Link>
      <Link to="/about" className="link-underline text-foreground hover:text-primary font-medium">
        About
      </Link>
      <Link to="/contact" className="link-underline text-foreground hover:text-primary font-medium">
        Contact
      </Link>
    </>
  );

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img 
                src="/lovable-uploads/ec11dd45-921b-40e9-a539-00c89f7436ab.png" 
                alt="ZAYMAZONE Logo" 
                className="h-20 w-auto object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-lg"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <SearchDialog />

            {/* Wishlist */}
            <WishlistDrawer />

            {/* Cart */}
            <CartDrawer />

            {/* User Authentication */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Sign In</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/sign-in" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Sign in as Customer</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/sign-in-artisan" className="cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Sign in as Artisan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/sign-up" className="cursor-pointer">
                      <span>Create Account</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};