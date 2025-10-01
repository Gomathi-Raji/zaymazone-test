import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, MapPin, BarChart3, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";
import { QuickViewDialog } from "./QuickViewDialog";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToComparison?: (product: Product) => void;
}

export const ProductCard = ({ product, onQuickView, onAddToComparison }: ProductCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    if (product.stockCount === 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error is already handled in the cart context
    }
  };
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
          />
        </Link>
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button 
            size="sm"
            onClick={() => setIsQuickViewOpen(true)}
            className="bg-white text-foreground hover:bg-white/90 border border-white/20 shadow-soft"
          >
            Quick View
          </Button>
          {onAddToComparison && (
            <Button 
              size="sm"
              onClick={() => onAddToComparison(product)}
              className="bg-white/90 text-foreground hover:bg-white border border-white/20 shadow-soft"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Compare
            </Button>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">{discountPercentage}% OFF</Badge>
          )}
          {product.isHandmade && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Handmade
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Artisan Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{product.artisan.name}</span>
          <span>•</span>
          <span>{product.artisan.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          disabled={!product.inStock || cartLoading || product.stockCount === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {cartLoading ? 'Adding...' : 
           !product.inStock || product.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        {/* Stock info */}
        {product.inStock && product.stockCount <= 5 && product.stockCount > 0 && (
          <p className="text-xs text-destructive mt-2 text-center">
            Only {product.stockCount} left in stock!
          </p>
        )}
      </div>
      
      <QuickViewDialog 
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};