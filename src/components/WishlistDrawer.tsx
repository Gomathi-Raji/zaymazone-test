import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Star, MapPin, X } from "lucide-react";
import { mockProducts } from "@/data/products";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const WishlistDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([
    mockProducts[1], // Kashmiri Pashmina Shawl
    mockProducts[5]  // Brass Decorative Bowl
  ]);

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== productId));
    toast.success("Removed from wishlist");
  };

  const moveToCart = (productId: string) => {
    const product = wishlistItems.find(item => item.id === productId);
    if (product) {
      removeFromWishlist(productId);
      toast.success(`${product.name} added to cart`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Heart className="h-5 w-5" />
          {wishlistItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary flex items-center justify-center">
              {wishlistItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Your Wishlist ({wishlistItems.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Wishlist Items */}
          <div className="flex-1 overflow-auto px-6">
            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your wishlist is empty</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsOpen(false)}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistItems.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                    <Link 
                      to={`/product/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex-shrink-0"
                    >
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${product.id}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{product.artisan.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-sm">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => moveToCart(product.id)}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWishlist(product.id)}
                          className="px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {wishlistItems.length > 0 && (
            <div className="border-t p-6 space-y-3">
              <Button 
                className="w-full bg-gradient-primary hover:shadow-glow"
                onClick={() => {
                  wishlistItems.forEach(product => moveToCart(product.id));
                }}
              >
                Add All to Cart
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};