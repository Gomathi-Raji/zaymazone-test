import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/api';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt' | 'salesCount';
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.q) queryParams.append('q', params.q);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

  const queryString = queryParams.toString();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const url = `${apiUrl}/api/products${queryString ? `?${queryString}` : ''}`;

  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
};

export const useProduct = (id: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!id,
  });
};