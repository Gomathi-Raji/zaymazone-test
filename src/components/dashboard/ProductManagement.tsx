import { useState, useEffect } from "react";import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

  Loader2, import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

  Plus, import { 

  Search,   Loader2, 

  Eye,   Plus, 

  CheckCircle,   Search, 

  XCircle,   Eye, 

  AlertCircle,  Edit, 

  Package,  Trash2, 

  Star,  CheckCircle, 

  RefreshCw  XCircle, 

} from "lucide-react";  AlertCircle,

import { adminService } from "@/services/adminService";  Package,

import { useToast } from "@/hooks/use-toast";  Star,

  TrendingUp,

interface Product {  Filter,

  _id: string;  RefreshCw,

  name: string;  MoreVertical

  description: string;} from "lucide-react";

  price: number;import { ImageUpload } from '@/components/ImageUpload';

  originalPrice?: number;import { adminService } from "@/services/adminService";

  images: string[];import { useToast } from "@/hooks/use-toast";

  category: string;

  artisan?: {interface Product {

    name: string;  _id: string;

    _id: string;  name: string;

  };  description: string;

  stockCount: number;  price: number;

  isActive?: boolean;  originalPrice?: number;

  approvalStatus?: 'pending' | 'approved' | 'rejected';  images: string[];

  createdAt: string;  category: string;

  rating?: number;  subcategory?: string;

  reviewCount?: number;  artisan?: {

}    name: string;

    _id: string;

export function ProductManagement() {  };

  const [products, setProducts] = useState<Product[]>([]);  inStock: boolean;

  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);  stockCount: number;

  const [loading, setLoading] = useState(true);  rating?: number;

  const [searchTerm, setSearchTerm] = useState("");  reviewCount?: number;

  const [categoryFilter, setCategoryFilter] = useState("all");  isActive?: boolean;

  const [statusFilter, setStatusFilter] = useState("all");  approvalStatus?: 'pending' | 'approved' | 'rejected';

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);  createdAt: string;

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);  totalSales?: number;

  const { toast } = useToast();  views?: number;

}

  useEffect(() => {

    loadProducts();export function ProductManagement() {

  }, []);  const [products, setProducts] = useState<Product[]>([]);

  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);

  const loadProducts = async () => {  const [loading, setLoading] = useState(true);

    try {  const [searchTerm, setSearchTerm] = useState("");

      setLoading(true);  const [categoryFilter, setCategoryFilter] = useState("all");

      const [approvedResponse, pendingResponse] = await Promise.all([  const [statusFilter, setStatusFilter] = useState("all");

        adminService.getProducts({ status: 'approved' }),  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

        adminService.getPendingProducts()  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

      ]);  const { toast } = useToast();

      

      setProducts(approvedResponse.products || []);  useEffect(() => {

      setPendingProducts(pendingResponse.products || []);    loadProducts();

    } catch (error) {  }, []);

      console.error('Error loading products:', error);

      toast({  const loadProducts = async () => {

        title: "Error",    try {

        description: "Failed to load products",      setLoading(true);

        variant: "destructive"      const [approvedResponse, pendingResponse] = await Promise.all([

      });        adminService.getProducts({ status: 'approved' }),

    } finally {        adminService.getPendingProducts()

      setLoading(false);      ]);

    }      

  };      setProducts(approvedResponse.products || []);

      setPendingProducts(pendingResponse.products || []);

  const handleApprove = async (productId: string) => {    } catch (error) {

    try {      console.error('Error loading products:', error);

      await adminService.approveProduct(productId);      toast({

      toast({        title: "Error",

        title: "Success",        description: "Failed to load products",

        description: "Product approved successfully"        variant: "destructive"

      });      });

      loadProducts();    } finally {

    } catch (error) {      setLoading(false);

      toast({    }

        title: "Error",  };

        description: "Failed to approve product",

        variant: "destructive"  const handleApprove = async (productId: string) => {

      });    try {

    }      await adminService.approveProduct(productId);

  };      toast({

        title: "Success",

  const handleReject = async (productId: string) => {        description: "Product approved successfully"

    try {      });

      await adminService.rejectProduct(productId, "Not suitable for marketplace");      loadProducts();

      toast({    } catch (error) {

        title: "Success",      toast({

        description: "Product rejected successfully"        title: "Error",

      });        description: "Failed to approve product",

      loadProducts();        variant: "destructive"

    } catch (error) {      });

      toast({    }

        title: "Error",  };

        description: "Failed to reject product",

        variant: "destructive"  const handleReject = async (productId: string) => {

      });    try {

    }      await adminService.rejectProduct(productId);

  };      toast({

        title: "Success",

  const formatPrice = (price: number) => {        description: "Product rejected successfully"

    return new Intl.NumberFormat('en-IN', {      });

      style: 'currency',      loadProducts();

      currency: 'INR',    } catch (error) {

    }).format(price);      toast({

  };        title: "Error",

        description: "Failed to reject product",

  const formatDate = (dateString: string) => {        variant: "destructive"

    return new Date(dateString).toLocaleDateString('en-IN', {      });

      year: 'numeric',    }

      month: 'short',  };

      day: 'numeric'

    });  const handleToggleActive = async (productId: string, isActive: boolean) => {

  };    try {

      await adminService.updateProduct(productId, { isActive: !isActive });

  const getStatusBadge = (product: Product) => {      toast({

    if (product.approvalStatus === 'pending') {        title: "Success",

      return <Badge>Pending</Badge>;        description: `Product ${!isActive ? 'activated' : 'deactivated'} successfully`

    } else if (product.isActive) {      });

      return <Badge>Active</Badge>;      loadProducts();

    } else {    } catch (error) {

      return <Badge>Inactive</Badge>;      toast({

    }        title: "Error",

  };        description: "Failed to update product status",

        variant: "destructive"

  const getStockBadge = (stockCount: number) => {      });

    if (stockCount === 0) {    }

      return <Badge>Out of Stock</Badge>;  };

    } else if (stockCount < 5) {

      return <Badge>Low Stock</Badge>;  const handleDelete = async (productId: string) => {

    } else {    if (!confirm('Are you sure you want to delete this product?')) return;

      return <Badge>In Stock</Badge>;    

    }    try {

  };      await adminService.deleteProduct(productId);

      toast({

  if (loading) {        title: "Success",

    return (        description: "Product deleted successfully"

      <Card>      });

        <CardContent className="p-6">      loadProducts();

          <div className="flex items-center justify-center">    } catch (error) {

            <Loader2 className="w-6 h-6 animate-spin mr-2" />      toast({

            <span>Loading products...</span>        title: "Error",

          </div>        description: "Failed to delete product",

        </CardContent>        variant: "destructive"

      </Card>      });

    );    }

  }  };



  return (  const filteredProducts = products.filter(product => {

    <div className="space-y-6">    const matchesSearch = 

      {/* Header */}      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||

      <div className="flex justify-between items-start">      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||

        <div>      product.artisan?.name?.toLowerCase().includes(searchTerm.toLowerCase());

          <h2 className="text-3xl font-bold">Product Management</h2>

          <p className="text-muted-foreground mt-1">    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

            Manage products and approve new submissions    

          </p>    const matchesStatus = 

        </div>      statusFilter === "all" ||

        <div className="flex gap-2">      (statusFilter === "active" && product.isActive) ||

          <Button variant="outline" onClick={loadProducts}>      (statusFilter === "inactive" && !product.isActive);

            <RefreshCw className="w-4 h-4 mr-2" />

            Refresh    return matchesSearch && matchesCategory && matchesStatus;

          </Button>  });

          <Button>

            <Plus className="w-4 h-4 mr-2" />  const filteredPendingProducts = pendingProducts.filter(product =>

            Add Product    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||

          </Button>    product.category?.toLowerCase().includes(searchTerm.toLowerCase())

        </div>  );

      </div>

  const formatPrice = (price: number) => {

      {/* Quick Stats */}    return new Intl.NumberFormat('en-IN', {

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">      style: 'currency',

        <Card>      currency: 'INR',

          <CardContent className="p-6">    }).format(price);

            <div className="flex items-center gap-3">  };

              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">

                <Package className="w-6 h-6 text-white" />  const formatDate = (dateString: string) => {

              </div>    return new Date(dateString).toLocaleDateString('en-IN', {

              <div>      year: 'numeric',

                <p className="text-sm text-muted-foreground">Total Products</p>      month: 'short',

                <p className="text-2xl font-bold">{products.length}</p>      day: 'numeric'

              </div>    });

            </div>  };

          </CardContent>

        </Card>  const getStatusBadge = (product: Product) => {

        <Card>    if (product.approvalStatus === 'pending') {

          <CardContent className="p-6">      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;

            <div className="flex items-center gap-3">    } else if (product.isActive) {

              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">      return <Badge className="bg-green-100 text-green-800">Active</Badge>;

                <CheckCircle className="w-6 h-6 text-white" />    } else {

              </div>      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;

              <div>    }

                <p className="text-sm text-muted-foreground">Active Products</p>  };

                <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>

              </div>  const getStockBadge = (stockCount: number) => {

            </div>    if (stockCount === 0) {

          </CardContent>      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;

        </Card>    } else if (stockCount < 5) {

        <Card>      return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;

          <CardContent className="p-6">    } else {

            <div className="flex items-center gap-3">      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;

              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">    }

                <AlertCircle className="w-6 h-6 text-white" />  };

              </div>

              <div>  if (loading) {

                <p className="text-sm text-muted-foreground">Pending Approval</p>    return (

                <p className="text-2xl font-bold">{pendingProducts.length}</p>      <Card>

              </div>        <CardContent className="p-6">

            </div>          <div className="flex items-center justify-center">

          </CardContent>            <Loader2 className="w-6 h-6 animate-spin mr-2" />

        </Card>            <span>Loading products...</span>

        <Card>          </div>

          <CardContent className="p-6">        </CardContent>

            <div className="flex items-center gap-3">      </Card>

              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">    );

                <XCircle className="w-6 h-6 text-white" />  }

              </div>

              <div>  return (

                <p className="text-sm text-muted-foreground">Out of Stock</p>    <div className="space-y-6">

                <p className="text-2xl font-bold">{products.filter(p => p.stockCount === 0).length}</p>      {/* Header */}

              </div>      <div className="flex justify-between items-start">

            </div>        <div>

          </CardContent>          <h2 className="text-3xl font-bold">Product Management</h2>

        </Card>          <p className="text-muted-foreground mt-1">

      </div>            Manage products and approve new submissions

          </p>

      {/* Search and Filters */}        </div>

      <Card>        <div className="flex gap-2">

        <CardContent className="p-6">          <Button variant="outline" onClick={loadProducts}>

          <div className="flex gap-4">            <RefreshCw className="w-4 h-4 mr-2" />

            <div className="flex-1">            Refresh

              <div className="relative">          </Button>

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />          <Button>

                <Input            <Plus className="w-4 h-4 mr-2" />

                  placeholder="Search products..."            Add Product

                  value={searchTerm}          </Button>

                  onChange={(e) => setSearchTerm(e.target.value)}        </div>

                  className="pl-10"      </div>

                />

              </div>      {/* Quick Stats */}

            </div>      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>        <Card>

              <SelectTrigger className="w-48">          <CardContent className="p-6">

                <SelectValue placeholder="All Categories" />            <div className="flex items-center gap-3">

              </SelectTrigger>              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">

              <SelectContent>                <Package className="w-6 h-6 text-white" />

                <SelectItem value="all">All Categories</SelectItem>              </div>

                <SelectItem value="Handicrafts">Handicrafts</SelectItem>              <div>

                <SelectItem value="Textiles">Textiles</SelectItem>                <p className="text-sm text-muted-foreground">Total Products</p>

                <SelectItem value="Jewelry">Jewelry</SelectItem>                <p className="text-2xl font-bold">{products.length}</p>

              </SelectContent>              </div>

            </Select>            </div>

          </div>          </CardContent>

        </CardContent>        </Card>

      </Card>        <Card>

          <CardContent className="p-6">

      {/* Main Content */}            <div className="flex items-center gap-3">

      <Tabs defaultValue="approved" className="space-y-6">              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">

        <TabsList className="grid w-full grid-cols-2">                <CheckCircle className="w-6 h-6 text-white" />

          <TabsTrigger value="approved">Approved Products ({products.length})</TabsTrigger>              </div>

          <TabsTrigger value="pending">Pending Approval ({pendingProducts.length})</TabsTrigger>              <div>

        </TabsList>                <p className="text-sm text-muted-foreground">Active Products</p>

                <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>

        <TabsContent value="approved">              </div>

          <Card>            </div>

            <CardHeader>          </CardContent>

              <CardTitle>Approved Products</CardTitle>        </Card>

              <CardDescription>Manage existing products in the marketplace</CardDescription>        <Card>

            </CardHeader>          <CardContent className="p-6">

            <CardContent>            <div className="flex items-center gap-3">

              <Table>              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">

                <TableHeader>                <AlertCircle className="w-6 h-6 text-white" />

                  <TableRow>              </div>

                    <TableHead>Product</TableHead>              <div>

                    <TableHead>Category</TableHead>                <p className="text-sm text-muted-foreground">Pending Approval</p>

                    <TableHead>Price</TableHead>                <p className="text-2xl font-bold">{pendingProducts.length}</p>

                    <TableHead>Stock</TableHead>              </div>

                    <TableHead>Artisan</TableHead>            </div>

                    <TableHead>Status</TableHead>          </CardContent>

                    <TableHead>Actions</TableHead>        </Card>

                  </TableRow>        <Card>

                </TableHeader>          <CardContent className="p-6">

                <TableBody>            <div className="flex items-center gap-3">

                  {products.map((product) => (              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">

                    <TableRow key={product._id}>                <XCircle className="w-6 h-6 text-white" />

                      <TableCell>              </div>

                        <div className="flex items-center gap-3">              <div>

                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">                <p className="text-sm text-muted-foreground">Out of Stock</p>

                            <Package className="w-6 h-6 text-gray-400" />                <p className="text-2xl font-bold">{products.filter(p => p.stockCount === 0).length}</p>

                          </div>              </div>

                          <div>            </div>

                            <p className="font-medium">{product.name}</p>          </CardContent>

                            <p className="text-sm text-muted-foreground">        </Card>

                              {product.description?.substring(0, 50)}...      </div>

                            </p>

                          </div>      {/* Search and Filters */}

                        </div>      <Card>

                      </TableCell>        <CardContent className="p-6">

                      <TableCell>{product.category}</TableCell>          <div className="flex gap-4">

                      <TableCell>{formatPrice(product.price)}</TableCell>            <div className="flex-1">

                      <TableCell>              <div className="relative">

                        <div className="space-y-1">                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                          <p className="font-medium">{product.stockCount}</p>                <Input

                          {getStockBadge(product.stockCount)}                  placeholder="Search products..."

                        </div>                  value={searchTerm}

                      </TableCell>                  onChange={(e) => setSearchTerm(e.target.value)}

                      <TableCell>{product.artisan?.name || 'Unknown'}</TableCell>                  className="pl-10"

                      <TableCell>{getStatusBadge(product)}</TableCell>                />

                      <TableCell>              </div>

                        <Button            </div>

                          size="sm"            <Select value={categoryFilter} onValueChange={setCategoryFilter}>

                          variant="ghost"              <SelectTrigger className="w-48">

                          onClick={() => {                <SelectValue placeholder="All Categories" />

                            setViewingProduct(product);              </SelectTrigger>

                            setIsViewDialogOpen(true);              <SelectContent>

                          }}                <SelectItem value="all">All Categories</SelectItem>

                        >                <SelectItem value="Handicrafts">Handicrafts</SelectItem>

                          <Eye className="w-4 h-4" />                <SelectItem value="Textiles">Textiles</SelectItem>

                        </Button>                <SelectItem value="Jewelry">Jewelry</SelectItem>

                      </TableCell>                <SelectItem value="Home Decor">Home Decor</SelectItem>

                    </TableRow>              </SelectContent>

                  ))}            </Select>

                  {products.length === 0 && (            <Select value={statusFilter} onValueChange={setStatusFilter}>

                    <TableRow>              <SelectTrigger className="w-48">

                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">                <SelectValue placeholder="All Status" />

                        No products found              </SelectTrigger>

                      </TableCell>              <SelectContent>

                    </TableRow>                <SelectItem value="all">All Status</SelectItem>

                  )}                <SelectItem value="active">Active Only</SelectItem>

                </TableBody>                <SelectItem value="inactive">Inactive Only</SelectItem>

              </Table>              </SelectContent>

            </CardContent>            </Select>

          </Card>          </div>

        </TabsContent>        </CardContent>

      </Card>

        <TabsContent value="pending">

          <Card>      {/* Main Content */}

            <CardHeader>      <Tabs defaultValue="approved" className="space-y-6">

              <CardTitle>Pending Product Approvals</CardTitle>        <TabsList className="grid w-full grid-cols-2">

              <CardDescription>Review and approve new product submissions</CardDescription>          <TabsTrigger value="approved">Approved Products ({products.length})</TabsTrigger>

            </CardHeader>          <TabsTrigger value="pending">Pending Approval ({pendingProducts.length})</TabsTrigger>

            <CardContent>        </TabsList>

              <Table>

                <TableHeader>        <TabsContent value="approved">

                  <TableRow>          <Card>

                    <TableHead>Product</TableHead>            <CardHeader>

                    <TableHead>Category</TableHead>              <CardTitle>Approved Products</CardTitle>

                    <TableHead>Price</TableHead>              <CardDescription>Manage existing products in the marketplace</CardDescription>

                    <TableHead>Artisan</TableHead>            </CardHeader>

                    <TableHead>Submitted</TableHead>            <CardContent>

                    <TableHead>Actions</TableHead>              <Table>

                  </TableRow>                <TableHeader>

                </TableHeader>                  <TableRow>

                <TableBody>                    <TableHead>Product</TableHead>

                  {pendingProducts.map((product) => (                    <TableHead>Category</TableHead>

                    <TableRow key={product._id}>                    <TableHead>Price</TableHead>

                      <TableCell>                    <TableHead>Stock</TableHead>

                        <div className="flex items-center gap-3">                    <TableHead>Artisan</TableHead>

                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">                    <TableHead>Status</TableHead>

                            <Package className="w-6 h-6 text-gray-400" />                    <TableHead>Actions</TableHead>

                          </div>                  </TableRow>

                          <div>                </TableHeader>

                            <p className="font-medium">{product.name}</p>                <TableBody>

                            <p className="text-sm text-muted-foreground">                  {filteredProducts.map((product) => (

                              {product.description?.substring(0, 50)}...                    <TableRow key={product._id}>

                            </p>                      <TableCell>

                          </div>                        <div className="flex items-center gap-3">

                        </div>                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">

                      </TableCell>                            {product.images?.[0] ? (

                      <TableCell>{product.category}</TableCell>                              <img 

                      <TableCell>{formatPrice(product.price)}</TableCell>                                src={product.images[0]} 

                      <TableCell>{product.artisan?.name || 'Unknown'}</TableCell>                                alt={product.name}

                      <TableCell>{formatDate(product.createdAt)}</TableCell>                                className="w-full h-full object-cover"

                      <TableCell>                              />

                        <div className="flex gap-2">                            ) : (

                          <Button                              <Package className="w-6 h-6 text-gray-400" />

                            size="sm"                            )}

                            variant="ghost"                          </div>

                            onClick={() => {                          <div>

                              setViewingProduct(product);                            <p className="font-medium">{product.name}</p>

                              setIsViewDialogOpen(true);                            <p className="text-sm text-muted-foreground truncate max-w-xs">

                            }}                              {product.description}

                          >                            </p>

                            <Eye className="w-4 h-4" />                          </div>

                          </Button>                        </div>

                          <Button                      </TableCell>

                            size="sm"                      <TableCell>{product.category}</TableCell>

                            onClick={() => handleApprove(product._id)}                      <TableCell>

                          >                        <div>

                            <CheckCircle className="w-4 h-4 mr-1" />                          <p className="font-medium">{formatPrice(product.price)}</p>

                            Approve                          {product.originalPrice && (

                          </Button>                            <p className="text-sm text-muted-foreground line-through">

                          <Button                              {formatPrice(product.originalPrice)}

                            size="sm"                            </p>

                            variant="destructive"                          )}

                            onClick={() => handleReject(product._id)}                        </div>

                          >                      </TableCell>

                            <XCircle className="w-4 h-4 mr-1" />                      <TableCell>

                            Reject                        <div className="space-y-1">

                          </Button>                          <p className="font-medium">{product.stockCount}</p>

                        </div>                          {getStockBadge(product.stockCount)}

                      </TableCell>                        </div>

                    </TableRow>                      </TableCell>

                  ))}                      <TableCell>{product.artisan?.name || 'Unknown'}</TableCell>

                  {pendingProducts.length === 0 && (                      <TableCell>{getStatusBadge(product)}</TableCell>

                    <TableRow>                      <TableCell>

                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">                        <div className="flex gap-2">

                        No pending products                          <Button

                      </TableCell>                            size="sm"

                    </TableRow>                            variant="ghost"

                  )}                            onClick={() => {

                </TableBody>                              setViewingProduct(product);

              </Table>                              setIsViewDialogOpen(true);

            </CardContent>                            }}

          </Card>                          >

        </TabsContent>                            <Eye className="w-4 h-4" />

      </Tabs>                          </Button>

                          <Button

      {/* Product View Modal */}                            size="sm"

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>                            variant="ghost"

        <DialogContent className="max-w-3xl">                            className={product.isActive ? "text-red-600" : "text-green-600"}

          <DialogHeader>                            onClick={() => handleToggleActive(product._id, product.isActive || false)}

            <DialogTitle>Product Details</DialogTitle>                          >

          </DialogHeader>                            {product.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}

          {viewingProduct && (                          </Button>

            <div className="space-y-6">                          <Button

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                            size="sm"

                <div>                            variant="ghost"

                  <h4 className="font-medium mb-3">Product Images</h4>                            className="text-red-600"

                  <div className="grid grid-cols-2 gap-2">                            onClick={() => handleDelete(product._id)}

                    {viewingProduct.images?.map((image, index) => (                          >

                      <img                             <Trash2 className="w-4 h-4" />

                        key={index}                          </Button>

                        src={image}                         </div>

                        alt={`${viewingProduct.name} ${index + 1}`}                      </TableCell>

                        className="w-full h-32 object-cover rounded-lg"                    </TableRow>

                      />                  ))}

                    ))}                  {filteredProducts.length === 0 && (

                  </div>                    <TableRow>

                </div>                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">

                <div className="space-y-4">                        No products found

                  <div>                      </TableCell>

                    <h4 className="font-medium">Product Information</h4>                    </TableRow>

                    <div className="space-y-2 mt-2">                  )}

                      <p><strong>Name:</strong> {viewingProduct.name}</p>                </TableBody>

                      <p><strong>Category:</strong> {viewingProduct.category}</p>              </Table>

                      <p><strong>Price:</strong> {formatPrice(viewingProduct.price)}</p>            </CardContent>

                      <p><strong>Stock:</strong> {viewingProduct.stockCount}</p>          </Card>

                      <p><strong>Status:</strong> {getStatusBadge(viewingProduct)}</p>        </TabsContent>

                    </div>

                  </div>        <TabsContent value="pending">

                  <div>          <Card>

                    <h4 className="font-medium">Artisan</h4>            <CardHeader>

                    <p className="mt-2">{viewingProduct.artisan?.name || 'Unknown'}</p>              <CardTitle>Pending Product Approvals</CardTitle>

                  </div>              <CardDescription>Review and approve new product submissions</CardDescription>

                </div>            </CardHeader>

              </div>            <CardContent>

                            <Table>

              <div>                <TableHeader>

                <h4 className="font-medium">Description</h4>                  <TableRow>

                <p className="mt-2 text-sm text-muted-foreground">                    <TableHead>Product</TableHead>

                  {viewingProduct.description}                    <TableHead>Category</TableHead>

                </p>                    <TableHead>Price</TableHead>

              </div>                    <TableHead>Artisan</TableHead>

                    <TableHead>Submitted</TableHead>

              {viewingProduct.rating && (                    <TableHead>Actions</TableHead>

                <div>                  </TableRow>

                  <h4 className="font-medium">Rating & Reviews</h4>                </TableHeader>

                  <div className="flex items-center gap-2 mt-2">                <TableBody>

                    <div className="flex items-center gap-1">                  {filteredPendingProducts.map((product) => (

                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />                    <TableRow key={product._id}>

                      <span className="font-medium">{viewingProduct.rating}</span>                      <TableCell>

                    </div>                        <div className="flex items-center gap-3">

                    <span className="text-sm text-muted-foreground">                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">

                      ({viewingProduct.reviewCount} reviews)                            {product.images?.[0] ? (

                    </span>                              <img 

                  </div>                                src={product.images[0]} 

                </div>                                alt={product.name}

              )}                                className="w-full h-full object-cover rounded-lg"

            </div>                              />

          )}                            ) : (

        </DialogContent>                              <Package className="w-6 h-6 text-gray-400" />

      </Dialog>                            )}

    </div>                          </div>

  );                          <div>

}                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.artisan?.name || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setViewingProduct(product);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(product._id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(product._id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPendingProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pending products
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed view of the product
            </DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Product Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingProduct.images?.map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${viewingProduct.name} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                    {viewingProduct.images?.length === 0 && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Product Information</h4>
                    <div className="space-y-2 mt-2">
                      <p><strong>Name:</strong> {viewingProduct.name}</p>
                      <p><strong>Category:</strong> {viewingProduct.category}</p>
                      <p><strong>Price:</strong> {formatPrice(viewingProduct.price)}</p>
                      {viewingProduct.originalPrice && (
                        <p><strong>Original Price:</strong> {formatPrice(viewingProduct.originalPrice)}</p>
                      )}
                      <p><strong>Stock:</strong> {viewingProduct.stockCount}</p>
                      <p><strong>Status:</strong> {getStatusBadge(viewingProduct)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Artisan</h4>
                    <p className="mt-2">{viewingProduct.artisan?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewingProduct.description}
                </p>
              </div>

              {viewingProduct.rating && (
                <div>
                  <h4 className="font-medium">Rating & Reviews</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{viewingProduct.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({viewingProduct.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
        search: searchTerm || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    loadProducts();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      subcategory: "",
      stockCount: "",
      artisanId: "",
      images: []
    });
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.artisanId) {
      toast({
        title: "Validation Error",
        description: "Please select an artisan",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        stockCount: parseInt(formData.stockCount),
        artisanId: formData.artisanId,
        images: formData.images.filter(img => img.trim() !== ""),
        inStock: parseInt(formData.stockCount) > 0,
        isActive: true
      };

      await adminService.createProduct(productData);
      toast({
        title: "Success",
        description: "Product created successfully"
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.artisanId) {
      toast({
        title: "Validation Error",
        description: "Please select an artisan",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        stockCount: parseInt(formData.stockCount),
        artisanId: formData.artisanId,
        images: formData.images.filter(img => img.trim() !== ""),
        inStock: parseInt(formData.stockCount) > 0
      };

      await adminService.updateProduct(editingProduct._id, productData);
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await adminService.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      subcategory: product.subcategory || "",
      stockCount: product.stockCount.toString(),
      artisanId: (product as any).artisanId || "",
      images: product.images.length > 0 ? product.images : []
    });
    setIsEditDialogOpen(true);
  };

  const getStatusVariant = (product: Product) => {
    if (!product.isActive) return "destructive";
    if (!product.inStock) return "secondary";
    return "default";
  };

  const getStatusText = (product: Product) => {
    if (!product.isActive) return "Inactive";
    if (!product.inStock) return "Out of Stock";
    return "Active";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>Manage all products in the marketplace</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to the marketplace
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
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="originalPrice" className="text-right">
                  Original Price
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pottery">Pottery</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="metalwork">Metal Craft</SelectItem>
                    <SelectItem value="woodwork">Wood Craft</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="paintings">Paintings</SelectItem>
                    <SelectItem value="crafts">Crafts</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subcategory" className="text-right">
                  Subcategory
                </Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artisan" className="text-right">
                  Artisan
                </Label>
                <Select value={formData.artisanId} onValueChange={(value) => setFormData({ ...formData, artisanId: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select artisan" />
                  </SelectTrigger>
                  <SelectContent>
                    {artisans.map((artisan) => (
                      <SelectItem key={artisan._id} value={artisan._id}>
                        {artisan.name} - {artisan.location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stockCount" className="text-right">
                  Stock Count
                </Label>
                <Input
                  id="stockCount"
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Images
                </Label>
                <div className="col-span-3">
                  <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData({ ...formData, images })}
                    maxImages={10}
                    category="products"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateProduct}>Create Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="Pottery">Pottery</option>
            <option value="Textiles">Textiles</option>
            <option value="Metal Craft">Metal Craft</option>
            <option value="Wood Craft">Wood Craft</option>
            <option value="Jewelry">Jewelry</option>
          </select>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  <Badge variant={getStatusVariant(product)}>
                    {getStatusText(product)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{product.category}</span>
                  <span>Stock: {product.stockCount}</span>
                  {product.rating && <span>Rating: {product.rating} ({product.reviewCount} reviews)</span>}
                  {product.artisan && <span>Artisan: {product.artisan.name}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">₹{product.price}</span>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-originalPrice" className="text-right">
                  Original Price
                </Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pottery">Pottery</SelectItem>
                    <SelectItem value="Textiles">Textiles</SelectItem>
                    <SelectItem value="Metal Craft">Metal Craft</SelectItem>
                    <SelectItem value="Wood Craft">Wood Craft</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subcategory" className="text-right">
                  Subcategory
                </Label>
                <Input
                  id="edit-subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stockCount" className="text-right">
                  Stock Count
                </Label>
                <Input
                  id="edit-stockCount"
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditProduct}>Update Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}