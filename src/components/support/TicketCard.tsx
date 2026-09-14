import React from 'react';
import type { SupportTicket } from './types';
import { formatSupportTimestamp, getStatusBadgeStyle, formatStatusLabel, getPriorityBadgeStyle } from './utils';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: SupportTicket;
  isSelected?: boolean;
  onClick: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onClick }) => {
  const latestMessage = ticket.messages && ticket.messages.length > 0
    ? ticket.messages[ticket.messages.length - 1]
    : null;

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'w-full text-left p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between relative group',
        isSelected
          ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 shadow-sm'
          : 'bg-white dark:bg-slate-800/90 border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-sm'
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
            #{ticket.id}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn('text-[11px] uppercase tracking-wider', getPriorityBadgeStyle(ticket.priority))}>
              {ticket.priority}
            </span>
            <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-medium border', getStatusBadgeStyle(ticket.status))}>
              {formatStatusLabel(ticket.status)}
            </span>
          </div>
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {ticket.subject}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {latestMessage ? latestMessage.message : ticket.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {latestMessage ? (latestMessage.is_admin ? 'Support replied' : 'You replied') : 'Created'}
        </span>
        <div className="flex items-center gap-1">
          <span>{formatSupportTimestamp(latestMessage ? latestMessage.created_at : ticket.created_at)}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
};
