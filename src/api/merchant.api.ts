import { apiClient } from './axios';
import { ApiResponse, Product } from '../types';

export const merchantApi = {
  getProducts: () => 
    apiClient.get<any, ApiResponse<Product[]>>('/api/merchant/products/'),
    
  createProduct: (payload: FormData) => 
    apiClient.post<any, ApiResponse<Product>>('/api/marketplace/products/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (productId: string, payload: FormData) => 
    apiClient.patch<any, ApiResponse<Product>>(`/api/marketplace/products/${productId}/`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProduct: (productId: string) => 
    apiClient.delete<any, ApiResponse<void>>(`/api/marketplace/products/${productId}/`),

  // Location endpoints for form selection
  getStates: () => 
    apiClient.get<any, ApiResponse<{ name: string }[]>>('/api/locations/states/'),
    
  getLgas: (state: string) => 
    apiClient.get<any, ApiResponse<{ name: string }[]>>(`/api/locations/lgas/?state=${state}`),
};
