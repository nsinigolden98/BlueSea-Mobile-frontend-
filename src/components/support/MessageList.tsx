import React from 'react';
import { SupportTicket } from './types';
import { MessageBubble } from './MessageBubble';
import { formatSupportTimestamp } from './utils';

interface MessageListProps {
  ticket: SupportTicket;
}

export const MessageList: React.FC<MessageListProps> = ({ ticket }) => {
  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Initial Customer Request Card */}
      <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 mb-6">
        <div className="flex items-center justify-between text-xs text-sky-800 dark:text-sky-300 font-semibold mb-1">
          <span>Original Request</span>
          <span className="font-normal text-slate-400 dark:text-slate-500">
            {formatSupportTimestamp(ticket.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Messages Stream */}
      {ticket.messages && ticket.messages.length > 0 ? (
        ticket.messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      ) : (
        <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
          No additional messages yet. Our team will review your request shortly.
        </div>
      )}
    </div>
  );
};
