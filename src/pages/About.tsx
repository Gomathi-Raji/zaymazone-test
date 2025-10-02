import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, Leaf, Award, Target } from "lucide-react";
import { getImageUrl } from "@/lib/api";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">About ZAYMAZONE</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We're on a mission to preserve India's rich cultural heritage by connecting 
            skilled artisans with global customers who appreciate authentic, handcrafted beauty.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-primary/20">
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To empower traditional artisans by providing them with a global platform to showcase 
                their craft, while preserving ancient techniques and ensuring fair compensation for their 
                extraordinary skills and dedication.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become the world's most trusted marketplace for authentic Indian handicrafts, 
                where every purchase contributes to the preservation of cultural heritage and 
                sustainable livelihoods for artisan communities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">The Beginning</h3>
                <p className="text-muted-foreground">
                  Founded in 2020 with a passion for preserving India's artistic traditions 
                  and supporting rural artisan communities.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Growing Together</h3>
                <p className="text-muted-foreground">
                  We've partnered with over 150 artisans across 25 states, 
                  creating sustainable livelihoods and preserving cultural heritage.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Impact</h3>
                <p className="text-muted-foreground">
                  Today, we ship authentic Indian crafts worldwide, 
                  bringing the beauty of traditional art to global customers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  Every product is 100% handcrafted using traditional techniques
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Fair Trade</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring artisans receive fair compensation for their work
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Sustainability</h3>
                <p className="text-sm text-muted-foreground">
                  Supporting eco-friendly practices and sustainable materials
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Rigorous quality checks ensure only the finest crafts reach you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="bg-primary/5 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">Artisans Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25</div>
              <div className="text-sm text-muted-foreground">States Reached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">₹50L+</div>
              <div className="text-sm text-muted-foreground">Artisan Earnings</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src={getImageUrl('team1.jpg')} 
                    alt="Harishwaran"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">Harishwaran P</h3>
                <p className="text-primary text-sm mb-2">Chief Executive Officer</p>
                <p className="text-xs text-muted-foreground">
                  Chief Executive Officer with a vision to empower artisans and preserve heritage
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src={getImageUrl('team2.png')}
                    alt="Jayamurugan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">Jayamurugan V</h3>
                <p className="text-primary text-sm mb-2">Founder & CEO</p>
                <p className="text-xs text-muted-foreground">
                  Founder with a passion for traditional crafts and sustainable development
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src={getImageUrl('team3.jpg')} 
                    alt="Dinesh"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">Dinesh S</h3>
                <p className="text-primary text-sm mb-2">Chief Technology Officer</p>
                <p className="text-xs text-muted-foreground">
                  CTO driving tech innovations to connect artisans with the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-12">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Join Our Journey
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're an artisan, a customer, or someone who believes in preserving cultural heritage, 
            there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero">
              Shop Authentic Crafts
            </Button>
            <Button variant="outline">
              Become an Artisan Partner
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;