import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types';

interface WalletBalance {
  balance: number;
  currency: string;
}

export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => apiClient.get<any, ApiResponse<WalletBalance>>('/api/wallet/balance/'),
  });
};
