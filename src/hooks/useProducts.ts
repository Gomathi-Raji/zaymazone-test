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
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

  const queryString = queryParams.toString();
  // Use relative path in development (Vite proxy), else use configured backend URL
  const host = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
  const url = `${host}${import.meta.env.DEV ? '/api' : ''}/products${queryString ? `?${queryString}` : ''}`;

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
  // Use relative path in development (Vite proxy), else use configured backend URL
  const host = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`${host}${import.meta.env.DEV ? '/api' : ''}/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!id,
  });
};