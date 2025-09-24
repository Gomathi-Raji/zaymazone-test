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
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Shield,
  Ban
} from "lucide-react";

const users = [
  {
    id: 1,
    name: "Anita Patel",
    email: "anita@example.com",
    phone: "+91 98765 43210",
    role: "Customer",
    status: "Active",
    joinDate: "2023-05-15",
    lastLogin: "2024-01-18",
    totalOrders: 12,
    totalSpent: "₹45,600",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Rahul Gupta",
    email: "rahul@example.com",
    phone: "+91 87654 32109",
    role: "Customer",
    status: "Active",
    joinDate: "2023-03-22",
    lastLogin: "2024-01-17",
    totalOrders: 8,
    totalSpent: "₹32,400",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@crafthaven.com",
    phone: "+91 99999 88888",
    role: "Admin",
    status: "Active",
    joinDate: "2022-01-01",
    lastLogin: "2024-01-18",
    totalOrders: 0,
    totalSpent: "₹0",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sunita Mehta",
    email: "sunita@example.com",
    phone: "+91 76543 21098",
    role: "Customer",
    status: "Suspended",
    joinDate: "2023-08-10",
    lastLogin: "2024-01-10",
    totalOrders: 3,
    totalSpent: "₹8,900",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Moderator One",
    email: "mod@crafthaven.com",
    phone: "+91 88888 77777",
    role: "Moderator",
    status: "Active",
    joinDate: "2022-06-15",
    lastLogin: "2024-01-16",
    totalOrders: 0,
    totalSpent: "₹0",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  }
];

export function UserManagement() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Suspended": return "destructive";
      case "Inactive": return "secondary";
      default: return "outline";
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive";
      case "Moderator": return "secondary";
      case "Customer": return "outline";
      default: return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin": return <Shield className="w-3 h-3" />;
      case "Moderator": return <Shield className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users and permissions</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Export</Button>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{user.name}</h3>
                    <Badge variant={getRoleVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                      <p>Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        <span>{user.totalOrders} orders</span>
                      </div>
                      <p><span className="font-medium">Total spent:</span> {user.totalSpent}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Ban className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}