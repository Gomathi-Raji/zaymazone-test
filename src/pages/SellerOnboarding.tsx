import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Star, 
  Upload, 
  Camera, 
  FileText, 
  CreditCard, 
  Award,
  BarChart3,
  Package,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    // Step 2: Business Details
    businessType: "",
    gstNumber: "",
    panNumber: "",
    // Step 3: Bank Details
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    // Step 4: Products
    sampleProducts: []
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const benefits = [
    {
      icon: Globe,
      title: "Global Customer Reach",
      description: "Connect with customers across India and internationally"
    },
    {
      icon: TrendingUp,
      title: "Business Growth Tools",
      description: "Analytics, marketing support, and growth insights"
    },
    {
      icon: Users,
      title: "Artisan Community",
      description: "Network with fellow craftspeople and share experiences"
    },
    {
      icon: Star,
      title: "Quality Recognition",
      description: "Showcase your craftsmanship to appreciate customers"
    }
  ];

  const dashboardFeatures = [
    { icon: BarChart3, title: "Sales Analytics", desc: "Track your performance" },
    { icon: Package, title: "Inventory Management", desc: "Manage your products" },
    { icon: MessageSquare, title: "Customer Chat", desc: "Direct customer support" },
    { icon: Award, title: "Quality Badges", desc: "Earn recognition badges" }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Application Submitted!",
      description: "Redirecting to confirmation page...",
    });
    setTimeout(() => {
      navigate('/seller-success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-warm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Join the Zaymazone Artisan Community
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Turn your passion for traditional crafts into a thriving business. Get access to customers worldwide, 
              fair pricing, and tools to grow your craft legacy.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-muted hover:shadow-elegant transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Artisan Registration</h2>
              <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 && "Basic Information"}
                    {currentStep === 2 && "Business Details"}
                    {currentStep === 3 && "Banking Information"}
                    {currentStep === 4 && "Sample Products"}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Let's start with your basic details"}
                    {currentStep === 2 && "Tell us about your business and craft"}
                    {currentStep === 3 && "Secure payment setup for your earnings"}
                    {currentStep === 4 && "Upload samples of your best work"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessName">Business/Workshop Name *</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                            placeholder="e.g., Kashmiri Heritage Crafts"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ownerName">Owner Name *</Label>
                          <Input
                            id="ownerName"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                            placeholder="Your full name"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="businessType">Type of Craft/Business *</Label>
                        <Input
                          id="businessType"
                          value={formData.businessType}
                          onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                          placeholder="e.g., Pottery, Textiles, Metalwork, Jewelry"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gstNumber">GST Number (if applicable)</Label>
                          <Input
                            id="gstNumber"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                            placeholder="Enter GST number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="panNumber">PAN Number *</Label>
                          <Input
                            id="panNumber"
                            value={formData.panNumber}
                            onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                            placeholder="Enter PAN number"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="craftDescription">Describe Your Craft Tradition</Label>
                        <Textarea
                          id="craftDescription"
                          placeholder="Tell us about your craft heritage, techniques, and what makes your work unique..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Banking */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-medium">Secure Payment Setup</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your banking information is encrypted and secure. We use this to transfer your earnings directly to your account.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          placeholder="e.g., State Bank of India"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="accountNumber">Account Number *</Label>
                          <Input
                            id="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                            placeholder="Enter account number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ifscCode">IFSC Code *</Label>
                          <Input
                            id="ifscCode"
                            value={formData.ifscCode}
                            onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                            placeholder="e.g., SBIN0001234"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Product Upload */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Upload Your Best Work</h3>
                        <p className="text-muted-foreground mb-6">
                          Show us 3-5 samples of your finest crafts. High-quality photos help customers appreciate your artistry.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((index) => (
                          <div key={index} className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">Upload Product {index}</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Photography Tips</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Use natural lighting for the best colors</li>
                          <li>• Show different angles and details</li>
                          <li>• Include size references if possible</li>
                          <li>• Highlight unique craftsmanship details</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious} 
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    {currentStep < totalSteps ? (
                      <Button onClick={handleNext}>
                        Next Step
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="btn-hero">
                        Submit Application
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Your Future Dashboard
                  </CardTitle>
                  <CardDescription>
                    Preview of what you'll get as a Zaymazone artisan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Quick Stats Preview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Monthly Sales</span>
                        <span className="font-medium">₹25,000+</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customer Reach</span>
                        <span className="font-medium">Pan-India</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Commission Rate</span>
                        <span className="font-medium text-green-600">Only 8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}