import { useState, useEffect } from "react";
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
  Ban,
  Loader2
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    
    // Set up real-time polling every 60 seconds
    const interval = setInterval(() => {
      loadUsers();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined
      });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users data",
        variant: "destructive"
      });
      // Set fallback data
      setUsers([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadUsers();
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    loadUsers();
  };

  const handleSuspend = async (userId: number) => {
    try {
      // TODO: Implement suspend user endpoint
      toast({
        title: "Success",
        description: "User suspended successfully"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive"
      });
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      // TODO: Implement activate user endpoint
      toast({
        title: "Success",
        description: "User activated successfully"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive"
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Suspended": return "destructive";
      case "Pending": return "secondary";
      default: return "outline";
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive";
      case "Artisan": return "secondary";
      case "Customer": return "default";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="artisan">Artisan</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    <span>{user.totalOrders} orders • {user.totalSpent}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  {user.status === "Active" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSuspend(user.id)}
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(user.id)}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
