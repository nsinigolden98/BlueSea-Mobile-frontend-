import React from 'react';
import type { SupportTicket } from './types';
import { TicketHeader } from './TicketHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';

interface TicketConversationProps {
  ticket: SupportTicket | null;
  isLoading?: boolean;
  isSending: boolean;
  onSendMessage: (messageText: string, images?: File[]) => Promise<boolean>;
  onBack?: () => void;
  showBackButton?: boolean;
  onStartNewTicket?: () => void;
}

export const TicketConversation: React.FC<TicketConversationProps> = ({
  ticket,
  isLoading = false,
  isSending,
  onSendMessage,
  onBack,
  showBackButton = false,
  onStartNewTicket,
}) => {
  if (isLoading && !ticket) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-0">
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-between">
          <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-hidden">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse space-y-2">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="flex flex-col items-start max-w-[70%] space-y-1">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="flex flex-col items-end ml-auto max-w-[70%] space-y-1">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-sky-200 dark:bg-sky-900/40 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status ? ticket.status.toLowerCase() === 'closed' : false;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-0">
      <TicketHeader
        ticket={ticket}
        onBack={onBack}
        showBackButton={showBackButton}
      />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 relative">
        {isLoading ? (
          <div className="p-4 md:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex flex-col items-start max-w-[70%] space-y-1">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
            <div className="flex flex-col items-end ml-auto max-w-[70%] space-y-1">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-10 w-full bg-sky-200 dark:bg-sky-900/40 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : (
          <MessageList ticket={ticket} />
        )}
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
