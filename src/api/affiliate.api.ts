import { apiClient } from './axios';
import type { ApiResponse } from '@/types';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'product';
  price: number;
  commission_percent: number;
  location: string;
  seller_name: string;
  seller_avatar: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  image_url: string;
}

export interface Earnings {
  total: number;
  pending: number;
  withdrawable: number;
}

export const affiliateApi = {
  getCampaigns: () => 
    apiClient.get<any, ApiResponse<Campaign[]>>('/api/affiliate/campaigns/'),
    
  getEarnings: () => 
    apiClient.get<any, ApiResponse<Earnings>>('/api/affiliate/earnings/'),
    
  generateLink: (productId: string) => 
    apiClient.post<any, ApiResponse<{ affiliate_link: string }>>('/api/affiliate/generate-link/', { product_id: productId }),
    
  submitComment: (campaignId: string, text: string) =>
    apiClient.post<any, ApiResponse<void>>(`/api/affiliate/campaigns/${campaignId}/comments/`, { text }),
    
  getComments: (campaignId: string) =>
    apiClient.get<any, ApiResponse<any[]>>(`/api/affiliate/campaigns/${campaignId}/comments/`),
};
