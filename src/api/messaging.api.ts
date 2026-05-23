import { apiClient } from './axios';
import { ApiResponse } from '../types';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'user';
  is_verified: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  order?: {
    id: string;
    status: string;
  };
  last_message: string;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  text?: string;
  image_url?: string;
  sender_id: string;
  is_mine: boolean;
  role: 'buyer' | 'seller' | 'system';
  timestamp: string;
  status: MessageStatus;
  reply_to?: string;
}

export const messagingApi = {
  getConversations: () => 
    apiClient.get<any, ApiResponse<Conversation[]>>('/api/messaging/conversations/'),
    
  createConversation: (payload: { product_id?: string; seller_id?: string; user_id?: string }) => 
    apiClient.post<any, ApiResponse<{ conversation_id: string }>>('/api/messaging/conversations/', payload),

  getMessages: (conversationId: string, page = 1) => 
    apiClient.get<any, ApiResponse<Message[]>>(`/api/messaging/messages/${conversationId}/?page=${page}`),
    
  sendMessage: (payload: FormData) => 
    apiClient.post<any, ApiResponse<Message>>('/api/messaging/messages/send/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  markAsRead: (conversationId: string) => 
    apiClient.post<any, ApiResponse<void>>('/api/messaging/read/', { conversation_id: conversationId }),
};
