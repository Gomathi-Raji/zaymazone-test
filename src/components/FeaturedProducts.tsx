import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { mockProducts } from "@/data/products";
import { useProductComparison } from "@/hooks/useProductComparison";

export const FeaturedProducts = () => {
  const { addToComparison } = useProductComparison();
  
  // Get featured products
  const featuredProducts = mockProducts.filter(product => product.featured).slice(0, 6);

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Handcrafts
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our carefully curated collection of exceptional artisan pieces
          </p>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToComparison={addToComparison}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            className="btn-hero"
            asChild
          >
            <Link to="/shop">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};