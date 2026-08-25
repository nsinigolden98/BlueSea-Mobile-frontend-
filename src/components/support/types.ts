export interface SupportMessage {
  id: number;
  sender_name: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  priority: string;
  images?: File[];
}

export interface SendMessagePayload {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: SupportMessage;
  error?: string;
}
