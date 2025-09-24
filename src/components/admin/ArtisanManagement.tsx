import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Star,
  Award,
  CheckCircle,
  XCircle
} from "lucide-react";

const artisans = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya@example.com",
    location: "Jaipur, Rajasthan",
    speciality: "Blue Pottery",
    experience: "15+ years",
    rating: 4.9,
    products: 24,
    totalSales: 89,
    revenue: "₹2,45,000",
    status: "Active",
    joinDate: "2022-03-15",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    location: "Moradabad, UP",
    speciality: "Brass Work",
    experience: "20+ years",
    rating: 4.8,
    products: 18,
    totalSales: 156,
    revenue: "₹3,78,000",
    status: "Active",
    joinDate: "2021-11-08",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Meera Devi",
    email: "meera@example.com",
    location: "Kashmir",
    speciality: "Pashmina Weaving",
    experience: "12+ years",
    rating: 4.9,
    products: 31,
    totalSales: 67,
    revenue: "₹4,23,000",
    status: "Pending",
    joinDate: "2023-01-20",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram@example.com",
    location: "Jodhpur, Rajasthan",
    speciality: "Wood Carving",
    experience: "18+ years",
    rating: 4.7,
    products: 12,
    totalSales: 89,
    revenue: "₹1,89,000",
    status: "Suspended",
    joinDate: "2022-07-12",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  }
];

export function ArtisanManagement() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Pending": return "secondary";
      case "Suspended": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <CheckCircle className="w-3 h-3" />;
      case "Suspended": return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Artisan Management</CardTitle>
          <CardDescription>Manage artisan profiles and applications</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Artisan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search artisans..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Export</Button>
        </div>

        <div className="space-y-4">
          {artisans.map((artisan) => (
            <div key={artisan.id} className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={artisan.avatar} alt={artisan.name} />
                  <AvatarFallback>{artisan.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{artisan.name}</h3>
                    <Badge variant={getStatusVariant(artisan.status)} className="flex items-center gap-1">
                      {getStatusIcon(artisan.status)}
                      {artisan.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <p>{artisan.email}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{artisan.location}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p><span className="font-medium">Speciality:</span> {artisan.speciality}</p>
                      <p><span className="font-medium">Experience:</span> {artisan.experience}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{artisan.rating}</span>
                        <span className="text-xs">({artisan.totalSales} sales)</span>
                      </div>
                      <p><span className="font-medium">Revenue:</span> {artisan.revenue}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right mr-4">
                  <p className="font-semibold text-foreground">{artisan.products} Products</p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(artisan.joinDate).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Award className="w-4 h-4" />
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