import { postRequest, getRequest } from '@/types';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  verification_type: string;
  helper: string;
  label?: string;
  placeholder?: string;
  status: string;
}

export interface VerifiedUser {
  name: string;
  identifier: string;
}

export interface PaymentRequest {
  partner: string;
  identifier: string;
  amount: number;
  pin: string;
}

export interface TransactionResponse {
  success: boolean;
  status: string;
  reference: string;
  amount: number;
  message?: string;
}

export const connectApi = {
  fetchPartners: async (): Promise<Partner[]> => {
    try {
      const response = await getRequest('/api/v1/connect/partners');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  verifyUser: async (partner: string, identifier: string): Promise<VerifiedUser | null> => {
    try {
      const response = await postRequest('/api/v1/connect/verify', { partner, identifier });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  },

  pay: async (payload: PaymentRequest): Promise<TransactionResponse> => {
    try {
      return await postRequest('/api/v1/connect/pay', payload);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
};
