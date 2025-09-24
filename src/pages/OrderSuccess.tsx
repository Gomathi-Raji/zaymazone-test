import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck, MapPin, Clock, ArrowLeft, ShoppingBag } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  // Sample order data
  const orderData = {
    orderId: "ZM" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    date: new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    items: [
      { id: 1, name: "Handwoven Kashmiri Shawl", price: 4500, quantity: 1, image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&h=200&fit=crop" },
      { id: 2, name: "Blue Pottery Tea Set", price: 2200, quantity: 2, image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop" },
    ],
    shipping: {
      name: "John Doe",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    payment: {
      method: "Cash on Delivery",
      amount: 8900
    },
    estimatedDelivery: "5-7 business days"
  };

  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 200;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
              <Button 
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore More Products
              </Button>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{orderData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-medium">{orderData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{orderData.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₹{orderData.payment.amount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <Badge variant="outline">{orderData.estimatedDelivery}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{orderData.shipping.name}</p>
                  <p className="text-muted-foreground">{orderData.shipping.address}</p>
                  <p className="text-muted-foreground">
                    {orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.pincode}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-primary" />
                    <span className="font-medium">Tracking Information</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll receive tracking details via email once your order ships.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Items in your order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">₹{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₹{shippingCost.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{orderData.payment.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">What happens next?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">Order Processing</h4>
                  <p className="text-sm text-muted-foreground">We'll prepare your items for shipping within 1-2 business days.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">Shipping</h4>
                  <p className="text-sm text-muted-foreground">Your order will be shipped and you'll receive tracking information.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">Delivery</h4>
                  <p className="text-sm text-muted-foreground">Enjoy your authentic handcrafted products!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}