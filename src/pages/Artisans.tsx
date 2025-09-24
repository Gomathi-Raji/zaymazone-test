import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArtisanProfile } from "@/components/ArtisanProfile";
import { Button } from "@/components/ui/button";
import artisan1 from "@/assets/artisan-1.jpg";
import artisan2 from "@/assets/artisan-2.jpg";
import artisan3 from "@/assets/artisan-3.jpg";
import artisan4 from "@/assets/artisan-4.jpg";
import artisanAvatar1 from "@/assets/artisan-avatar-1.jpg";
import artisanAvatar2 from "@/assets/artisan-avatar-2.jpg";
import artisanAvatar3 from "@/assets/artisan-avatar-3.jpg";
import artisanAvatar4 from "@/assets/artisan-avatar-4.jpg";
import artisanAvatar5 from "@/assets/artisan-avatar-5.jpg";
import artisanAvatar6 from "@/assets/artisan-avatar-6.jpg";
import artisanAvatar7 from "@/assets/artisan-avatar-7.jpg";
import artisanAvatar8 from "@/assets/artisan-avatar-8.jpg";

const artisans = [
  {
    id: "1",
    name: "Priya Sharma",
    specialty: "Pottery & Ceramics",
    location: "Jaipur, Rajasthan",
    experience: "15 years",
    rating: 4.9,
    products: 23,
    image: artisan1,
    avatar: artisanAvatar1,
    description: "Master potter specializing in traditional Rajasthani blue pottery techniques passed down through generations. Her work combines ancient methods with contemporary aesthetics.",
    achievements: ["UNESCO Heritage Award", "National Craft Excellence", "Best Pottery Award 2023"],
    joinedYear: "2019",
    specialties: ["Blue Pottery", "Terracotta", "Glazing Techniques"]
  },
  {
    id: "2",
    name: "Arjun Patel",
    specialty: "Handwoven Textiles",
    location: "Bhuj, Gujarat",
    experience: "20 years",
    rating: 4.8,
    products: 45,
    image: artisan2,
    avatar: artisanAvatar2,
    description: "Expert weaver creating intricate patterns using traditional Patola silk weaving techniques. His family has been in textile arts for over three generations.",
    achievements: ["Master Craftsman Award", "Export Excellence", "Traditional Textile Honor"],
    joinedYear: "2018",
    specialties: ["Patola Weaving", "Bandhani", "Silk Textiles"]
  },
  {
    id: "3",
    name: "Meera Devi",
    specialty: "Jewelry & Metalwork",
    location: "Jaipur, Rajasthan",
    experience: "12 years",
    rating: 4.9,
    products: 67,
    image: artisan3,
    avatar: artisanAvatar3,
    description: "Skilled artisan crafting traditional Kundan and Meenakari jewelry with contemporary designs. Known for her innovative fusion of traditional and modern styles.",
    achievements: ["Young Entrepreneur Award", "Design Innovation", "Best Jewelry Designer 2024"],
    joinedYear: "2020",
    specialties: ["Kundan Jewelry", "Meenakari Work", "Silver Crafting"]
  },
  {
    id: "4",
    name: "Ravi Kumar",
    specialty: "Wood Carving",
    location: "Mysore, Karnataka",
    experience: "18 years",
    rating: 4.7,
    products: 34,
    image: artisan4,
    avatar: artisanAvatar4,
    description: "Master woodcarver specializing in intricate Mysore style furniture and decorative items. His detailed work showcases the rich heritage of South Indian woodcraft.",
    achievements: ["Traditional Arts Award", "Cultural Heritage", "Master Carver Recognition"],
    joinedYear: "2017",
    specialties: ["Mysore Carving", "Sandalwood Art", "Temple Architecture"]
  },
  {
    id: "5",
    name: "Sunita Jha",
    specialty: "Madhubani Paintings",
    location: "Madhubani, Bihar",
    experience: "22 years",
    rating: 4.9,
    products: 16,
    image: artisan1,
    avatar: artisanAvatar5,
    description: "Traditional Madhubani artist keeping alive the ancient art of Mithila paintings. Her work depicts mythological stories and nature with vibrant colors.",
    achievements: ["Folk Art Excellence", "Cultural Ambassador", "International Recognition"],
    joinedYear: "2019",
    specialties: ["Madhubani Art", "Natural Pigments", "Wall Paintings"]
  },
  {
    id: "6",
    name: "Abdul Rahman",
    specialty: "Stone Inlay Work",
    location: "Agra, Uttar Pradesh",
    experience: "25 years",
    rating: 4.7,
    products: 25,
    image: artisan2,
    avatar: artisanAvatar6,
    description: "Master craftsman in Pietra Dura stone inlay work, carrying forward a family tradition of 4 generations. Expert in creating intricate marble masterpieces.",
    achievements: ["Heritage Craft Award", "Master Artisan", "Taj Mahal Restoration Team"],
    joinedYear: "2018",
    specialties: ["Pietra Dura", "Marble Inlay", "Semi-precious Stones"]
  },
  {
    id: "7",
    name: "Shankar Baghel",
    specialty: "Dhokra Metal Casting",
    location: "Bastar, Chhattisgarh",
    experience: "30 years",
    rating: 4.8,
    products: 12,
    image: artisan3,
    avatar: artisanAvatar7,
    description: "Traditional Dhokra artist from tribal community, expert in lost-wax metal casting. His work represents the ancient tribal art traditions of Central India.",
    achievements: ["Tribal Art Honor", "Traditional Craft Excellence", "Cultural Preservation Award"],
    joinedYear: "2020",
    specialties: ["Lost-wax Casting", "Bronze Art", "Tribal Figurines"]
  },
  {
    id: "8",
    name: "Padma Mohapatra",
    specialty: "Ikat Weaving",
    location: "Sambalpur, Odisha",
    experience: "25 years",
    rating: 4.9,
    products: 11,
    image: artisan4,
    avatar: artisanAvatar8,
    description: "Master weaver specializing in traditional Ikat technique with 25+ years experience. Known for creating the finest silk sarees with intricate geometric patterns.",
    achievements: ["Master Weaver Award", "Export Excellence", "Traditional Craft Honor"],
    joinedYear: "2017",
    specialties: ["Ikat Technique", "Silk Weaving", "Geometric Patterns"]
  }
];

const Artisans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Meet Our Artisans</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the talented craftspeople behind our beautiful products. Each artisan brings decades of experience 
            and passion to their craft, preserving ancient traditions while creating contemporary masterpieces.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">200+</div>
            <div className="text-sm text-muted-foreground">Skilled Artisans</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">28</div>
            <div className="text-sm text-muted-foreground">States Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">65+</div>
            <div className="text-sm text-muted-foreground">Craft Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">18+</div>
            <div className="text-sm text-muted-foreground">Avg. Experience</div>
          </div>
        </div>

        {/* Featured Artisans */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Featured Artisans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artisans.map(artisan => (
              <ArtisanProfile key={artisan.id} artisan={artisan} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Want to Join Our Artisan Community?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If you're a skilled craftsperson looking to share your creations with the world, 
            we'd love to hear from you. Join our community of artisans and reach customers globally.
          </p>
          <Button className="btn-hero">
            Apply to Become an Artisan
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Artisans;