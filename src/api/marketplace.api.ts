import { apiClient } from './axios';
import type { ApiResponse, Product } from '@/types';

export const marketplaceApi = {
  getProducts: (params?: any) =>
    apiClient.get<any, ApiResponse<Product[]>>(
      '/api/marketplace/products/',
      { params }
    ),

  getProduct: (productId: string) =>
    apiClient.get<any, ApiResponse<Product>>(
      `/api/marketplace/products/${productId}/`
    ),

  getCategories: () =>
    apiClient.get('/api/marketplace/categories/'),

  searchProducts: (query: string) =>
    apiClient.get('/api/marketplace/search/', {
      params: { query },
    }),

  trackView: (productId: string) =>
    apiClient.post('/api/marketplace/views/', {
      product_id: productId,
    }),

  toggleWishlist: (productId: string) =>
    apiClient.post('/api/marketplace/wishlist/', {
      product_id: productId,
    }),
};