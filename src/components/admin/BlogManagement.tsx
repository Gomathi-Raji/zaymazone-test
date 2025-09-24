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
  Calendar,
  User,
  MessageSquare,
  Heart,
  TrendingUp
} from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Art of Blue Pottery: A Rajasthani Legacy",
    author: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    category: "Pottery",
    status: "Published",
    publishDate: "2024-01-15",
    views: 1247,
    likes: 89,
    comments: 23,
    excerpt: "Discover the rich history and intricate techniques behind Rajasthan's famous blue pottery tradition...",
    featured: true
  },
  {
    id: 2,
    title: "Sustainable Crafting: Eco-Friendly Materials in Modern Art",
    author: "Dr. Meera Devi",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    category: "Sustainability",
    status: "Published",
    publishDate: "2024-01-12",
    views: 892,
    likes: 67,
    comments: 18,
    excerpt: "Exploring how traditional artisans are adopting eco-friendly materials and sustainable practices...",
    featured: false
  },
  {
    id: 3,
    title: "Dhokra Metal Casting: Ancient Technique, Timeless Beauty",
    author: "Rajesh Kumar",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    category: "Metal Crafts",
    status: "Draft",
    publishDate: null,
    views: 0,
    likes: 0,
    comments: 0,
    excerpt: "Learn about the 4000-year-old lost-wax casting technique that creates stunning metal artifacts...",
    featured: false
  },
  {
    id: 4,
    title: "From Loom to Life: The Story of Handwoven Textiles",
    author: "Anita Verma",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    category: "Textiles",
    status: "Review",
    publishDate: null,
    views: 0,
    likes: 0,
    comments: 0,
    excerpt: "Journey through India's rich textile heritage and the stories woven into every thread...",
    featured: false
  },
  {
    id: 5,
    title: "Digital Age Meets Ancient Craft: E-commerce for Artisans",
    author: "Vikram Singh",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    category: "Business",
    status: "Scheduled",
    publishDate: "2024-01-25",
    views: 0,
    likes: 0,
    comments: 0,
    excerpt: "How traditional artisans are leveraging digital platforms to reach global markets...",
    featured: true
  }
];

export function BlogManagement() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Published": return "default";
      case "Draft": return "secondary";
      case "Review": return "outline";
      case "Scheduled": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Blog Management</CardTitle>
          <CardDescription>Manage blog posts and content</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Categories</Button>
        </div>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="flex items-start justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-medium text-foreground text-lg">{post.title}</h3>
                  {post.featured && (
                    <Badge variant="destructive">Featured</Badge>
                  )}
                  <Badge variant={getStatusVariant(post.status)}>
                    {post.status}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.authorAvatar} alt={post.author} />
                      <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {post.publishDate 
                        ? new Date(post.publishDate).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </span>
                  </div>
                  
                  <Badge variant="outline">{post.category}</Badge>
                </div>
                
                {post.status === 'Published' && (
                  <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments} comments</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>Trending</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
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