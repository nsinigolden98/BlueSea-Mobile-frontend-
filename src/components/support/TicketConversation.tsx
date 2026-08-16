import React from 'react';
import { SupportTicket } from './types';
import { TicketHeader } from './TicketHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';

interface TicketConversationProps {
  ticket: SupportTicket;
  isSending: boolean;
  onSendMessage: (messageText: string) => Promise<boolean>;
  onBack?: () => void;
  showBackButton?: boolean;
  onStartNewTicket?: () => void;
}

export const TicketConversation: React.FC<TicketConversationProps> = ({
  ticket,
  isSending,
  onSendMessage,
  onBack,
  showBackButton = false,
  onStartNewTicket,
}) => {
  const isClosed = ticket.status.toLowerCase() === 'closed';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <TicketHeader
        ticket={ticket}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <MessageList ticket={ticket} />
      </div>

      <MessageComposer
        isClosed={isClosed}
        isSending={isSending}
        onSendMessage={onSendMessage}
        onStartNewTicket={onStartNewTicket}
      />
    </div>
  );
};
