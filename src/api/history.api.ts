import { apiClient } from './axios';
import { ApiResponse } from '../types';

export interface HistoryItem {
  id: string;
  type:
  | 'marketplace'
  | 'wallet'
  | 'affiliate'
  | 'event'
  | 'ticket'
  | 'system';
  title: string;
  image: string;
  amount: number;
  quantity?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  details: any;
}

export const historyApi = {
  getHistory: (params: { type?: string; status?: string; search?: string }) => 
    apiClient.get<any, ApiResponse<HistoryItem[]>>('/api/activity/history/', { params }),
};
