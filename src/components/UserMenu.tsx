import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Package, LogOut, Palette, BarChart3, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/api";

export const UserMenu = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    return user?.role === 'artisan' ? '/artisan-dashboard' : '/dashboard';
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getImageUrl(user?.avatar)} alt={user?.name} />
            <AvatarFallback className={user?.role === 'artisan' ? 'bg-orange-600 text-white' : 'bg-primary text-primary-foreground'}>
              {user ? getInitials(user.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs leading-none text-orange-600 capitalize">
              {user?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to={getDashboardLink()}>
            {user?.role === 'artisan' ? (
              <Palette className="mr-2 h-4 w-4" />
            ) : (
              <User className="mr-2 h-4 w-4" />
            )}
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {user?.role === 'artisan' ? (
          <>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/artisan/products">
                <Package className="mr-2 h-4 w-4" />
                <span>My Products</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/artisan/orders">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Orders</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/orders">
                <Package className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/wishlist">
                <Heart className="mr-2 h-4 w-4" />
                <span>Wishlist</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/addresses">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Addresses</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};