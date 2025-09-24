import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  ShoppingBag, 
  Star,
  Edit,
  Save,
  Camera
} from "lucide-react";
import { useState } from "react";
import userAvatar from "@/assets/user-avatar.jpg";
import wishlistKashmiriShawl from "@/assets/wishlist-kashmiri-shawl.jpg";
import wishlistBluePottery from "@/assets/wishlist-blue-pottery.jpg";
import wishlistCopperBottle from "@/assets/wishlist-copper-bottle.jpg";

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Art enthusiast and collector of traditional crafts. I love supporting local artisans and discovering unique handmade pieces.",
    joinDate: "March 2023"
  });

  const [orders] = useState([
    {
      id: "#ORD-2024-001",
      date: "Jan 15, 2024",
      status: "Delivered",
      total: "$187",
      items: 2,
      artisan: "Renu Kumari"
    },
    {
      id: "#ORD-2024-002", 
      date: "Jan 08, 2024",
      status: "Shipped",
      total: "$245",
      items: 1,
      artisan: "Vikram Sharma"
    },
    {
      id: "#ORD-2024-003",
      date: "Dec 28, 2023", 
      status: "Delivered",
      total: "$98",
      items: 3,
      artisan: "Meera Devi"
    }
  ]);

  const [wishlist] = useState([
    {
      id: 1,
      name: "Handwoven Kashmiri Shawl",
      price: "$180",
      artisan: "Rajesh Kumar",
      image: wishlistKashmiriShawl
    },
    {
      id: 2,
      name: "Blue Pottery Dinner Set",
      price: "$125",
      artisan: "Renu Kumari", 
      image: wishlistBluePottery
    },
    {
      id: 3,
      name: "Copper Water Bottle",
      price: "$45",
      artisan: "Arjun Singh",
      image: wishlistCopperBottle
    }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered": return <Badge variant="default">Delivered</Badge>;
      case "Shipped": return <Badge variant="secondary">Shipped</Badge>;
      case "Processing": return <Badge variant="outline">Processing</Badge>;
      default: return <Badge variant="destructive">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={userAvatar} />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0">
                          <Camera className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{userData.name}</h3>
                      <p className="text-sm text-muted-foreground">Customer since {userData.joinDate}</p>
                      <Badge variant="secondary" className="mt-1">Verified Customer</Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={userData.name}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={userData.email}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={userData.phone}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={userData.location}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea 
                      id="bio" 
                      value={userData.bio}
                      disabled={!isEditing}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-semibold">$1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wishlist Items</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-semibold">{userData.joinDate}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {userData.joinDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.items} item{order.items > 1 ? 's' : ''} from {order.artisan}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{order.total}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {item.artisan}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{item.price}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm">
                              <ShoppingBag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Order updates</span>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New product alerts</span>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing emails</span>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-foreground mb-4">Security</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-foreground mb-4">Danger Zone</h3>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;