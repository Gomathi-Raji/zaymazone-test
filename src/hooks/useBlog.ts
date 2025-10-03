import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api';

export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: Author;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  readTime: string;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export const useBlogPosts = (filters: BlogFilters = {}) => {
  const [data, setData] = useState<BlogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.tag) queryParams.append('tag', filters.tag);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());

        const url = `${API_BASE_URL}/blog${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [filters.category, filters.tag, filters.search, filters.page, filters.limit, filters.featured]);

  return { data, loading, error };
};

export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/blog/${slug}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch blog post: ${response.statusText}`);
        }

        const result = await response.json();
        setPost(result);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  return { post, loading, error };
};

export const useFeaturedBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/blog/featured`);

        if (!response.ok) {
          throw new Error(`Failed to fetch featured posts: ${response.statusText}`);
        }

        const result = await response.json();
        setPosts(result);
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch featured posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  return { posts, loading, error };
};

export const useBlogCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/blog/categories`);

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const result = await response.json();
        setCategories(result);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useBlogTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/blog/tags`);

        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.statusText}`);
        }

        const result = await response.json();
        setTags(result);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
};

// Blog actions
export const likeBlogPost = async (postId: string): Promise<{ success: boolean; likes: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }

    const result = await response.json();
    return { success: true, likes: result.likes };
  } catch (error) {
    console.error('Error liking post:', error);
    return { success: false, likes: 0 };
  }
};

export const getRelatedPosts = async (postId: string): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}/related`);

    if (!response.ok) {
      throw new Error('Failed to fetch related posts');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
};