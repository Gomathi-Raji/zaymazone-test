import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from '@/components/ImageUpload';

interface Artisan {
  _id: string;
  name: string;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  avatar: string;
  coverImage: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalRatings: number;
  totalProducts: number;
  verification: {
    isVerified: boolean;
    verifiedAt?: Date;
  };
  isActive: boolean;
  joinedDate: Date;
}

export function ArtisanManagement() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    city: "",
    state: "",
    country: "India",
    avatar: [] as string[],
    coverImage: [] as string[],
    specialties: "",
    experience: "",
    userId: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadArtisans();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadArtisans = async () => {
    try {
      setLoading(true);
      const response = await adminService.getArtisans({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      });
      setArtisans(response.artisans || []);
    } catch (error) {
      console.error('Error loading artisans:', error);
      toast({
        title: "Error",
        description: "Failed to load artisans data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadArtisans();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadArtisans();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      city: "",
      state: "",
      country: "India",
      avatar: [],
      coverImage: [],
      specialties: "",
      experience: "",
      userId: ""
    });
  };

  const handleCreateArtisan = async () => {
    try {
      const artisanData = {
        name: formData.name,
        bio: formData.bio,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        avatar: formData.avatar[0] || "",
        coverImage: formData.coverImage[0] || "",
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        experience: parseInt(formData.experience) || 0,
        userId: formData.userId,
        verification: {
          isVerified: false
        },
        isActive: true
      };

      await adminService.createArtisan(artisanData);
      toast({
        title: "Success",
        description: "Artisan created successfully"
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadArtisans();
    } catch (error) {
      console.error('Error creating artisan:', error);
      toast({
        title: "Error",
        description: "Failed to create artisan",
        variant: "destructive"
      });
    }
  };

  const handleEditArtisan = async () => {
    if (!editingArtisan) return;

    try {
      const artisanData = {
        name: formData.name,
        bio: formData.bio,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        avatar: formData.avatar[0] || "",
        coverImage: formData.coverImage[0] || "",
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        experience: parseInt(formData.experience) || 0
      };

      await adminService.updateArtisan(editingArtisan._id, artisanData);
      toast({
        title: "Success",
        description: "Artisan updated successfully"
      });
      setIsEditDialogOpen(false);
      setEditingArtisan(null);
      resetForm();
      loadArtisans();
    } catch (error) {
      console.error('Error updating artisan:', error);
      toast({
        title: "Error",
        description: "Failed to update artisan",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArtisan = async (artisanId: string) => {
    if (!confirm("Are you sure you want to delete this artisan?")) return;

    try {
      await adminService.deleteArtisan(artisanId);
      toast({
        title: "Success",
        description: "Artisan deleted successfully"
      });
      loadArtisans();
    } catch (error) {
      console.error('Error deleting artisan:', error);
      toast({
        title: "Error",
        description: "Failed to delete artisan",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (artisan: Artisan) => {
    setEditingArtisan(artisan);
    setFormData({
      name: artisan.name,
      bio: artisan.bio,
      city: artisan.location.city,
      state: artisan.location.state,
      country: artisan.location.country,
      avatar: artisan.avatar ? [artisan.avatar] : [],
      coverImage: artisan.coverImage ? [artisan.coverImage] : [],
      specialties: artisan.specialties.join(', '),
      experience: artisan.experience.toString(),
      userId: (artisan as any).userId || ""
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artisan Management</h2>
          <p className="text-muted-foreground">
            Manage artisan profiles and verification status
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Artisan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Artisan</DialogTitle>
              <DialogDescription>
                Add a new artisan profile to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  User Account
                </Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user account" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialties" className="text-right">
                  Specialties
                </Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="pottery, textiles, jewelry (comma separated)"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience" className="text-right">
                  Experience (years)
                </Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Avatar
                </Label>
                <div className="col-span-3">
                  <ImageUpload
                    images={formData.avatar}
                    onImagesChange={(images) => setFormData({ ...formData, avatar: images })}
                    maxImages={1}
                    category="artisans"
                    singleMode={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Cover Image
                </Label>
                <div className="col-span-3">
                  <ImageUpload
                    images={formData.coverImage}
                    onImagesChange={(images) => setFormData({ ...formData, coverImage: images })}
                    maxImages={1}
                    category="artisans"
                    singleMode={true}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateArtisan}>
                Create Artisan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artisans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Artisans List */}
      <div className="grid gap-6">
        {artisans.map((artisan) => (
          <Card key={artisan._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {artisan.avatar ? (
                      <img 
                        src={artisan.avatar} 
                        alt={artisan.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {artisan.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {artisan.name}
                      {artisan.verification.isVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {artisan.location.city}, {artisan.location.state}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={artisan.isActive ? "default" : "secondary"}>
                    {artisan.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={artisan.verification.isVerified ? "default" : "outline"}>
                    {artisan.verification.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {artisan.bio.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {artisan.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{artisan.experience} years experience</span>
                  <span>{artisan.totalProducts} products</span>
                  <span>Rating: {artisan.rating}/5</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(artisan)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteArtisan(artisan._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {artisans.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No artisans found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingArtisan(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Artisan</DialogTitle>
            <DialogDescription>
              Update artisan profile information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-city" className="text-right">
                City
              </Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-state" className="text-right">
                State
              </Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specialties" className="text-right">
                Specialties
              </Label>
              <Input
                id="edit-specialties"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="pottery, textiles, jewelry (comma separated)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-experience" className="text-right">
                Experience (years)
              </Label>
              <Input
                id="edit-experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-avatar" className="text-right">
                Avatar URL
              </Label>
              <div className="col-span-3">
                <ImageUpload
                  images={formData.avatar}
                  onImagesChange={(images) => setFormData({ ...formData, avatar: images })}
                  maxImages={1}
                  singleMode
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-coverImage" className="text-right">
                Cover Image URL
              </Label>
              <div className="col-span-3">
                <ImageUpload
                  images={formData.coverImage}
                  onImagesChange={(images) => setFormData({ ...formData, coverImage: images })}
                  maxImages={1}
                  singleMode
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditArtisan}>
              Update Artisan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}