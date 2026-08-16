import React from 'react';
import { SupportTicket } from './types';
import { getStatusBadgeStyle, formatStatusLabel, getPriorityBadgeStyle } from './utils';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketHeaderProps {
  ticket: SupportTicket;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const TicketHeader: React.FC<TicketHeaderProps> = ({
  ticket,
  onBack,
  showBackButton = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/90 border-b border-slate-100 dark:border-slate-800 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={onBack}
              type="button"
              className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
            #{ticket.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('text-xs uppercase tracking-wider', getPriorityBadgeStyle(ticket.priority))}>
            {ticket.priority}
          </span>
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', getStatusBadgeStyle(ticket.status))}>
            {formatStatusLabel(ticket.status)}
          </span>
        </div>
      </div>

      <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
        {ticket.subject}
      </h2>
    </div>
  );
};
