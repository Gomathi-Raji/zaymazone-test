import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, User, Search, ArrowRight, MessageSquare, Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogSearch } from "@/components/BlogSearch";

// Blog images
import blogBluePottery from "@/assets/blog-blue-pottery.jpg";
import blogHandloom from "@/assets/blog-handloom.jpg";
import blogDhokra from "@/assets/blog-dhokra.jpg";
import blogSustainability from "@/assets/blog-sustainability.jpg";
import blogEconomics from "@/assets/blog-economics.jpg";
import blogInnovation from "@/assets/blog-innovation.jpg";

// Author avatars
import authorPriya from "@/assets/author-priya.jpg";
import authorRajesh from "@/assets/author-rajesh.jpg";
import authorMeera from "@/assets/author-meera.jpg";
import authorAnita from "@/assets/author-anita.jpg";
import authorVikram from "@/assets/author-vikram.jpg";
import authorKavya from "@/assets/author-kavya.jpg";

const blogPosts = [
  {
    id: 1,
    title: "The Art of Blue Pottery: A Journey Through Rajasthan's Most Prized Craft",
    excerpt: "Discover the centuries-old tradition of blue pottery making in Jaipur, from its Persian origins to modern-day artisans keeping the craft alive.",
    content: "Blue pottery, with its distinctive cobalt blue and white aesthetic, has been a cornerstone of Rajasthani craftsmanship for over 400 years...",
    author: {
      name: "Priya Sharma",
      avatar: authorPriya,
      role: "Craft Historian"
    },
    category: "Traditional Crafts",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    featured: true,
    image: blogBluePottery,
    likes: 247,
    comments: 18
  },
  {
    id: 2,
    title: "Preserving Handloom Traditions: The Weavers of Bengal",
    excerpt: "Meet the master weavers who continue to create stunning handloom textiles using techniques passed down through generations.",
    content: "In the villages of West Bengal, the rhythmic sound of handlooms continues to echo through narrow lanes...",
    author: {
      name: "Rajesh Kumar",
      avatar: authorRajesh, 
      role: "Cultural Researcher"
    },
    category: "Textiles",
    date: "Jan 12, 2024",
    readTime: "6 min read",
    featured: true,
    image: blogHandloom,
    likes: 189,
    comments: 12
  },
  {
    id: 3,
    title: "The Revival of Dhokra Art: Metal Casting in Modern Times",
    excerpt: "How traditional Dhokra metal casting is finding new life through contemporary designs and global appreciation.",
    content: "Dhokra, the ancient art of metal casting using the lost-wax technique, has been practiced in India for over 4000 years...",
    author: {
      name: "Meera Devi",
      avatar: authorMeera,
      role: "Art Curator"
    },
    category: "Metal Crafts",
    date: "Jan 10, 2024", 
    readTime: "5 min read",
    featured: false,
    image: blogDhokra,
    likes: 156,
    comments: 9
  },
  {
    id: 4,
    title: "Sustainable Crafting: How Traditional Arts Support Environmental Conservation",
    excerpt: "Exploring how traditional crafts contribute to sustainable living and environmental conservation through eco-friendly practices.",
    content: "Traditional crafts have always been inherently sustainable, using natural materials and time-tested techniques...",
    author: {
      name: "Dr. Anita Verma",
      avatar: authorAnita,
      role: "Sustainability Expert"
    },
    category: "Sustainability",
    date: "Jan 8, 2024",
    readTime: "7 min read", 
    featured: false,
    image: blogSustainability,
    likes: 203,
    comments: 15
  },
  {
    id: 5,
    title: "The Economics of Craft: Supporting Artisan Communities",
    excerpt: "Understanding the economic impact of purchasing traditional crafts and how it directly supports rural artisan communities.",
    content: "When you purchase a handcrafted item, you're not just buying a product – you're investing in a community...",
    author: {
      name: "Vikram Singh",
      avatar: authorVikram,
      role: "Economic Analyst"
    },
    category: "Community Impact",
    date: "Jan 5, 2024",
    readTime: "6 min read",
    featured: false,
    image: blogEconomics,
    likes: 178,
    comments: 11
  },
  {
    id: 6,
    title: "Modern Interpretations of Ancient Crafts: Where Tradition Meets Innovation",
    excerpt: "How contemporary artisans are reimagining traditional crafts for modern homes while preserving cultural essence.",
    content: "The challenge for modern artisans lies in balancing respect for tradition with the demands of contemporary aesthetics...",
    author: {
      name: "Kavya Patel",
      avatar: authorKavya,
      role: "Design Researcher"
    },
    category: "Innovation",
    date: "Jan 3, 2024",
    readTime: "9 min read",
    featured: false,
    image: blogInnovation,
    likes: 234,
    comments: 16
  }
];

const categories = [
  "All",
  "Traditional Crafts", 
  "Textiles",
  "Metal Crafts",
  "Sustainability",
  "Community Impact",
  "Innovation"
];

const Blog = () => {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Stories from the Craft World</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the rich heritage, artisan stories, and cultural significance behind India's traditional crafts. 
            Explore the intersection of tradition and modernity in our craft community.
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <BlogSearch
          posts={blogPosts}
          categories={categories}
          onFilterChange={(filtered) => {
            // This could be used to update the displayed posts
            console.log('Filtered posts:', filtered.length);
          }}
        />

        {/* Featured Posts */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Featured Stories</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">{post.author.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-sm">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="text-xs">{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{post.author.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blog/${post.id}`}>
                        Read More
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Stay Updated with Craft Stories
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest stories, artisan features, and craft insights 
            delivered to your inbox every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;