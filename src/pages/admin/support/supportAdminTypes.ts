export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AdminAttachment {
  id?: number | string;
  url: string;
  name?: string;
}

export interface AdminMessage {
  id: number;
  sender_name?: string;
  message: string;
  is_admin?: boolean;
  created_at: string;
  attachments?: AdminAttachment[];
}

export interface AdminSupportTicket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  messages: AdminMessage[];
  user_name: string;
  user_email: string;
  message_count: number;
}

export interface AdminTicketPatch {
  status?: TicketStatus;
  priority?: TicketPriority;
}
