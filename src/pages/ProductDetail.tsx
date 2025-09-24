import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Share2, Star, MapPin, Truck, Shield, RotateCcw, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockProducts } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-card rounded-2xl overflow-hidden mb-4">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.featured && (
                <Badge className="bg-primary text-primary-foreground">Featured</Badge>
              )}
              {product.isHandmade && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Handmade
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              )}
            </div>

            {/* Title and Rating */}
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">In Stock</span>
                  {product.stockCount <= 5 && (
                    <span className="text-destructive ml-2">
                      Only {product.stockCount} left!
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-input rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-accent"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-input">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-accent"
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
              <Button 
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Artisan Info */}
            <div className="bg-card rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Meet the Artisan</h3>
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={product.artisan.avatar} />
                  <AvatarFallback>{product.artisan.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{product.artisan.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {product.artisan.location}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{product.artisan.bio}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.artisan.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {product.artisan.totalProducts} products
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>7-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% authentic handcrafted products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                
                <h4 className="font-semibold mt-6 mb-3">Materials & Craftsmanship</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-6 mb-3">Care Instructions</h4>
                <p className="text-muted-foreground">
                  Handle with care. Clean with a soft, dry cloth. Avoid exposure to direct sunlight for extended periods.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Dimensions:</dt>
                      <dd>{product.dimensions}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Weight:</dt>
                      <dd>{product.weight}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Materials:</dt>
                      <dd>{product.materials.join(", ")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Colors:</dt>
                      <dd>{product.colors.join(", ")}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Shipping & Returns</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping Time:</dt>
                      <dd>{product.shippingTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Return Policy:</dt>
                      <dd>7 days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Warranty:</dt>
                      <dd>1 year</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-8 p-6 bg-card rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-1">{product.rating}</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{product.reviewCount} reviews</div>
                  </div>
                  
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <span className="text-sm w-2">{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 80 + 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {Math.floor(Math.random() * 50 + 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[
                    {
                      name: "Priya M.",
                      rating: 5,
                      date: "2 weeks ago",
                      comment: "Absolutely beautiful craftsmanship! The attention to detail is incredible and it arrived perfectly packaged.",
                      verified: true
                    },
                    {
                      name: "Rajesh K.",
                      rating: 4,
                      date: "1 month ago", 
                      comment: "Great quality product. Shipping was fast and the artisan's work is truly impressive.",
                      verified: true
                    },
                    {
                      name: "Sarah L.",
                      rating: 5,
                      date: "3 weeks ago",
                      comment: "This piece adds such character to my home. Love supporting traditional artisans!",
                      verified: false
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-border pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.name}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  Write a Review
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;