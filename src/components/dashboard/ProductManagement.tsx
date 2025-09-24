import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Blue Pottery Tea Set",
    category: "Pottery",
    price: "$125",
    stock: 8,
    status: "Active",
    views: 245,
    trend: "up"
  },
  {
    id: 2,
    name: "Kashmiri Pashmina Shawl",
    category: "Textiles",
    price: "$180",
    stock: 3,
    status: "Low Stock",
    views: 189,
    trend: "down"
  },
  {
    id: 3,
    name: "Copper Water Bottle",
    category: "Metal Crafts",
    price: "$45",
    stock: 15,
    status: "Active",
    views: 156,
    trend: "up"
  },
  {
    id: 4,
    name: "Handwoven Jute Bag",
    category: "Textiles",
    price: "$28",
    stock: 0,
    status: "Out of Stock",
    views: 98,
    trend: "down"
  }
];

export function ProductManagement() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Low Stock": return "secondary";
      case "Out of Stock": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage your craft listings</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  <Badge variant={getStatusVariant(product.status)}>
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{product.category}</span>
                  <span>Stock: {product.stock}</span>
                  <div className="flex items-center gap-1">
                    <span>{product.views} views</span>
                    {product.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{product.price}</span>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}