import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  User, 
  Building, 
  Package, 
  Truck, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface OnboardingData {
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
  socials: {
    instagram: string;
    facebook: string;
    website: string;
  };
  businessInfo: {
    businessName: string;
    sellerType: 'gst' | 'non-gst' | '';
    gstNumber: string;
    panNumber: string;
    contact: {
      email: string;
      phone: string;
      address: {
        village: string;
        district: string;
        state: string;
        pincode: string;
      };
    };
  };
  productInfo: {
    description: string;
    materials: string;
    priceRange: {
      min: number;
      max: number;
    };
    stockQuantity: number;
    photos: string[];
  };
  logistics: {
    pickupAddress: {
      sameAsMain: boolean;
      address: string;
    };
    dispatchTime: string;
    packagingType: string;
  };
  documents: {
    gstCertificate: string;
    aadhaarProof: string;
    craftVideo: string;
  };
  payment: {
    upiId: string;
    paymentFrequency: string;
  };
}

const INITIAL_DATA: OnboardingData = {
  name: '',
  bio: '',
  location: { city: '', state: '', country: 'India' },
  avatar: '',
  coverImage: '',
  specialties: [],
  experience: 0,
  socials: { instagram: '', facebook: '', website: '' },
  businessInfo: {
    businessName: '',
    sellerType: '',
    gstNumber: '',
    panNumber: '',
    contact: {
      email: '',
      phone: '',
      address: { village: '', district: '', state: '', pincode: '' }
    }
  },
  productInfo: {
    description: '',
    materials: '',
    priceRange: { min: 0, max: 0 },
    stockQuantity: 0,
    photos: []
  },
  logistics: {
    pickupAddress: { sameAsMain: true, address: '' },
    dispatchTime: '',
    packagingType: ''
  },
  documents: {
    gstCertificate: '',
    aadhaarProof: '',
    craftVideo: ''
  },
  payment: {
    upiId: '',
    paymentFrequency: ''
  }
};

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Business Details', icon: Building, description: 'Business information' },
  { id: 3, title: 'Product Information', icon: Package, description: 'Your craft details' },
  { id: 4, title: 'Logistics', icon: Truck, description: 'Shipping and delivery' },
  { id: 5, title: 'Documents', icon: FileText, description: 'Required documents' },
  { id: 6, title: 'Payment', icon: CreditCard, description: 'Payment setup' }
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CRAFT_SPECIALTIES = [
  'Pottery', 'Textiles', 'Jewelry', 'Woodworking', 'Metalwork', 'Painting',
  'Sculpture', 'Embroidery', 'Weaving', 'Leather Work', 'Paper Craft', 'Other'
];

export function SellerOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem('firebase_id_token');
      const response = await fetch('/api/seller/onboarding/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.status !== 'not_submitted') {
        setApplicationStatus(data.status);
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const updateFormData = (section: keyof OnboardingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedFormData = (section: keyof OnboardingData, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.location.city && formData.location.state);
      case 2:
        return !!(formData.businessInfo.businessName && formData.businessInfo.contact.email && formData.businessInfo.contact.phone);
      case 3:
        return !!(formData.productInfo.description && formData.productInfo.materials);
      case 4:
        return !!(formData.logistics.dispatchTime && formData.logistics.packagingType);
      case 5:
        return !!(formData.documents.aadhaarProof);
      case 6:
        return !!(formData.payment.upiId);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitApplication = async () => {
    if (!validateStep(6)) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('firebase_id_token');
      const response = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Application Submitted!',
          description: 'Your application is under review. You will be notified once approved.'
        });
        setApplicationStatus('pending');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show status if application already submitted
  if (applicationStatus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {applicationStatus === 'pending' && <Clock className="w-16 h-16 text-yellow-500" />}
                {applicationStatus === 'approved' && <CheckCircle className="w-16 h-16 text-green-500" />}
                {applicationStatus === 'rejected' && <AlertCircle className="w-16 h-16 text-red-500" />}
              </div>
              <CardTitle className="text-2xl">
                Application {applicationStatus === 'approved' ? 'Approved' : 
                           applicationStatus === 'rejected' ? 'Rejected' : 'Under Review'}
              </CardTitle>
              <CardDescription>
                {applicationStatus === 'pending' && 'Your seller application is being reviewed by our team.'}
                {applicationStatus === 'approved' && 'Congratulations! You can now start selling on Zaymazone.'}
                {applicationStatus === 'rejected' && 'Your application was not approved. Please contact support for details.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant={
                applicationStatus === 'approved' ? 'default' :
                applicationStatus === 'rejected' ? 'destructive' : 'secondary'
              }>
                {applicationStatus.toUpperCase()}
              </Badge>
              {applicationStatus === 'approved' && (
                <div className="mt-6">
                  <Button onClick={() => window.location.href = '/seller/shop'}>
                    Go to Shop Management
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">Join Zaymazone and showcase your crafts to the world</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step content would be rendered here - for brevity, showing the navigation */}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitApplication}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}