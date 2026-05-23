import { apiClient } from './axios';
import { ApiResponse, OrderPreview } from '../types';

export const ordersApi = {
  createOrder: (payload: { 
    product_id: string; 
    quantity: number; 
    delivery_address: any; 
    delivery_type: string;
    referral_code?: string;
  }) => 
    apiClient.post<any, ApiResponse<OrderPreview>>('/api/orders/create/', payload),

  payOrder: (payload: { order_id: string; wallet_pin: string }) => 
    apiClient.post<any, ApiResponse<any>>('/api/orders/pay/', payload),

  getOrderTracking: (orderId: string) => 
    apiClient.get<any, ApiResponse<any>>(`/api/orders/tracking/${orderId}/`),
};
