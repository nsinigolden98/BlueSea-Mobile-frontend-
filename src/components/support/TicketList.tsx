import React from 'react';
import type { SupportTicket } from './types';
import { TicketCard } from './TicketCard';
import { Headphones, MessageSquarePlus } from 'lucide-react';

interface TicketListProps {
  tickets: SupportTicket[];
  loading: boolean;
  selectedTicketId?: number | null;
  onSelectTicket: (ticketId: number) => void;
  onStartConversation: () => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  loading,
  selectedTicketId,
  onSelectTicket,
  onStartConversation,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded mb-3" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto mb-4">
          <Headphones className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
          No conversations yet
        </h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          When you contact BlueSea Mobile Support, your support conversations will appear here.
        </p>
        <button
          onClick={onStartConversation}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Start a conversation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedTicketId === ticket.id}
          onClick={() => onSelectTicket(ticket.id)}
        />
      ))}
    </div>
  );
};
