import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Eye,
  Download,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

const orders = [
  {
    id: "#ORD-001",
    customer: "Anita Patel",
    email: "anita@example.com",
    items: 2,
    total: "₹6,700",
    status: "Delivered",
    payment: "Paid",
    date: "2024-01-15",
    deliveryDate: "2024-01-18",
    artisan: "Priya Sharma"
  },
  {
    id: "#ORD-002",
    customer: "Rahul Gupta",
    email: "rahul@example.com",
    items: 1,
    total: "₹2,200",
    status: "Shipped",
    payment: "Paid",
    date: "2024-01-16",
    deliveryDate: "2024-01-20",
    artisan: "Rajesh Kumar"
  },
  {
    id: "#ORD-003",
    customer: "Sunita Mehta",
    email: "sunita@example.com",
    items: 3,
    total: "₹4,500",
    status: "Processing",
    payment: "Paid",
    date: "2024-01-17",
    deliveryDate: "2024-01-22",
    artisan: "Meera Devi"
  },
  {
    id: "#ORD-004",
    customer: "Arjun Singh",
    email: "arjun@example.com",
    items: 1,
    total: "₹1,800",
    status: "Pending",
    payment: "Failed",
    date: "2024-01-18",
    deliveryDate: null,
    artisan: "Vikram Singh"
  },
  {
    id: "#ORD-005",
    customer: "Kavya Reddy",
    email: "kavya@example.com",
    items: 2,
    total: "₹3,400",
    status: "Cancelled",
    payment: "Refunded",
    date: "2024-01-19",
    deliveryDate: null,
    artisan: "Priya Sharma"
  }
];

export function OrderManagement() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Delivered": return "default";
      case "Shipped": return "secondary";
      case "Processing": return "outline";
      case "Pending": return "secondary";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-3 h-3" />;
      case "Shipped": return <Truck className="w-3 h-3" />;
      case "Processing": return <Package className="w-3 h-3" />;
      case "Pending": return <Clock className="w-3 h-3" />;
      case "Cancelled": return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPaymentVariant = (payment: string) => {
    switch (payment) {
      case "Paid": return "default";
      case "Failed": return "destructive";
      case "Refunded": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Track and manage customer orders</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-medium text-foreground">{order.id}</h3>
                  <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                  <Badge variant={getPaymentVariant(order.payment)}>
                    {order.payment}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">{order.customer}</p>
                    <p>{order.email}</p>
                  </div>
                  
                  <div>
                    <p><span className="font-medium">Items:</span> {order.items}</p>
                    <p><span className="font-medium">Artisan:</span> {order.artisan}</p>
                  </div>
                  
                  <div>
                    <p><span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                    {order.deliveryDate && (
                      <p><span className="font-medium">Delivery:</span> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-semibold text-foreground text-lg">{order.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}