import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Filter, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductComparison } from "@/components/ProductComparison";
import { ComparisonFloatingButton } from "@/components/ComparisonFloatingButton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductComparison } from "@/hooks/useProductComparison";
import { api, Product } from "@/lib/api";
import { mockProducts } from "@/data/products";
import { toast } from "sonner";

const ShopWithBackend = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const {
    comparisonProducts,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    comparisonCount
  } = useProductComparison();

  // Use mock data instead of backend
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const productsData = useMemo(() => {
    let filtered = mockProducts;
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (priceRange.min !== undefined) {
      filtered = filtered.filter(p => p.price >= priceRange.min!);
    }
    if (priceRange.max !== undefined) {
      filtered = filtered.filter(p => p.price <= priceRange.max!);
    }
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    return {
      products: paginated,
      pagination: {
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasPrev: page > 1,
        hasNext: end < filtered.length
      }
    };
  }, [categoryFilter, searchQuery, priceRange, page, limit]);

  // Remove backend artisan fetch for now

  const categories = [
    "pottery", "textiles", "jewelry", "woodwork", 
    "metalwork", "paintings", "crafts", "toys"
  ];

  const priceRanges = [
    { label: "Under ₹1,000", min: 0, max: 999 },
    { label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "Above ₹10,000", min: 10001, max: undefined },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handlePriceFilter = (min?: number, max?: number) => {
    setPriceRange({ min, max });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPriceRange({});
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-red-600 mb-4">
            <p>Failed to load products. Please make sure the backend server is running.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Shop Artisan Crafts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover authentic handcrafted treasures from skilled artisans across India
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products, artisans, or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filters */}
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, index) => (
                <Button
                  key={index}
                  variant={
                    priceRange.min === range.min && priceRange.max === range.max
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handlePriceFilter(range.min, range.max)}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            {isLoading ? (
              "Loading products..."
            ) : productsData ? (
              `Showing ${productsData.products.length} of ${productsData.pagination.total} products`
            ) : (
              "No products found"
            )}
          </p>

          {/* Active Filters */}
          <div className="flex gap-2">
            {categoryFilter && categoryFilter !== 'all' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                Category: {categoryFilter} ✕
              </Badge>
            )}
            {(priceRange.min || priceRange.max) && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange({})}>
                Price: ₹{priceRange.min || 0} - ₹{priceRange.max || '∞'} ✕
              </Badge>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && productsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {productsData.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    images: product.images,
                    category: product.category,
                    subcategory: product.subcategory,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    artisan: {
                      id: product.artisan.id,
                      name: product.artisan.name,
                      location: product.artisan.location,
                      bio: product.artisan.bio,
                      avatar: product.artisan.avatar,
                      rating: product.artisan.rating,
                      totalProducts: product.artisan.totalProducts
                    },
                    stockCount: product.stockCount,
                    isHandmade: product.isHandmade,
                    featured: product.featured,
                    materials: product.materials || [],
                    tags: product.tags || [],
                    colors: product.colors || [],
                    dimensions: product.dimensions || '',
                    weight: product.weight || '',
                    inStock: product.inStock,
                    shippingTime: product.shippingTime || '3-5 days'
                  }}
                  onAddToComparison={addToComparison}
                />
              ))}
            </div>

            {/* Pagination */}
            {productsData.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!productsData.pagination.hasPrev}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(productsData.pagination.totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!productsData.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && productsData && productsData.products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}
      </main>

      {/* Product Comparison */}
      {comparisonCount > 0 && (
        <ComparisonFloatingButton
          count={comparisonCount}
          onClick={openComparison}
        />
      )}

      <ProductComparison
        products={comparisonProducts}
        isOpen={isComparisonOpen}
        onClose={closeComparison}
        onRemove={removeFromComparison}
        onClear={clearComparison}
      />

      <Footer />
    </div>
  );
};

export default ShopWithBackend;